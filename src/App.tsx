import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import ReservationList from "@/pages/ReservationList";
import ReservationCreate from "@/pages/ReservationCreate";
import ReservationEdit from "@/pages/ReservationEdit";
import ReservationPrint from "@/pages/ReservationPrint";
import Login from "@/pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/reservations" element={<ReservationList />} />
              <Route path="/reservations/create" element={<ReservationCreate />} />
              <Route path="/reservations/:id/edit" element={<ReservationEdit />} />
            </Route>
            {/* Print page outside MainLayout for clean printing */}
            <Route path="/reservations/:id/print" element={<ReservationPrint />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
