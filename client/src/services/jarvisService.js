import api, { API_BASE_URL } from './api.js';

export const jarvisService = {
  // Non-streaming fallback/standard send
  async sendMessage({ conversationId, content, clientContext = {} }) {
    const res = await api.post('/jarvis/chat', { conversationId, content, clientContext });
    return res.data;
  },

  // Real-time SSE token streaming with AbortController support
  async streamMessage({
    conversationId,
    content,
    clientContext = {},
    onToken,
    onActionProposal,
    onDone,
    onError,
    signal,
  }) {
    const token = localStorage.getItem('disciplineos_token');
    try {
      const response = await fetch(`${API_BASE_URL}/jarvis/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ conversationId, content, clientContext }),
        signal,
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || `HTTP error ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.type === 'token' && onToken) {
              onToken(data.token);
            } else if (data.type === 'action_proposal' && onActionProposal) {
              onActionProposal(data.action);
            } else if (data.type === 'done' && onDone) {
              onDone(data.data);
            } else if (data.type === 'error' && onError) {
              onError(new Error(data.error));
            }
          } catch {
            // ignore partial chunk json errors
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // Stream aborted by user
        return;
      }
      if (onError) onError(err);
      else throw err;
    }
  },

  // Confirm and execute a mutating action proposal
  async confirmAction({ messageId, actionId, actionType, payload }) {
    const res = await api.post('/jarvis/actions/confirm', {
      messageId,
      actionId,
      actionType,
      payload,
    });
    return res.data;
  },

  // List conversations
  async getConversations(search = '') {
    const res = await api.get('/jarvis/conversations', {
      params: search ? { search } : {},
    });
    return res.data;
  },

  // Get single conversation with full message thread
  async getConversation(id) {
    const res = await api.get(`/jarvis/conversations/${id}`);
    return res.data;
  },

  // Update conversation title
  async updateConversation(id, updateData) {
    const res = await api.put(`/jarvis/conversations/${id}`, updateData);
    return res.data;
  },

  // Delete conversation
  async deleteConversation(id) {
    const res = await api.delete(`/jarvis/conversations/${id}`);
    return res;
  },

  // Proactive dashboard card
  async getDashboardCard() {
    const res = await api.get('/jarvis/dashboard-card');
    return res.data;
  },

  // Memory management
  async getMemories() {
    const res = await api.get('/jarvis/memories');
    return res.data;
  },

  async saveMemory(memoryData) {
    const res = await api.post('/jarvis/memories', memoryData);
    return res.data;
  },

  async deleteMemory(id) {
    const res = await api.delete(`/jarvis/memories/${id}`);
    return res;
  },

  async clearAllMemories() {
    const res = await api.delete('/jarvis/memories');
    return res;
  },

  // Settings
  async getSettings() {
    const res = await api.get('/jarvis/settings');
    return res.data;
  },

  async updateSettings(settings) {
    const res = await api.put('/jarvis/settings', settings);
    return res.data;
  },
};

export default jarvisService;
