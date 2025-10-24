import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomNav } from "@/components/BottomNav";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Weather from "./pages/Weather";
import AIAdvisor from "./pages/AIAdvisor";
import Calculators from "./pages/Calculators";
import PestIdentifier from "./pages/PestIdentifier";
import Profile from "./pages/Profile";
import FarmProfileSetup from "./pages/FarmProfileSetup";
import IoTDashboard from "./pages/IoTDashboard";
import SoilAnalysis from "./pages/SoilAnalysis";
import NotFound from "./pages/NotFound";

const AppContent = () => {
  const location = useLocation();
  const showNavigation = !["/", "/signup", "/auth/callback"].includes(location.pathname);

  return (
    <>
      {showNavigation ? (
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <main className="flex-1 w-full">
              <Routes>
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
                <Route path="/ai-advisor" element={<ProtectedRoute><AIAdvisor /></ProtectedRoute>} />
                <Route path="/calculators" element={<ProtectedRoute><Calculators /></ProtectedRoute>} />
                <Route path="/pest-identifier" element={<ProtectedRoute><PestIdentifier /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/farm-profile" element={<ProtectedRoute><FarmProfileSetup /></ProtectedRoute>} />
                <Route path="/iot-dashboard" element={<ProtectedRoute><IoTDashboard /></ProtectedRoute>} />
                <Route path="/soil-analysis" element={<ProtectedRoute><SoilAnalysis /></ProtectedRoute>} />
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
          <Route path="/auth/callback" element={<AuthCallback />} />
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
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
