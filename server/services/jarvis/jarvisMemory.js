import { JarvisMemory } from '../../models/JarvisMemory.js';
import { User } from '../../models/User.js';

/**
 * Long-Term Memory Service for JARVIS
 * Allows users to retain stable preferences, goals, and personal rules while respecting privacy.
 */
export const jarvisMemoryService = {
  async getMemories(userId) {
    return JarvisMemory.find({ user: userId })
      .sort({ isPinned: -1, updatedAt: -1 })
      .lean();
  },

  async saveMemory(userId, { key, value, category = 'general', isPinned = false }) {
    if (!key || !value) {
      throw new Error('Key and value are required to save memory');
    }

    const cleanKey = key.trim();
    const cleanVal = value.trim();

    const existing = await JarvisMemory.findOne({ user: userId, key: cleanKey });
    if (existing) {
      existing.value = cleanVal;
      existing.category = category;
      if (isPinned !== undefined) existing.isPinned = isPinned;
      await existing.save();
      return existing;
    }

    return JarvisMemory.create({
      user: userId,
      key: cleanKey,
      value: cleanVal,
      category,
      isPinned,
    });
  },

  async deleteMemory(userId, memoryId) {
    const res = await JarvisMemory.deleteOne({ _id: memoryId, user: userId });
    return { success: res.deletedCount > 0 };
  },

  async clearAllMemories(userId) {
    const res = await JarvisMemory.deleteMany({ user: userId });
    return { success: true, count: res.deletedCount };
  },

  /**
   * Intelligently detects and extracts persistent facts/preferences from conversations
   */
  async extractAndStoreConversationalMemories(userId, userMessage = '') {
    const user = await User.findById(userId).select('jarvisSettings').lean();
    if (user?.jarvisSettings?.memoryEnabled === false) return;

    const lower = userMessage.toLowerCase().trim();

    // 1. Long-term goals
    if (lower.startsWith('my goal is ') || lower.startsWith('i want to become ') || lower.startsWith('i want to achieve ')) {
      const val = userMessage.slice(userMessage.indexOf('is') + 3 || 15).trim();
      if (val.length > 3) {
        await this.saveMemory(userId, {
          key: 'Primary Aspiration',
          value: val,
          category: 'goal',
        });
      }
    }

    // 2. Study / Routine preferences
    if (lower.includes('i prefer morning') || lower.includes('i study best in the morning')) {
      await this.saveMemory(userId, {
        key: 'Peak Productivity Window',
        value: 'Morning hours',
        category: 'preference',
      });
    } else if (lower.includes('i prefer evening') || lower.includes('i study best at night') || lower.includes('night owl')) {
      await this.saveMemory(userId, {
        key: 'Peak Productivity Window',
        value: 'Evening / Night hours',
        category: 'preference',
      });
    }

    // 3. User-defined rules
    if (lower.startsWith('my rule is ') || lower.startsWith('personal rule:')) {
      const rule = userMessage.replace(/my rule is |personal rule:/i, '').trim();
      if (rule.length > 5) {
        await this.saveMemory(userId, {
          key: 'Stated Rule',
          value: rule,
          category: 'rule',
        });
      }
    }
  },
};
