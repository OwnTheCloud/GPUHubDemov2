import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ThemeProvider } from "next-themes";
import AppSidebar from "@/components/app-sidebar";
import { ChatPanelProvider, useChatPanel } from "@/components/app-chatpanel";
import AppChatPanel from "@/components/app-chatpanel";
import { useSidebar } from "@/components/ui/sidebar";
import Home from "@/pages/Home";
import UniversalSupply from "@/pages/UniversalSupply";
import InvestigationSignals from "@/pages/signals/InvestigationSignals";
import ExecutionSignals from "@/pages/signals/ExecutionSignals";
import Datacenters from "@/pages/cscp/Datacenters";
import Stamps from "@/pages/cscp/Stamps";
import DemandIDs from "@/pages/cscp/DemandIDs";

const queryClient = new QueryClient();

function MainLayout() {
  const { isExpanded: chatExpanded } = useChatPanel();
  const { state: sidebarState } = useSidebar();
  
  // Calculate dynamic margins based on both sidebar states
  const leftMargin = sidebarState === "collapsed" ? "4rem" : "16rem"; // 64px collapsed, 256px expanded
  const rightMargin = chatExpanded ? "24rem" : "3rem"; // 384px expanded, 48px collapsed
  
  return (
    <div className="h-screen flex">
      {/* Left Sidebar */}
      <AppSidebar />
      
      {/* Dynamic Main Content Area */}
      <div 
        className="flex-1 transition-all duration-300 ease-in-out"
        style={{ 
          marginRight: rightMargin 
        }}
      >
        <SidebarInset className="w-full h-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/universal-supply" element={<UniversalSupply />} />
            <Route path="/investigation-signals" element={<InvestigationSignals />} />
            <Route path="/execution-signals" element={<ExecutionSignals />} />
            <Route path="/datacenters" element={<Datacenters />} />
            <Route path="/stamps" element={<Stamps />} />
            <Route path="/demand-ids" element={<DemandIDs />} />
          </Routes>
        </SidebarInset>
      </div>
      
      {/* Chat panel positioned absolutely on the right */}
      <div className="fixed right-0 top-0 h-full z-50">
        <AppChatPanel />
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ChatPanelProvider>
            <SidebarProvider>
              <MainLayout />
            </SidebarProvider>
          </ChatPanelProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;