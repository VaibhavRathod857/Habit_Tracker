import { BaseAIProvider } from './BaseAIProvider.js';
import { ENV } from '../../../config/env.js';

/**
 * Honest, transparent Fallback Provider
 * Activated when no external AI API key is configured or when cloud limits are exceeded.
 */
export class FallbackProvider extends BaseAIProvider {
  constructor(config = {}) {
    super(config);
  }

  isConfigured() {
    return true; // Always available as local fallback
  }

  _generateFallbackResponse(userPrompt, tools = []) {
    const query = userPrompt.toLowerCase().trim();
    const toolCalls = [];

    const hasKey = Boolean(
      (ENV.GEMINI_API_KEY && ENV.GEMINI_API_KEY.trim().length > 0) ||
      (ENV.OPENAI_API_KEY && ENV.OPENAI_API_KEY.trim().length > 0) ||
      (ENV.ANTHROPIC_API_KEY && ENV.ANTHROPIC_API_KEY.trim().length > 0) ||
      (ENV.AI_API_KEY && ENV.AI_API_KEY.trim().length > 0)
    );

    let notice = '';
    if (!hasKey) {
      notice = '[JARVIS Local Mode: No AI API key is configured in server/.env]\n\n';
    }
    let responseText = '';

    // 1. Greetings
    if (/^(hello|hi|hey|greetings|good\s+(morning|afternoon|evening))\b/i.test(query)) {
      responseText = `Hello! I am JARVIS, your personal discipline and routine coach.\n\nI'm here to help you protect your momentum, plan your day, stay consistent with your habits, and work through procrastination without guilt.\n\nWhat are you working on today, or what would you like to focus on right now?`;
    }
    // 2. Identity / Name
    else if (/(what is your name|who are you|tell me about yourself|what does jarvis stand for)/i.test(query)) {
      responseText = `I am **JARVIS** — which stands for **Journey Assistant for Routine, Vision, Improvement & Self-discipline**.\n\nUnlike traditional chatbots, I am built specifically to act as an intelligent discipline and life coach integrated directly with your habits, focus sessions, daily planner, and reflections. My goal is to help you maintain consistency, understand why routines break down, and take realistic next steps.`;
    }
    // 3. Capabilities / Help
    else if (/(what can you help|what can you do|how can you help|features|capabilities)/i.test(query)) {
      responseText = `Here is how I can help you build sustainable discipline and lifestyle momentum:\n\n` +
        `1. **Daily Planning & Scheduling**: Break large goals and study targets into realistic time blocks with buffer time.\n` +
        `2. **Habit Tracking & Calibration**: Review your consistency rates, calibrate targets when sessions are frequently missed, and build habit stacks (*"After X, I do Y"*).\n` +
        `3. **Overcoming Procrastination**: Dismantle resistance with 5–10 minute micro-starts rather than generic motivational quotes.\n` +
        `4. **Focus & Deep Work Sessions**: Launch integrated focus timers and log deep work minutes directly against your habits.\n` +
        `5. **Gentle Recovery & Bad Day Protocols**: Halve targets or activate low-friction survival baselines when you're overwhelmed or recovering from missed days.\n` +
        `6. **Reflections & Weekly Reviews**: Capture distractions and generate KEEP / IMPROVE / NEXT WEEK cadences.\n\n` +
        `What area feels most challenging for you right now?`;
      toolCalls.push({
        id: `call_overview_${Date.now()}`,
        name: 'getTodayOverview',
        args: {},
      });
    }
    // 4. Specific Study Planning (e.g., "I want to study DSA for 2 hours today. Help me plan it.")
    else if ((query.includes('dsa') || query.includes('study')) && (query.includes('plan') || query.includes('hour') || query.includes('schedule') || query.includes('today'))) {
      responseText = `Let's break your 2-hour study block into a high-retention, fatigue-resistant plan using spaced focus intervals:\n\n` +
        `### Proposed 2-Hour Study Timeline\n\n` +
        `* **00:00 – 00:50 (50 mins)** — **Block 1: Deep Problem Solving**\n` +
        `  * Choose 1–2 specific problems or core data structure topics (e.g., Two Pointers, Trees, or Graphs).\n` +
        `  * Close all social tabs, put your phone in another room, and write clean code with edge-case tests.\n\n` +
        `* **00:50 – 01:05 (15 mins)** — **Rest & Cognitive Reset**\n` +
        `  * Stand up, stretch, drink a glass of water, and look away from screens.\n\n` +
        `* **01:05 – 01:55 (50 mins)** — **Block 2: Implementation & Time-Boxed Challenge**\n` +
        `  * Tackle a timed problem or review alternative solutions and time/space complexity.\n\n` +
        `* **01:55 – 02:00 (5 mins)** — **Review & Log**\n` +
        `  * Record key insights in your notes and log the session in your habit tracker.\n\n` +
        `Would you like me to launch a 50-minute deep work timer for Block 1 right now?`;
      toolCalls.push({
        id: `call_focus_${Date.now()}`,
        name: 'startFocusSession',
        args: { durationMinutes: 50, title: 'DSA Deep Work — Block 1' },
      });
    }
    // 5. General Planning / Schedule
    else if (query.includes('plan') || query.includes('schedule') || query.includes('today')) {
      responseText = `Let's create a balanced, realistic schedule for today. A sustainable plan always includes buffer time rather than back-to-back demands.\n\nI have retrieved your scheduled habits and tasks for today below. Let's start with your highest-priority outcome first.`;
      toolCalls.push({
        id: `call_plan_${Date.now()}`,
        name: 'getTodayOverview',
        args: {},
      });
    }
    // 6. Procrastination / Focus Resistance
    else if (query.includes('procrastinat') || query.includes('distract') || query.includes('lazy') || query.includes('wasted')) {
      responseText = `When you're procrastinating, you rarely need more motivation — you need a smaller starting threshold.\n\nWhat is the specific friction right now? Is the task too ambiguous, are you physically exhausted, or are you getting pulled into low-friction distractions?\n\nLet's test a simple 10-minute micro-start. Commit only to the first 10 minutes; after that, you have full permission to stop.`;
      toolCalls.push({
        id: `call_focus_${Date.now()}`,
        name: 'startFocusSession',
        args: { durationMinutes: 10, title: 'Micro-Start Session' },
      });
    }
    // 7. Habit Failures / Inconsistency
    else if (query.includes('fail') || query.includes('miss') || query.includes('streak') || query.includes('inconsistent')) {
      responseText = `Missing days is part of building discipline. What matters is never missing twice in a row, and understanding the root cause.\n\nI have pulled up your habit records. Let's look at whether the target is realistically sized for your schedule, or if the time of day needs calibration.`;
      toolCalls.push({
        id: `call_habits_${Date.now()}`,
        name: 'getHabits',
        args: {},
      });
    }
    // 8. Weekly Review / Analytics
    else if (query.includes('week') || query.includes('progress') || query.includes('review') || query.includes('analytic')) {
      responseText = `Here is an objective look at your discipline data for the week, separating facts from assumptions.\n\nConsistency isn't about 100% perfection; it's about identifying what worked, what caused friction, and making one small adjustment for next week.`;
      toolCalls.push({
        id: `call_analytics_${Date.now()}`,
        name: 'getWeeklyAnalytics',
        args: {},
      });
    }
    // 9. Default / General Inquiry
    else {
      responseText = `I'm here with you. To unlock full multi-turn conversational reasoning and open-ended dialogue, you can configure an AI API key (\`OPENAI_API_KEY\`, \`GEMINI_API_KEY\`, or \`ANTHROPIC_API_KEY\`) in \`server/.env\`.\n\nIn the meantime, you can ask me to help you plan your day, launch deep work sessions, review your habits, or troubleshoot procrastination. What would you like to focus on?`;
      toolCalls.push({
        id: `call_overview_${Date.now()}`,
        name: 'getTodayOverview',
        args: {},
      });
    }

    return {
      content: `${notice}${responseText}`,
      toolCalls,
    };
  }

  async chat({ messages, tools = [] }) {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    return this._generateFallbackResponse(lastUserMessage, tools);
  }

  async streamChat({ messages, tools = [], onToken, onToolCall }) {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const result = this._generateFallbackResponse(lastUserMessage, tools);

    // Stream the response tokens smoothly
    const words = result.content.split(' ');
    for (let i = 0; i < words.length; i++) {
      const token = (i === 0 ? '' : ' ') + words[i];
      if (onToken) onToken(token);
      await new Promise((resolve) => setTimeout(resolve, 15));
    }

    if (result.toolCalls && onToolCall) {
      for (const tc of result.toolCalls) {
        onToolCall(tc);
      }
    }

    return result;
  }
}
