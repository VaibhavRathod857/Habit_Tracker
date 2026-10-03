import { BaseAIProvider } from './BaseAIProvider.js';

export class GeminiProvider extends BaseAIProvider {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey || '';
    this.model = config.model || 'gemini-3.1-flash-lite';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  _getModelCandidateList(requestedModel) {
    const primary = requestedModel || this.model || 'gemini-3.1-flash-lite';
    const fallbackList = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.8-flash'];
    return [primary, ...fallbackList.filter((m) => m !== primary)];
  }

  _formatContents(messages) {
    const rawList = [];

    for (const msg of messages) {
      if (msg.role === 'system') continue;

      let role = msg.role === 'assistant' ? 'model' : 'user';
      let parts = [];

      if (msg.role === 'tool') {
        role = 'user';
        parts.push({
          functionResponse: {
            name: msg.name || 'tool_result',
            response: typeof msg.content === 'object' ? msg.content : { result: msg.content },
          },
        });
      } else if (msg.toolCalls && msg.toolCalls.length > 0) {
        role = 'model';
        parts = msg.toolCalls.map((tc) => {
          const item = {
            functionCall: {
              name: tc.name,
              args: tc.args || {},
            },
          };
          if (tc.thoughtSignature) {
            item.thoughtSignature = tc.thoughtSignature;
          }
          return item;
        });
      } else {
        parts.push({ text: msg.content || '' });
      }

      if (parts.length > 0) {
        rawList.push({ role, parts });
      }
    }

    // Combine consecutive turns of the same role
    const merged = [];
    for (const item of rawList) {
      if (merged.length > 0 && merged[merged.length - 1].role === item.role) {
        merged[merged.length - 1].parts.push(...item.parts);
      } else {
        merged.push({ role: item.role, parts: [...item.parts] });
      }
    }

    // Gemini requires conversations to start with a user turn
    while (merged.length > 0 && merged[0].role === 'model') {
      merged.shift();
    }

    // Gemini requires conversations to NOT end with a model turn
    while (merged.length > 0 && merged[merged.length - 1].role === 'model') {
      merged.pop();
    }

    // If empty, supply a baseline user turn
    if (merged.length === 0) {
      merged.push({ role: 'user', parts: [{ text: 'Hello' }] });
    }

    return merged;
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

    const candidateModels = this._getModelCandidateList(options.model);
    let lastError = null;

    for (const modelName of candidateModels) {
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

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errText = await response.text();
          // If quota exhausted (429) or model deprecated (404), try next model
          if (response.status === 429 || response.status === 404 || response.status === 503) {
            console.warn(`[Gemini Model Failover] ${modelName} returned HTTP ${response.status}. Attempting next model...`);
            lastError = new Error(`Gemini API error (${response.status}): ${errText}`);
            continue;
          }
          throw new Error(`Gemini API error (${response.status}): ${errText}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        const parts = candidate?.content?.parts || [];

        let textContent = '';
        const toolCalls = [];

        for (const part of parts) {
          if (part.text && !part.thought) {
            textContent += part.text;
          }
          if (part.functionCall) {
            toolCalls.push({
              id: part.functionCall.id || `gemini_call_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              name: part.functionCall.name,
              args: part.functionCall.args || {},
              thoughtSignature: part.thoughtSignature,
            });
          }
        }

        return {
          content: textContent,
          toolCalls,
          raw: data,
          modelUsed: modelName,
        };
      } catch (err) {
        lastError = err;
        if (err.message.includes('429') || err.message.includes('404') || err.message.includes('503')) {
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error('All Gemini model candidates failed');
  }

  async streamChat({ messages, tools = [], systemPrompt = '', onToken, onToolCall, options = {} }) {
    if (!this.isConfigured()) {
      throw new Error('Gemini Provider is not configured with an API key');
    }

    const candidateModels = this._getModelCandidateList(options.model);
    let lastError = null;

    for (const modelName of candidateModels) {
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

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errText = await response.text();
          if (response.status === 429 || response.status === 404 || response.status === 503) {
            console.warn(`[Gemini Stream Failover] ${modelName} returned HTTP ${response.status}. Attempting next model...`);
            lastError = new Error(`Gemini Streaming error (${response.status}): ${errText}`);
            continue;
          }
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
                // Filter out reasoning/thought blocks so only genuine user-facing text is streamed
                if (part.text && !part.thought) {
                  fullContent += part.text;
                  if (onToken) onToken(part.text);
                }
                if (part.functionCall) {
                  const callObj = {
                    id: part.functionCall.id || `gemini_call_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                    name: part.functionCall.name,
                    args: part.functionCall.args || {},
                    thoughtSignature: part.thoughtSignature,
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
          modelUsed: modelName,
        };
      } catch (err) {
        lastError = err;
        if (err.message.includes('429') || err.message.includes('404') || err.message.includes('503')) {
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error('All Gemini streaming model candidates failed');
  }
}
