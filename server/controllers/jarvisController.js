import { jarvisService } from '../services/jarvis/jarvisService.js';
import { jarvisMemoryService } from '../services/jarvis/jarvisMemory.js';
import { User } from '../models/User.js';

/**
 * Standard non-streaming chat endpoint
 */
export const handleChatMessage = async (req, res, next) => {
  try {
    const { conversationId, content, clientContext } = req.body;
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required and cannot be empty',
      });
    }

    const result = await jarvisService.sendMessage(req.user._id, {
      conversationId,
      content: content.trim(),
      clientContext,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Real-time Server-Sent Events (SSE) streaming chat endpoint
 */
export const handleStreamChatMessage = async (req, res, next) => {
  try {
    const { conversationId, content, clientContext } = req.body;
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required and cannot be empty',
      });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (res.flushHeaders) res.flushHeaders();

    await jarvisService.streamChat({
      userId: req.user._id,
      conversationId,
      content: content.trim(),
      clientContext,
      onToken: (token) => {
        res.write(`data: ${JSON.stringify({ type: 'token', token })}\n\n`);
      },
      onActionProposal: (action) => {
        res.write(`data: ${JSON.stringify({ type: 'action_proposal', action })}\n\n`);
      },
      onDone: (data) => {
        res.write(`data: ${JSON.stringify({ type: 'done', data })}\n\n`);
        res.end();
      },
      onError: (err) => {
        res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
        res.end();
      },
    });
  } catch (err) {
    if (!res.headersSent) {
      next(err);
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
      res.end();
    }
  }
};

/**
 * Confirm and execute a proposed mutating tool action
 */
export const handleConfirmAction = async (req, res, next) => {
  try {
    const { messageId, actionId, actionType, payload } = req.body;

    if (!actionType) {
      return res.status(400).json({
        success: false,
        error: 'actionType is required',
      });
    }

    const result = await jarvisService.confirmAction(req.user._id, {
      messageId,
      actionId,
      actionType,
      payload,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// Conversations
export const getConversations = async (req, res, next) => {
  try {
    const { search } = req.query;
    const conversations = await jarvisService.getConversations(req.user._id, { search });
    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (err) {
    next(err);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await jarvisService.getConversation(req.user._id, id);
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const updated = await jarvisService.updateConversation(req.user._id, id, { title });
    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    await jarvisService.deleteConversation(req.user._id, id);
    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// Memories
export const getMemories = async (req, res, next) => {
  try {
    const memories = await jarvisMemoryService.getMemories(req.user._id);
    res.status(200).json({
      success: true,
      count: memories.length,
      data: memories,
    });
  } catch (err) {
    next(err);
  }
};

export const saveMemory = async (req, res, next) => {
  try {
    const { key, value, category, isPinned } = req.body;
    const mem = await jarvisMemoryService.saveMemory(req.user._id, { key, value, category, isPinned });
    res.status(201).json({
      success: true,
      data: mem,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteMemory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await jarvisMemoryService.deleteMemory(req.user._id, id);
    res.status(200).json({
      success: true,
      message: 'Memory deleted',
    });
  } catch (err) {
    next(err);
  }
};

export const clearAllMemories = async (req, res, next) => {
  try {
    await jarvisMemoryService.clearAllMemories(req.user._id);
    res.status(200).json({
      success: true,
      message: 'All memories cleared',
    });
  } catch (err) {
    next(err);
  }
};

// Proactive Card
export const getDashboardCard = async (req, res, next) => {
  try {
    const card = await jarvisService.getProactiveDashboardCard(req.user._id);
    res.status(200).json({
      success: true,
      data: card,
    });
  } catch (err) {
    next(err);
  }
};

// Settings
export const getSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('jarvisSettings').lean();
    res.status(200).json({
      success: true,
      data: user?.jarvisSettings || {
        enabled: true,
        personality: 'calm',
        responseLength: 'normal',
        proactiveInsights: true,
        memoryEnabled: true,
        voiceEnabled: false,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.jarvisSettings) {
      user.jarvisSettings = {};
    }

    const { enabled, personality, responseLength, proactiveInsights, memoryEnabled, voiceEnabled } = req.body;
    if (enabled !== undefined) user.jarvisSettings.enabled = Boolean(enabled);
    if (personality) user.jarvisSettings.personality = personality;
    if (responseLength) user.jarvisSettings.responseLength = responseLength;
    if (proactiveInsights !== undefined) user.jarvisSettings.proactiveInsights = Boolean(proactiveInsights);
    if (memoryEnabled !== undefined) user.jarvisSettings.memoryEnabled = Boolean(memoryEnabled);
    if (voiceEnabled !== undefined) user.jarvisSettings.voiceEnabled = Boolean(voiceEnabled);

    await user.save();

    res.status(200).json({
      success: true,
      message: 'JARVIS settings updated',
      data: user.jarvisSettings,
    });
  } catch (err) {
    next(err);
  }
};
