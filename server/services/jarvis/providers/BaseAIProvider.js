/**
 * Base AI Provider Abstract Interface
 * All model providers (OpenAI, Gemini, Anthropic, Local) implement this interface.
 */
export class BaseAIProvider {
  constructor(config = {}) {
    this.config = config;
  }

  isConfigured() {
    return false;
  }

  /**
   * Synchronous / Non-streaming chat completion
   * @param {Object} params
   * @param {Array} params.messages - [{ role: 'system'|'user'|'assistant'|'tool', content, tool_call_id }]
   * @param {Array} [params.tools] - Array of tool schemas
   * @param {string} [params.systemPrompt]
   * @param {Object} [params.options]
   * @returns {Promise<{ content: string, toolCalls: Array }>}
   */
  async chat({ messages, tools = [], systemPrompt = '', options = {} }) {
    throw new Error('chat() must be implemented by provider');
  }

  /**
   * Streaming chat completion via Server-Sent Events / ReadableStream
   * @param {Object} params
   * @param {Array} params.messages
   * @param {Array} [params.tools]
   * @param {string} [params.systemPrompt]
   * @param {Function} params.onToken - (tokenString) => void
   * @param {Function} params.onToolCall - (toolCallObj) => void
   * @param {Object} [params.options]
   * @returns {Promise<{ content: string, toolCalls: Array }>}
   */
  async streamChat({ messages, tools = [], systemPrompt = '', onToken, onToolCall, options = {} }) {
    throw new Error('streamChat() must be implemented by provider');
  }
}
