import { ENV } from '../../../config/env.js';
import { OpenAIProvider } from './OpenAIProvider.js';
import { GeminiProvider } from './GeminiProvider.js';
import { AnthropicProvider } from './AnthropicProvider.js';
import { FallbackProvider } from './FallbackProvider.js';

class AIProviderFactory {
  getProvider() {
    const providerType = (ENV.AI_PROVIDER || '').toLowerCase().trim();

    // 1. Explicit Gemini Provider or GEMINI_API_KEY set
    if (providerType === 'gemini') {
      const apiKey = ENV.GEMINI_API_KEY || ENV.AI_API_KEY;
      if (apiKey) {
        return new GeminiProvider({
          apiKey,
          model: ENV.AI_MODEL || 'gemini-3.8-flash',
        });
      }
    }

    // 2. Explicit Anthropic Provider or ANTHROPIC_API_KEY set
    if (providerType === 'anthropic') {
      const apiKey = ENV.ANTHROPIC_API_KEY || ENV.AI_API_KEY;
      if (apiKey) {
        return new AnthropicProvider({
          apiKey,
          model: ENV.AI_MODEL || 'claude-3-5-haiku-20241022',
        });
      }
    }

    // 3. Local Ollama / vLLM / LMStudio
    if (providerType === 'local') {
      return new OpenAIProvider({
        apiKey: ENV.AI_API_KEY || 'ollama',
        apiUrl: ENV.AI_API_URL || 'http://localhost:11434/v1',
        model: ENV.AI_MODEL || 'llama3.2',
      });
    }

    // 4. Explicit OpenAI Provider
    if (providerType === 'openai') {
      const apiKey = ENV.OPENAI_API_KEY || ENV.AI_API_KEY;
      if (apiKey) {
        return new OpenAIProvider({
          apiKey,
          apiUrl: ENV.AI_API_URL || ENV.OPENAI_BASE_URL || 'https://api.openai.com/v1',
          model: ENV.AI_MODEL || 'gpt-4o-mini',
        });
      }
    }

    // 5. Auto-detect if providerType not set:
    if (ENV.OPENAI_API_KEY && ENV.OPENAI_API_KEY.trim().length > 0) {
      return new OpenAIProvider({
        apiKey: ENV.OPENAI_API_KEY,
        apiUrl: ENV.AI_API_URL || ENV.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        model: ENV.AI_MODEL || 'gpt-4o-mini',
      });
    }

    if (ENV.GEMINI_API_KEY && ENV.GEMINI_API_KEY.trim().length > 0) {
      return new GeminiProvider({
        apiKey: ENV.GEMINI_API_KEY,
        model: ENV.AI_MODEL || 'gemini-3.8-flash',
      });
    }

    if (ENV.ANTHROPIC_API_KEY && ENV.ANTHROPIC_API_KEY.trim().length > 0) {
      return new AnthropicProvider({
        apiKey: ENV.ANTHROPIC_API_KEY,
        model: ENV.AI_MODEL || 'claude-3-5-haiku-20241022',
      });
    }

    if (ENV.AI_API_KEY && ENV.AI_API_KEY.trim().length > 0) {
      return new OpenAIProvider({
        apiKey: ENV.AI_API_KEY,
        apiUrl: ENV.AI_API_URL || ENV.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        model: ENV.AI_MODEL || 'gpt-4o-mini',
      });
    }

    // 6. Honest Fallback Provider when no AI API keys are present
    return new FallbackProvider();
  }
}

export const aiProviderFactory = new AIProviderFactory();
export const getActiveAIProvider = () => aiProviderFactory.getProvider();

