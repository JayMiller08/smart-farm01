import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomNav } from "@/components/BottomNav";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Weather from "./pages/Weather";
import AIAdvisor from "./pages/AIAdvisor";
import Calculators from "./pages/Calculators";
import PestIdentifier from "./pages/PestIdentifier";
import Profile from "./pages/Profile";
import FarmProfileSetup from "./pages/FarmProfileSetup";
import IoTDashboard from "./pages/IoTDashboard";
import NotFound from "./pages/NotFound";

const AppContent = () => {
  const location = useLocation();
  const showNavigation = !["/", "/signup"].includes(location.pathname);

  return (
    <>
      {showNavigation ? (
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <main className="flex-1 w-full">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/weather" element={<Weather />} />
                <Route path="/ai-advisor" element={<AIAdvisor />} />
                <Route path="/calculators" element={<Calculators />} />
                <Route path="/pest-identifier" element={<PestIdentifier />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/farm-profile" element={<FarmProfileSetup />} />
                <Route path="/iot-dashboard" element={<IoTDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <BottomNav />
            </main>
          </div>
        </SidebarProvider>
      ) : (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
