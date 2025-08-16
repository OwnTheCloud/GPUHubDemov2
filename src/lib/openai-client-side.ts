/**
 * Client-side OpenAI integration for Power Platform deployment
 * This bypasses the need for a local Express server and includes function calling
 */

import { toolDefinitions, executeToolWithDuckDB } from './chat-tools';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface StreamResponse {
  content: string;
  done: boolean;
  toolCalls?: Record<string, unknown>[];
  toolResults?: Record<string, unknown>[];
}

// Enhanced system prompt for GPU Assistant with tool context
const GPU_SYSTEM_PROMPT = `You are a GPU Assistant for a GPU infrastructure management platform with access to real-time datacenter data.

Available data includes:
- 9 GPU datacenters across multiple regions (US, EU, APAC)
- GPU capacity, utilization, and deployment metrics
- Power consumption and efficiency data
- Status monitoring and operational insights

Use the provided tools to query specific data when users ask questions. Format responses with clear summaries and relevant metrics. Always provide context and actionable insights.

When calling tools, explain what data you're retrieving and provide meaningful analysis of the results.`;

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
          max_tokens: 1500,
          tools: toolDefinitions,
          tool_choice: 'auto',
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
      const toolCalls: Array<Record<string, any>> = [];

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // Execute any pending tool calls before finishing
            if (toolCalls.length > 0) {
              yield { content: '', done: false, toolCalls, toolResults: await this.executeTools(toolCalls) };
            }
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
                // Execute any pending tool calls before finishing
                if (toolCalls.length > 0) {
                  yield { content: '', done: false, toolCalls, toolResults: await this.executeTools(toolCalls) };
                }
                yield { content: '', done: true };
                return;
              }

              try {
                const json = JSON.parse(data);
                const delta = json.choices?.[0]?.delta;
                
                // Handle text content
                if (delta?.content) {
                  yield { content: delta.content, done: false };
                }
                
                // Handle tool calls
                if (delta?.tool_calls) {
                  for (const toolCall of delta.tool_calls) {
                    // Find existing tool call or create new one
                    let existingCall = toolCalls.find(tc => tc.index === toolCall.index);
                    
                    if (!existingCall) {
                      existingCall = {
                        id: toolCall.id,
                        type: 'function',
                        function: { name: '', arguments: '' },
                        index: toolCall.index
                      };
                      toolCalls.push(existingCall);
                    }
                    
                    // Update tool call data
                    if (toolCall.id) existingCall.id = toolCall.id;
                    if (toolCall.function?.name) existingCall.function.name = toolCall.function.name;
                    if (toolCall.function?.arguments) {
                      existingCall.function.arguments += toolCall.function.arguments;
                    }
                  }
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

  private async executeTools(toolCalls: Array<Record<string, any>>): Promise<Array<Record<string, any>>> {
    const results = [];
    
    for (const toolCall of toolCalls) {
      try {
        console.log(`🔧 Executing client-side tool: ${toolCall.function.name}`);
        const args = JSON.parse(toolCall.function.arguments || '{}');
        const result = await executeToolWithDuckDB(toolCall.function.name, args);
        
        results.push({
          toolCallId: toolCall.id,
          toolName: toolCall.function.name,
          args,
          result
        });
        
        console.log(`✅ Client-side tool result:`, result);
      } catch (error) {
        console.error(`❌ Client-side tool execution error:`, error);
        results.push({
          toolCallId: toolCall.id,
          toolName: toolCall.function.name,
          error: error.message
        });
      }
    }
    
    return results;
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