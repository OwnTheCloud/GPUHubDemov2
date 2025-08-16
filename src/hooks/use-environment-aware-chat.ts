/**
 * Environment-aware chat hook that works in both local development and Power Platform
 */

import { useState, useCallback, useRef } from 'react';
import { useChat } from 'ai/react';
import { ClientSideOpenAI } from '@/lib/openai-client-side';
import { isPowerPlatform } from '@/lib/environment';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
  toolInvocations?: ToolInvocation[];
}

interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  result?: Record<string, unknown>;
  state: 'call' | 'result';
}

interface UseEnvironmentAwareChatOptions {
  initialMessages?: Message[];
  onError?: (error: Error) => void;
}

export const useEnvironmentAwareChat = (options: UseEnvironmentAwareChatOptions = {}) => {
  const { initialMessages = [], onError } = options;
  const [isUsingClientSide, setIsUsingClientSide] = useState(isPowerPlatform());
  const clientSideOpenAI = useRef<ClientSideOpenAI | null>(null);
  
  // Initialize client-side OpenAI if needed
  if (isUsingClientSide && !clientSideOpenAI.current) {
    clientSideOpenAI.current = new ClientSideOpenAI();
  }

  // State for client-side chat
  const [clientMessages, setClientMessages] = useState<Message[]>(initialMessages);
  const [clientInput, setClientInput] = useState('');
  const [clientIsLoading, setClientIsLoading] = useState(false);
  const [clientError, setClientError] = useState<Error | null>(null);

  // Server-side chat (for local development) with tool support
  const serverChat = useChat({
    api: '/api/chat',
    initialMessages,
    // Remove onToolCall - let the server handle tool execution completely
    // The server streams tool results in AI SDK format (9:...) which the useChat hook will process automatically
    onError: (error) => {
      console.error('Server chat error:', error);
      // If server fails, fallback to client-side
      if (!isUsingClientSide) {
        console.log('🔄 Falling back to client-side OpenAI integration');
        setIsUsingClientSide(true);
        if (!clientSideOpenAI.current) {
          clientSideOpenAI.current = new ClientSideOpenAI();
        }
      }
      onError?.(error);
    },
    onFinish: (message) => {
      console.log('✅ Chat message finished:', message);
      console.log('📊 Message tool invocations:', message.toolInvocations);
    },
  });

  // Client-side message handling
  const handleClientSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!clientInput.trim() || clientIsLoading || !clientSideOpenAI.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: clientInput,
      createdAt: new Date(),
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      createdAt: new Date(),
    };

    // Add user message and prepare assistant message
    setClientMessages(prev => [...prev, userMessage, assistantMessage]);
    setClientInput('');
    setClientIsLoading(true);
    setClientError(null);

    try {
      // Prepare messages for OpenAI (exclude system messages and only send role + content)
      const messagesToSend = [...clientMessages, userMessage]
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));

      let fullContent = '';
      
      // Stream the response
      for await (const chunk of clientSideOpenAI.current.streamChat(messagesToSend)) {
        if (chunk.done) break;
        
        // Handle text content
        if (chunk.content) {
          fullContent += chunk.content;
        }
        
        // Handle tool results
        if (chunk.toolResults && chunk.toolResults.length > 0) {
          // Format tool results as readable content
          const toolResultsText = chunk.toolResults.map(result => {
            if (result.error) {
              return `\n❌ Error executing ${result.toolName}: ${result.error}`;
            }
            
            // Format the result data nicely
            let formattedResult = `\n🔍 **${result.toolName}** results:\n`;
            
            if (result.result && typeof result.result === 'object') {
              // Handle different result formats
              if (result.result.datacenter) {
                // Single datacenter result
                formattedResult += `**${result.result.datacenter}** (${result.result.region})\n`;
                formattedResult += `- GPUs: ${result.result.gpuCount}/${result.result.totalCapacity}\n`;
                formattedResult += `- Utilization: ${result.result.utilization}\n`;
                formattedResult += `- Power: ${result.result.powerUsage || result.result.powerUsage}\n`;
                formattedResult += `- Type: ${result.result.type}\n`;
                formattedResult += `- Status: ${result.result.status}\n`;
              } else if (result.result.datacenters && Array.isArray(result.result.datacenters)) {
                // Multiple datacenters result
                formattedResult += `Found ${result.result.datacenters.length} matching datacenters:\n`;
                result.result.datacenters.slice(0, 5).forEach(dc => {
                  formattedResult += `- **${dc.name}** (${dc.region}): ${dc.deployedGPUs || dc.capacity_used}/${dc.capacity || dc.capacity_total} GPUs, ${dc.utilization}% util\n`;
                });
                if (result.result.datacenters.length > 5) {
                  formattedResult += `... and ${result.result.datacenters.length - 5} more\n`;
                }
              } else if (result.result.totalPower) {
                // Power consumption result
                formattedResult += `Total Power: **${result.result.totalPower} ${result.result.unit}**\n`;
                formattedResult += `Datacenters: ${result.result.datacenters} (${result.result.onlineDatacenters} online)\n`;
                if (result.result.averagePowerPerDC) {
                  formattedResult += `Average per DC: ${result.result.averagePowerPerDC} MW\n`;
                }
                if (result.result.breakdown) {
                  formattedResult += `\nTop power consumers:\n`;
                  result.result.breakdown.slice(0, 3).forEach(dc => {
                    formattedResult += `- ${dc.name}: ${dc.power} MW (${dc.status})\n`;
                  });
                }
              } else if (result.result.recommendations) {
                // Underutilized resources result
                formattedResult += `Available Capacity: **${result.result.totalAvailableCapacity} GPUs**\n`;
                if (result.result.potentialPowerSavings) {
                  formattedResult += `Potential Savings: ${result.result.potentialPowerSavings} MW\n`;
                }
                formattedResult += `\nRecommendations:\n`;
                result.result.recommendations.forEach(rec => {
                  formattedResult += `• ${rec}\n`;
                });
              }
            }
            
            return formattedResult;
          }).join('\n');
          
          fullContent += toolResultsText;
        }
        
        // Update the assistant message content
        setClientMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: fullContent }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Client-side chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setClientError(new Error(errorMessage));
      
      // Remove the empty assistant message on error
      setClientMessages(prev => prev.filter(msg => msg.id !== assistantMessage.id));
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setClientIsLoading(false);
    }
  }, [clientInput, clientIsLoading, clientMessages, onError]);

  const handleClientStop = useCallback(() => {
    if (clientSideOpenAI.current) {
      clientSideOpenAI.current.stop();
    }
    setClientIsLoading(false);
  }, []);

  const handleClientInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setClientInput(e.target.value);
  }, []);

  const append = useCallback(async (message: { content: string; role: 'user' | 'assistant' }) => {
    if (isUsingClientSide) {
      // For client-side, we need to handle this differently
      setClientInput(message.content);
      // Trigger submit if it's a user message
      if (message.role === 'user') {
        setTimeout(() => handleClientSubmit(), 0);
      }
    } else {
      // Use server-side chat with tool support
      return serverChat.append({
        role: message.role,
        content: message.content,
      });
    }
  }, [isUsingClientSide, handleClientSubmit, serverChat]);

  // Return appropriate interface based on environment
  if (isUsingClientSide) {
    return {
      messages: clientMessages,
      input: clientInput,
      handleInputChange: handleClientInputChange,
      handleSubmit: handleClientSubmit,
      isLoading: clientIsLoading,
      error: clientError,
      stop: handleClientStop,
      append,
      isUsingClientSide: true,
    };
  } else {
    return {
      messages: serverChat.messages,
      input: serverChat.input,
      handleInputChange: serverChat.handleInputChange,
      handleSubmit: serverChat.handleSubmit,
      isLoading: serverChat.isLoading,
      error: serverChat.error,
      stop: serverChat.stop,
      append,
      isUsingClientSide: false,
      // Expose additional server-side features
      reload: serverChat.reload,
      setMessages: serverChat.setMessages,
    };
  }
};