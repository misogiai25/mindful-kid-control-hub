
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { KidSafeProvider } from "@/context/KidSafeContext";

// Pages
import Login from "./pages/Login";
import Index from "./pages/Index";
import AppLayout from "./components/layout/AppLayout";
import ChildProfile from "./pages/ChildProfile";
import Reports from "./pages/Reports";
import Schedule from "./pages/Schedule";
import ChildDashboard from "./pages/ChildDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <KidSafeProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Index />} />
              <Route path="child/:id" element={<ChildProfile />} />
              <Route path="reports" element={<Reports />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="child" element={<ChildDashboard />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </KidSafeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
