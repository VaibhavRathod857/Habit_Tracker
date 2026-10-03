import { BaseAIProvider } from './BaseAIProvider.js';

export class OpenAIProvider extends BaseAIProvider {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey || '';
    this.apiUrl = (config.apiUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
    this.model = config.model || 'gpt-4o-mini';
  }

  isConfigured() {
    // If local endpoint (e.g. localhost ollama), apiKey may be dummy
    if (this.apiUrl.includes('localhost') || this.apiUrl.includes('127.0.0.1')) {
      return true;
    }
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  _formatMessages(messages, systemPrompt) {
    const formatted = [];
    if (systemPrompt && systemPrompt.trim()) {
      formatted.push({ role: 'system', content: systemPrompt.trim() });
    }

    for (const msg of messages) {
      if (msg.role === 'tool') {
        formatted.push({
          role: 'tool',
          tool_call_id: msg.tool_call_id || msg.id,
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
        });
      } else if (msg.toolCalls && msg.toolCalls.length > 0) {
        formatted.push({
          role: 'assistant',
          content: msg.content || null,
          tool_calls: msg.toolCalls.map((tc) => ({
            id: tc.id || `call_${Date.now()}`,
            type: 'function',
            function: {
              name: tc.name,
              arguments: typeof tc.args === 'string' ? tc.args : JSON.stringify(tc.args || {}),
            },
          })),
        });
      } else {
        formatted.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content || '',
        });
      }
    }
    return formatted;
  }

  _formatTools(tools) {
    if (!tools || tools.length === 0) return undefined;
    return tools.map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters || { type: 'object', properties: {} },
      },
    }));
  }

  async chat({ messages, tools = [], systemPrompt = '', options = {} }) {
    if (!this.isConfigured()) {
      throw new Error('OpenAI Provider is not configured with an API key');
    }

    const payload = {
      model: options.model || this.model,
      messages: this._formatMessages(messages, systemPrompt),
      temperature: options.temperature ?? 0.6,
      max_tokens: options.maxTokens || 1200,
    };

    const formattedTools = this._formatTools(tools);
    if (formattedTools) {
      payload.tools = formattedTools;
      payload.tool_choice = options.toolChoice || 'auto';
    }

    const response = await fetch(`${this.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message;

    const toolCalls = [];
    if (choice?.tool_calls) {
      for (const tc of choice.tool_calls) {
        let parsedArgs = {};
        try {
          parsedArgs = JSON.parse(tc.function.arguments || '{}');
        } catch {
          parsedArgs = {};
        }
        toolCalls.push({
          id: tc.id,
          name: tc.function.name,
          args: parsedArgs,
        });
      }
    }

    return {
      content: choice?.content || '',
      toolCalls,
      raw: data,
    };
  }

  async streamChat({ messages, tools = [], systemPrompt = '', onToken, onToolCall, options = {} }) {
    if (!this.isConfigured()) {
      throw new Error('OpenAI Provider is not configured with an API key');
    }

    const payload = {
      model: options.model || this.model,
      messages: this._formatMessages(messages, systemPrompt),
      temperature: options.temperature ?? 0.6,
      max_tokens: options.maxTokens || 1200,
      stream: true,
    };

    const formattedTools = this._formatTools(tools);
    if (formattedTools) {
      payload.tools = formattedTools;
      payload.tool_choice = options.toolChoice || 'auto';
    }

    const response = await fetch(`${this.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI Streaming error (${response.status}): ${errText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    const toolCallsMap = new Map();

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const delta = json.choices?.[0]?.delta;
          if (!delta) continue;

          if (delta.content) {
            fullContent += delta.content;
            if (onToken) onToken(delta.content);
          }

          if (delta.tool_calls) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index ?? 0;
              if (!toolCallsMap.has(idx)) {
                toolCallsMap.set(idx, {
                  id: tc.id || `call_${Date.now()}_${idx}`,
                  name: tc.function?.name || '',
                  argsString: tc.function?.arguments || '',
                });
              } else {
                const existing = toolCallsMap.get(idx);
                if (tc.id) existing.id = tc.id;
                if (tc.function?.name) existing.name += tc.function.name;
                if (tc.function?.arguments) existing.argsString += tc.function.arguments;
              }
            }
          }
        } catch {
          // ignore parse errors on partial chunks
        }
      }
    }

    const finalToolCalls = [];
    for (const [, item] of toolCallsMap.entries()) {
      let parsed = {};
      try {
        parsed = JSON.parse(item.argsString || '{}');
      } catch {
        parsed = {};
      }
      const callObj = { id: item.id, name: item.name, args: parsed };
      finalToolCalls.push(callObj);
      if (onToolCall) onToolCall(callObj);
    }

    return {
      content: fullContent,
      toolCalls: finalToolCalls,
    };
  }
}
