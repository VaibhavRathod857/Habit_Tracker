import { BaseAIProvider } from './BaseAIProvider.js';

export class GeminiProvider extends BaseAIProvider {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey || '';
    this.model = config.model || 'gemini-3.8-flash';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  _formatContents(messages, systemInstruction) {
    const contents = [];

    for (const msg of messages) {
      if (msg.role === 'system') continue;

      if (msg.role === 'tool') {
        contents.push({
          role: 'function',
          parts: [
            {
              functionResponse: {
                name: msg.name || 'tool_result',
                response: typeof msg.content === 'object' ? msg.content : { result: msg.content },
              },
            },
          ],
        });
      } else if (msg.toolCalls && msg.toolCalls.length > 0) {
        contents.push({
          role: 'model',
          parts: msg.toolCalls.map((tc) => ({
            functionCall: {
              name: tc.name,
              args: tc.args || {},
            },
          })),
        });
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content || '' }],
        });
      }
    }

    return contents;
  }

  _formatTools(tools) {
    if (!tools || tools.length === 0) return undefined;
    return [
      {
        functionDeclarations: tools.map((t) => ({
          name: t.name,
          description: t.description,
          parameters: t.parameters || { type: 'object', properties: {} },
        })),
      },
    ];
  }

  async chat({ messages, tools = [], systemPrompt = '', options = {} }) {
    if (!this.isConfigured()) {
      throw new Error('Gemini Provider is not configured with an API key');
    }

    const modelName = options.model || this.model;
    const url = `${this.baseUrl}/${modelName}:generateContent?key=${this.apiKey}`;

    const body = {
      contents: this._formatContents(messages),
      generationConfig: {
        temperature: options.temperature ?? 0.6,
        maxOutputTokens: options.maxTokens || 1200,
      },
    };

    if (systemPrompt && systemPrompt.trim()) {
      body.systemInstruction = { parts: [{ text: systemPrompt.trim() }] };
    }

    const formattedTools = this._formatTools(tools);
    if (formattedTools) {
      body.tools = formattedTools;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    let textContent = '';
    const toolCalls = [];

    for (const part of parts) {
      if (part.text) {
        textContent += part.text;
      }
      if (part.functionCall) {
        toolCalls.push({
          id: `gemini_call_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: part.functionCall.name,
          args: part.functionCall.args || {},
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
      throw new Error('Gemini Provider is not configured with an API key');
    }

    const modelName = options.model || this.model;
    const url = `${this.baseUrl}/${modelName}:streamGenerateContent?alt=sse&key=${this.apiKey}`;

    const body = {
      contents: this._formatContents(messages),
      generationConfig: {
        temperature: options.temperature ?? 0.6,
        maxOutputTokens: options.maxTokens || 1200,
      },
    };

    if (systemPrompt && systemPrompt.trim()) {
      body.systemInstruction = { parts: [{ text: systemPrompt.trim() }] };
    }

    const formattedTools = this._formatTools(tools);
    if (formattedTools) {
      body.tools = formattedTools;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini Streaming error (${response.status}): ${errText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    const toolCalls = [];

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
          const json = JSON.parse(trimmed.slice(6));
          const parts = json.candidates?.[0]?.content?.parts || [];
          for (const part of parts) {
            if (part.text) {
              fullContent += part.text;
              if (onToken) onToken(part.text);
            }
            if (part.functionCall) {
              const callObj = {
                id: `gemini_call_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                name: part.functionCall.name,
                args: part.functionCall.args || {},
              };
              toolCalls.push(callObj);
              if (onToolCall) onToolCall(callObj);
            }
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
