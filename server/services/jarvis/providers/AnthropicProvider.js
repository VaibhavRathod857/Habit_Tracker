import { BaseAIProvider } from './BaseAIProvider.js';

export class AnthropicProvider extends BaseAIProvider {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey || '';
    this.model = config.model || 'claude-3-5-haiku-20241022';
    this.baseUrl = 'https://api.anthropic.com/v1/messages';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  _formatMessages(messages) {
    const formatted = [];
    for (const msg of messages) {
      if (msg.role === 'system') continue;
      formatted.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content || '',
      });
    }
    return formatted;
  }

  _formatTools(tools) {
    if (!tools || tools.length === 0) return undefined;
    return tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters || { type: 'object', properties: {} },
    }));
  }

  async chat({ messages, tools = [], systemPrompt = '', options = {} }) {
    if (!this.isConfigured()) {
      throw new Error('Anthropic Provider is not configured with an API key');
    }

    const payload = {
      model: options.model || this.model,
      max_tokens: options.maxTokens || 1200,
      messages: this._formatMessages(messages),
      temperature: options.temperature ?? 0.6,
    };

    if (systemPrompt && systemPrompt.trim()) {
      payload.system = systemPrompt.trim();
    }

    const formattedTools = this._formatTools(tools);
    if (formattedTools) {
      payload.tools = formattedTools;
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    let textContent = '';
    const toolCalls = [];

    for (const block of data.content || []) {
      if (block.type === 'text') {
        textContent += block.text;
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id,
          name: block.name,
          args: block.input || {},
        });
      }
    }

    return {
      content: textContent,
      toolCalls,
      raw: data,
    };
  }

  async streamChat({ messages, tools = [], systemPrompt = '', onToken, onToolCall, options = {} }) {
    if (!this.isConfigured()) {
      throw new Error('Anthropic Provider is not configured with an API key');
    }

    const payload = {
      model: options.model || this.model,
      max_tokens: options.maxTokens || 1200,
      messages: this._formatMessages(messages),
      temperature: options.temperature ?? 0.6,
      stream: true,
    };

    if (systemPrompt && systemPrompt.trim()) {
      payload.system = systemPrompt.trim();
    }

    const formattedTools = this._formatTools(tools);
    if (formattedTools) {
      payload.tools = formattedTools;
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic Streaming error (${response.status}): ${errText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    const toolCalls = [];
    let currentTool = null;

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
          const event = JSON.parse(trimmed.slice(6));
          if (event.type === 'content_block_delta') {
            if (event.delta?.type === 'text_delta') {
              const text = event.delta.text || '';
              fullContent += text;
              if (onToken) onToken(text);
            } else if (event.delta?.type === 'input_json_delta' && currentTool) {
              currentTool.jsonString += event.delta.partial_json || '';
            }
          } else if (event.type === 'content_block_start') {
            if (event.content_block?.type === 'tool_use') {
              currentTool = {
                id: event.content_block.id,
                name: event.content_block.name,
                jsonString: '',
              };
            }
          } else if (event.type === 'content_block_stop' && currentTool) {
            let args = {};
            try {
              args = JSON.parse(currentTool.jsonString || '{}');
            } catch {
              args = {};
            }
            const callObj = { id: currentTool.id, name: currentTool.name, args };
            toolCalls.push(callObj);
            if (onToolCall) onToolCall(callObj);
            currentTool = null;
          }
        } catch {
          // ignore chunk parse issues
        }
      }
    }

    return {
      content: fullContent,
      toolCalls,
    };
  }
}
