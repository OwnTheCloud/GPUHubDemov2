/**
 * Client-side OpenAI integration for Power Platform deployment
 * This bypasses the need for a local Express server
 */

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface StreamResponse {
  content: string;
  done: boolean;
}

// System prompt for GPU Assistant
const GPU_SYSTEM_PROMPT = `You are a GPU Assistant for a GPU infrastructure management platform. Help users analyze GPU deployments, power consumption, and performance metrics.`;

export class ClientSideOpenAI {
  private apiKey: string;
  private model: string;
  private controller: AbortController | null = null;

  constructor() {
    // Get API key from environment variables (set at build time)
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';
    
    if (!this.apiKey || this.apiKey === 'your_openai_api_key_here') {
      console.warn('⚠️ OpenAI API key not configured for client-side integration');
    }
  }

  async *streamChat(messages: OpenAIMessage[]): AsyncGenerator<StreamResponse> {
    if (!this.apiKey || this.apiKey === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not configured. Please check your environment variables.');
    }

    // Create new abort controller for this request
    this.controller = new AbortController();

    // Prepare messages with system prompt
    const messagesWithSystem = [
      { role: 'system' as const, content: GPU_SYSTEM_PROMPT },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: messagesWithSystem,
          temperature: 0.7,
          max_tokens: 1000,
          stream: true
        }),
        signal: this.controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
      }

      if (!response.body) {
        throw new Error('No response body received from OpenAI API');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            yield { content: '', done: true };
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                yield { content: '', done: true };
                return;
              }

              try {
                const json = JSON.parse(data);
                const delta = json.choices?.[0]?.delta;
                
                if (delta?.content) {
                  yield { content: delta.content, done: false };
                }
              } catch (parseError) {
                // Skip non-JSON lines
                continue;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      throw error;
    }
  }

  stop() {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.apiKey !== 'your_openai_api_key_here');
  }
}