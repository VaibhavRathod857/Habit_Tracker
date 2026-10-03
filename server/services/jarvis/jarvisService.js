import { Conversation } from '../../models/Conversation.js';
import { Message } from '../../models/Message.js';
import { User } from '../../models/User.js';
import { buildJarvisContext } from './jarvisContext.js';
import { jarvisMemoryService } from './jarvisMemory.js';
import { JARVIS_TOOLS_SCHEMA, jarvisToolRegistry } from './jarvisTools.js';
import { getActiveAIProvider } from './providers/index.js';
import { FallbackProvider } from './providers/FallbackProvider.js';
import { JARVIS_SYSTEM_PROMPT, buildJarvisPromptContext } from './jarvisPrompts.js';

export const jarvisService = {
  /**
   * Non-streaming conversational chat
   */
  async sendMessage(userId, { conversationId, content, clientContext = {} }) {
    if (!content || !content.trim()) {
      throw new Error('Message content cannot be empty');
    }

    // 1. Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, user: userId });
    }

    if (!conversation) {
      let defaultTitle = content.trim().slice(0, 35);
      if (content.length > 35) defaultTitle += '...';
      conversation = await Conversation.create({
        user: userId,
        title: defaultTitle,
      });
    }

    // 2. Persist user message
    const userMessage = await Message.create({
      conversation: conversation._id,
      user: userId,
      role: 'user',
      content: content.trim(),
    });

    // 3. Extract & persist conversational memory if enabled
    await jarvisMemoryService.extractAndStoreConversationalMemories(userId, content);

    // 4. Retrieve minimal relevant context
    const contextData = await buildJarvisContext(userId, content, clientContext);
    const systemPrompt = `${JARVIS_SYSTEM_PROMPT}\n\n${buildJarvisPromptContext(contextData, clientContext)}`;

    // 5. Load recent conversation history (multi-turn memory)
    const historyMessages = await Message.find({ conversation: conversation._id })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean();

    const formattedMessages = historyMessages.map((m) => ({
      role: m.role,
      content: m.content,
      toolCalls: m.toolCalls,
    }));

    // 6. Call active AI provider with resilient fallback
    const provider = getActiveAIProvider();
    let aiResponse;
    try {
      aiResponse = await provider.chat({
        messages: formattedMessages,
        tools: JARVIS_TOOLS_SCHEMA,
        systemPrompt,
      });
    } catch (providerErr) {
      console.warn(`[JARVIS Provider Resilience] ${providerErr.message}. Falling back to local intelligence.`);
      const fallback = new FallbackProvider();
      aiResponse = await fallback.chat({
        messages: formattedMessages,
        tools: JARVIS_TOOLS_SCHEMA,
        systemPrompt,
      });
    }

    let assistantContent = aiResponse.content || '';
    const actions = [];
    let widget = null;

    // 7. Handle tool calls
    if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
      for (const tc of aiResponse.toolCalls) {
        const schema = JARVIS_TOOLS_SCHEMA.find((s) => s.name === tc.name);
        const isMutating = schema ? schema.isMutating : false;

        if (isMutating) {
          // Mutating actions require confirmation
          actions.push({
            id: tc.id || `action_${Date.now()}`,
            label: `Confirm: ${tc.name}`,
            actionType: tc.name,
            payload: tc.args,
            variant: 'primary',
            isConfirmed: false,
            isExecuted: false,
          });

          // Add widget preview for proposals
          if (tc.name === 'createHabit') {
            widget = {
              widgetType: 'habit_proposal',
              title: 'Proposed Habit',
              data: tc.args,
            };
          } else if (tc.name === 'activateRecoveryMode') {
            widget = {
              widgetType: 'recovery_plan',
              title: 'Proposed Recovery Protocol',
              data: tc.args,
            };
          } else if (tc.name === 'createPersonalRule') {
            widget = {
              widgetType: 'rule_card',
              title: 'Proposed Personal Rule',
              data: tc.args,
            };
          } else if (tc.name === 'createHabitStack') {
            widget = {
              widgetType: 'stack_card',
              title: 'Proposed Habit Stack',
              data: tc.args,
            };
          }
        } else {
          // Read-only tool executes immediately
          const handler = jarvisToolRegistry[tc.name];
          if (handler) {
            const toolResult = await handler(userId, tc.args || {});

            // If assistantContent was empty, execute second turn with tool output
            if (!assistantContent.trim() && provider.isConfigured()) {
              formattedMessages.push({
                role: 'assistant',
                toolCalls: [tc],
              });
              formattedMessages.push({
                role: 'tool',
                tool_call_id: tc.id,
                name: tc.name,
                content: JSON.stringify(toolResult),
              });

              const followUp = await provider.chat({
                messages: formattedMessages,
                systemPrompt,
              });
              assistantContent = followUp.content;
            } else if (!assistantContent.trim()) {
              assistantContent = JSON.stringify(toolResult, null, 2);
            }

            // If focus session started, add direct action button
            if (tc.name === 'startFocusSession') {
              actions.push({
                id: `focus_${Date.now()}`,
                label: `Start ${tc.args.durationMinutes || 25}-Min Session`,
                actionType: 'start_focus',
                payload: tc.args,
                variant: 'primary',
              });
            }
          }
        }
      }
    }

    if (!assistantContent) {
      assistantContent = "I'm with you. How can I help you take the next step?";
    }

    // 8. Persist assistant message
    const assistantMessage = await Message.create({
      conversation: conversation._id,
      user: userId,
      role: 'assistant',
      content: assistantContent,
      actions,
      widget,
      toolCalls: aiResponse.toolCalls || [],
    });

    // 9. Update conversation metadata
    conversation.lastMessageAt = new Date();
    conversation.messageCount = (conversation.messageCount || 0) + 2;
    await conversation.save();

    return {
      conversation: {
        id: conversation._id.toString(),
        title: conversation.title,
      },
      userMessage: {
        id: userMessage._id.toString(),
        role: 'user',
        content: userMessage.content,
        createdAt: userMessage.createdAt,
      },
      assistantMessage: {
        id: assistantMessage._id.toString(),
        role: 'assistant',
        content: assistantMessage.content,
        actions: assistantMessage.actions,
        widget: assistantMessage.widget,
        createdAt: assistantMessage.createdAt,
      },
    };
  },

  /**
   * Real-time Server-Sent Events (SSE) streaming chat
   */
  async streamChat({ userId, conversationId, content, clientContext = {}, onToken, onActionProposal, onDone, onError }) {
    try {
      if (!content || !content.trim()) {
        throw new Error('Message content cannot be empty');
      }

      let conversation;
      if (conversationId) {
        conversation = await Conversation.findOne({ _id: conversationId, user: userId });
      }

      if (!conversation) {
        let defaultTitle = content.trim().slice(0, 35);
        if (content.length > 35) defaultTitle += '...';
        conversation = await Conversation.create({
          user: userId,
          title: defaultTitle,
        });
      }

      const userMessage = await Message.create({
        conversation: conversation._id,
        user: userId,
        role: 'user',
        content: content.trim(),
      });

      await jarvisMemoryService.extractAndStoreConversationalMemories(userId, content);

      const contextData = await buildJarvisContext(userId, content, clientContext);
      const systemPrompt = `${JARVIS_SYSTEM_PROMPT}\n\n${buildJarvisPromptContext(contextData, clientContext)}`;

      const historyMessages = await Message.find({ conversation: conversation._id })
        .sort({ createdAt: 1 })
        .limit(10)
        .lean();

      const formattedMessages = historyMessages.map((m) => ({
        role: m.role,
        content: m.content,
        toolCalls: m.toolCalls,
      }));

      const provider = getActiveAIProvider();
      let streamedContent = '';
      const actions = [];
      let widget = null;

      let aiResponse;
      try {
        aiResponse = await provider.streamChat({
          messages: formattedMessages,
          tools: JARVIS_TOOLS_SCHEMA,
          systemPrompt,
          onToken: (chunk) => {
            streamedContent += chunk;
            if (onToken) onToken(chunk);
          },
        });
      } catch (providerErr) {
        console.warn(`[JARVIS Stream Resilience] ${providerErr.message}. Falling back to local streaming intelligence.`);
        const fallback = new FallbackProvider();
        aiResponse = await fallback.streamChat({
          messages: formattedMessages,
          tools: JARVIS_TOOLS_SCHEMA,
          systemPrompt,
          onToken: (chunk) => {
            streamedContent += chunk;
            if (onToken) onToken(chunk);
          },
        });
      }

      // Handle tool calls
      if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
        for (const tc of aiResponse.toolCalls) {
          const schema = JARVIS_TOOLS_SCHEMA.find((s) => s.name === tc.name);
          const isMutating = schema ? schema.isMutating : false;

          if (isMutating) {
            const actionObj = {
              id: tc.id || `action_${Date.now()}`,
              label: `Confirm: ${tc.name}`,
              actionType: tc.name,
              payload: tc.args,
              variant: 'primary',
            };
            actions.push(actionObj);
            if (onActionProposal) onActionProposal(actionObj);

            if (tc.name === 'createHabit') {
              widget = { widgetType: 'habit_proposal', title: 'Proposed Habit', data: tc.args };
            } else if (tc.name === 'activateRecoveryMode') {
              widget = { widgetType: 'recovery_plan', title: 'Proposed Recovery Protocol', data: tc.args };
            } else if (tc.name === 'createPersonalRule') {
              widget = { widgetType: 'rule_card', title: 'Proposed Personal Rule', data: tc.args };
            } else if (tc.name === 'createHabitStack') {
              widget = { widgetType: 'stack_card', title: 'Proposed Habit Stack', data: tc.args };
            }
          } else {
            const handler = jarvisToolRegistry[tc.name];
            if (handler) {
              const res = await handler(userId, tc.args || {});
              if (!streamedContent.trim() && provider.isConfigured()) {
                formattedMessages.push({
                  role: 'assistant',
                  toolCalls: [tc],
                });
                formattedMessages.push({
                  role: 'tool',
                  tool_call_id: tc.id,
                  name: tc.name,
                  content: typeof res === 'object' ? res : { result: res },
                });

                try {
                  await provider.streamChat({
                    messages: formattedMessages,
                    tools: JARVIS_TOOLS_SCHEMA,
                    systemPrompt,
                    onToken: (chunk) => {
                      streamedContent += chunk;
                      if (onToken) onToken(chunk);
                    },
                  });
                } catch (followUpErr) {
                  console.warn('[JARVIS Stream Follow-up Error]', followUpErr.message);
                }
              }
            }
          }
        }
      }

      if (!streamedContent.trim()) {
        if (actions.length > 0) {
          streamedContent = "I have drafted the action plan above for your review. Take a look and confirm whenever you're ready to lock it in.";
        } else {
          streamedContent = "I'm here with you. What would you like to focus on right now?";
        }
        if (onToken) onToken(streamedContent);
      }

      const assistantMessage = await Message.create({
        conversation: conversation._id,
        user: userId,
        role: 'assistant',
        content: streamedContent,
        actions,
        widget,
        toolCalls: aiResponse.toolCalls || [],
      });

      conversation.lastMessageAt = new Date();
      conversation.messageCount = (conversation.messageCount || 0) + 2;
      await conversation.save();

      if (onDone) {
        onDone({
          conversation: { id: conversation._id.toString(), title: conversation.title },
          userMessage: { id: userMessage._id.toString(), content: userMessage.content },
          assistantMessage: { id: assistantMessage._id.toString(), content: assistantMessage.content, actions, widget },
        });
      }
    } catch (err) {
      if (onError) onError(err);
    }
  },

  /**
   * Confirms and executes an authorized mutating tool action
   */
  async confirmAction(userId, { messageId, actionId, actionType, payload }) {
    if (!actionType) throw new Error('Action type is required');

    let result;
    switch (actionType) {
      case 'createHabit':
        result = await jarvisToolRegistry.executeCreateHabit(userId, payload);
        break;
      case 'updateHabit':
        result = await jarvisToolRegistry.executeUpdateHabit(userId, payload);
        break;
      case 'pauseHabit':
        result = await jarvisToolRegistry.executePauseHabit(userId, payload);
        break;
      case 'deleteHabit':
        result = await jarvisToolRegistry.executeDeleteHabit(userId, payload);
        break;
      case 'createTask':
        result = await jarvisToolRegistry.executeCreateTask(userId, payload);
        break;
      case 'createGoal':
        result = await jarvisToolRegistry.executeCreateGoal(userId, payload);
        break;
      case 'activateRecoveryMode':
        result = await jarvisToolRegistry.executeActivateRecoveryMode(userId, payload);
        break;
      case 'createPersonalRule':
        result = await jarvisToolRegistry.executeCreatePersonalRule(userId, payload);
        break;
      case 'createHabitStack':
        result = await jarvisToolRegistry.executeCreateHabitStack(userId, payload);
        break;
      case 'recordDistraction':
        result = await jarvisToolRegistry.executeRecordDistraction(userId, payload);
        break;
      case 'start_focus':
      case 'startFocusSession':
        result = await jarvisToolRegistry.startFocusSession(userId, payload);
        break;
      default:
        throw new Error(`Unsupported action type: ${actionType}`);
    }

    if (messageId && actionId) {
      await Message.updateOne(
        { _id: messageId, user: userId, 'actions.id': actionId },
        {
          $set: {
            'actions.$.isExecuted': true,
            'actions.$.isConfirmed': true,
          },
        }
      );
    }

    return result;
  },

  // Conversations
  async getConversations(userId, { search = '', limit = 30 } = {}) {
    const filter = { user: userId };
    if (search && search.trim()) {
      filter.title = { $regex: new RegExp(search.trim(), 'i') };
    }

    const conversations = await Conversation.find(filter)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();

    return conversations.map((c) => ({
      id: c._id.toString(),
      title: c.title,
      messageCount: c.messageCount || 0,
      updatedAt: c.updatedAt,
      createdAt: c.createdAt,
    }));
  },

  async getConversation(userId, conversationId) {
    const conv = await Conversation.findOne({ _id: conversationId, user: userId }).lean();
    if (!conv) return null;

    const messages = await Message.find({ conversation: conversationId, user: userId })
      .sort({ createdAt: 1 })
      .lean();

    return {
      conversation: {
        id: conv._id.toString(),
        title: conv.title,
        createdAt: conv.createdAt,
      },
      messages: messages.map((m) => ({
        id: m._id.toString(),
        role: m.role,
        content: m.content,
        actions: m.actions || [],
        widget: m.widget || null,
        createdAt: m.createdAt,
      })),
    };
  },

  async deleteConversation(userId, conversationId) {
    await Conversation.deleteOne({ _id: conversationId, user: userId });
    await Message.deleteMany({ conversation: conversationId });
    return { success: true };
  },

  async updateConversation(userId, conversationId, { title }) {
    const conv = await Conversation.findOne({ _id: conversationId, user: userId });
    if (!conv) throw new Error('Conversation not found');
    if (title) conv.title = title.trim();
    await conv.save();
    return { id: conv._id.toString(), title: conv.title };
  },

  // Proactive Dashboard Card
  async getProactiveDashboardCard(userId) {
    const user = await User.findById(userId).select('name recoveryMode badDayMode').lean();
    const overview = await jarvisToolRegistry.getTodayOverview(userId);

    if (user?.recoveryMode?.active) {
      return {
        headline: 'Momentum Recovery Mode Active',
        advice: 'Targets are reduced by 50% for 3 days. Focus on zero-friction completion today.',
        actionLabel: 'View Today’s Baseline',
        actionType: 'open_jarvis',
      };
    }

    if (user?.badDayMode?.active) {
      return {
        headline: 'Emergency Bad Day Protocol Active',
        advice: 'Protect your baseline with 3 small actions: hydrate, 5-minute walk, and 10-minute focus.',
        actionLabel: 'Open Reset Check',
        actionType: 'open_jarvis',
      };
    }

    if (overview.pendingHabits && overview.pendingHabits.length > 0) {
      const nextHabit = overview.pendingHabits[0];
      return {
        headline: `Next Action: ${nextHabit.name}`,
        advice: `Your ${nextHabit.name} target is ${nextHabit.target?.value || 1} ${nextHabit.target?.unit !== 'binary' ? nextHabit.target?.unit : 'completion'}. Start with a 20-minute focus session.`,
        actionLabel: `Start 20-Min ${nextHabit.name}`,
        actionType: 'start_focus',
        payload: { durationMinutes: 20, title: nextHabit.name, habitName: nextHabit.name },
      };
    }

    return {
      headline: 'All Scheduled Targets Completed 🎯',
      advice: 'Outstanding discipline today. Log your evening reflection when ready.',
      actionLabel: 'Evening Reflection',
      actionType: 'open_jarvis',
    };
  },
};
