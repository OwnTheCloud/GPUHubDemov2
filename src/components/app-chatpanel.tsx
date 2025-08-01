import { useState, useCallback, createContext, useContext } from "react";
import { MessageCircle, X, Cpu, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chat } from "@/components/ui/chat";
import { cn } from "@/lib/utils";
import { useEnvironmentAwareChat } from "@/hooks/use-environment-aware-chat";
import { getEnvironmentInfo } from "@/lib/environment";

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
  const environmentInfo = getEnvironmentInfo();
  
  // Initialize environment-aware chat functionality
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    append,
    error,
    isUsingClientSide,
  } = useEnvironmentAwareChat({
    onError: (error) => {
      console.error("Chat error:", error);
    },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I'm your GPU Assistant. I can help you analyze your GPU deployments, power consumption, and performance metrics. Ask me about your datacenters, GPU utilization, or any signals you're seeing.",
        createdAt: new Date(),
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
        "h-full transition-all duration-300 ease-in-out border-l border-sidebar-border bg-sidebar text-sidebar-foreground backdrop-blur-none",
        isExpanded ? "w-96" : "w-12",
        className
      )}
      style={{ backgroundColor: 'hsl(var(--sidebar))' }}
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
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-sidebar-foreground">GPU Assistant</h3>
                  {isUsingClientSide ? (
                    <Wifi className="h-3 w-3 text-blue-500" title="Power Platform Mode" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-green-500" title="Local Development Mode" />
                  )}
                </div>
                <p className="text-xs text-sidebar-foreground/60">
                  {environmentInfo.isPowerPlatform 
                    ? "Power Platform deployment" 
                    : "Ask about your GPU deployments"
                  }
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
                  <div className="text-red-800 dark:text-red-200 text-sm">
                    <div className="font-medium mb-1">
                      {isUsingClientSide ? 'Power Platform Chat Error' : 'Local Server Chat Error'}
                    </div>
                    <p>
                      {error.message.includes('API key') 
                        ? `OpenAI API key not configured. ${
                            environmentInfo.isPowerPlatform 
                              ? 'Please set VITE_OPENAI_API_KEY in your environment before building.'
                              : 'Please check your .env.local file.'
                          }`
                        : error.message.includes('405') || error.message.includes('UnsupportedHttpVerb')
                        ? 'API endpoint not available in Power Platform. Using client-side integration.'
                        : `Chat error: ${error.message}`
                      }
                    </p>
                    {isUsingClientSide && (
                      <p className="text-xs mt-2 opacity-75">
                        Running in Power Platform client-side mode
                      </p>
                    )}
                  </div>
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