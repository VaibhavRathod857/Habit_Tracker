import { getActiveAIProvider } from './providers/index.js';

export const aiProvider = {
  isConfigured() {
    return getActiveAIProvider().isConfigured();
  },

  async chat(params) {
    return getActiveAIProvider().chat(params);
  },

  async streamChat(params) {
    return getActiveAIProvider().streamChat(params);
  },
};

export { getActiveAIProvider };
