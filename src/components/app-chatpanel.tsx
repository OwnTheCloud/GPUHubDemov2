import { useState, useCallback, createContext, useContext } from "react";
import { useChat } from "ai/react";
import { MessageCircle, X, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chat } from "@/components/ui/chat";
import { cn } from "@/lib/utils";

// Context for chat panel state
interface ChatPanelContextType {
  isExpanded: boolean;
  toggleExpanded: () => void;
}

const ChatPanelContext = createContext<ChatPanelContextType | null>(null);

export function useChatPanel() {
  const context = useContext(ChatPanelContext);
  if (!context) {
    throw new Error("useChatPanel must be used within a ChatPanelProvider");
  }
  return context;
}

export function ChatPanelProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false); // Default to collapsed
  
  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  return (
    <ChatPanelContext.Provider value={{ isExpanded, toggleExpanded }}>
      {children}
    </ChatPanelContext.Provider>
  );
}

interface AppChatPanelProps {
  className?: string;
}

export default function AppChatPanel({ className }: AppChatPanelProps) {
  const { isExpanded, toggleExpanded } = useChatPanel();
  
  // Initialize chat functionality with OpenAI API
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    append,
    error,
  } = useChat({
    api: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333'}/api/chat`,
    onError: (error) => {
      console.error("Chat error:", error);
    },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I'm your GPU Assistant. I can help you analyze your GPU deployments, power consumption, and performance metrics. Ask me about your datacenters, GPU utilization, or any signals you're seeing.",
      },
    ],
  });

  // GPU-related prompt suggestions
  const suggestions = [
    "Show me GPU utilization across all datacenters",
    "What are the current power consumption trends?", 
    "Which GPUs are available for deployment?",
    "Analyze the latest investigation signals",
    "How many H100s are deployed in Virginia Prime?",
  ];

  return (
    <div
      className={cn(
        "h-full transition-all duration-300 ease-in-out border-l border-sidebar-border bg-sidebar text-sidebar-foreground",
        isExpanded ? "w-96" : "w-12",
        className
      )}
    >
      {/* Collapsed state - just the toggle button */}
      {!isExpanded && (
        <div className="flex h-full flex-col items-center justify-start pt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleExpanded}
            className="h-10 w-10 rounded-full bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground"
            title="Open GPU Assistant"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <div className="mt-4 flex flex-col items-center gap-2 opacity-60 text-sidebar-foreground">
            <Cpu className="h-4 w-4 text-sidebar-primary" />
            <div className="text-xs font-medium writing-mode-vertical-lr transform rotate-180">
              GPU Assistant
            </div>
          </div>
        </div>
      )}

      {/* Expanded state - full chat interface */}
      {isExpanded && (
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-sidebar-border p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent">
                <Cpu className="h-4 w-4 text-sidebar-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-sidebar-foreground">GPU Assistant</h3>
                <p className="text-xs text-sidebar-foreground/60">
                  Ask about your GPU deployments
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleExpanded}
              className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
              title="Close GPU Assistant"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden p-2">
            <div className="h-full bg-card border border-sidebar-border rounded-lg">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                  <p className="text-red-800 dark:text-red-200 text-sm">
                    {error.message.includes('API key') 
                      ? 'OpenAI API key not configured. Please check your .env.local file.'
                      : 'Chat error: ' + error.message
                    }
                  </p>
                </div>
              )}
              <Chat
                messages={messages}
                input={input}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                isGenerating={isLoading}
                stop={stop}
                append={append}
                suggestions={suggestions}
                className="h-full p-4"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}