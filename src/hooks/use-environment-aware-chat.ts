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

  // Server-side chat (for local development)
  const serverChat = useChat({
    api: '/api/chat',
    initialMessages,
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
        
        fullContent += chunk.content;
        
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
      return serverChat.append(message);
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
      ...serverChat,
      isUsingClientSide: false,
      append,
    };
  }
};