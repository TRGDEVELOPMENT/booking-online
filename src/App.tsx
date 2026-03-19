import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import FunctionOverviewPage from "@/pages/FunctionOverviewPage";
import TestCasesPage from "@/pages/TestCasesPage";
import ReservationList from "@/pages/ReservationList";
import ReservationCreate from "@/pages/ReservationCreate";
import ReservationEdit from "@/pages/ReservationEdit";
import ReservationPrint from "@/pages/ReservationPrint";
import ReservationCancelPage from "@/pages/ReservationCancelPage";
import ReservationCancelDetail from "@/pages/ReservationCancelDetail";
import ReservationCancelPrint from "@/pages/ReservationCancelPrint";
import ReservationPendingPaymentPage from "@/pages/ReservationPendingPaymentPage";
import Login from "@/pages/Login";
import NotFound from "./pages/NotFound";

// Settings Pages
import SettingsIndex from "@/pages/settings/SettingsIndex";
import VehicleTypesPage from "@/pages/settings/VehicleTypesPage";
import ModelsPage from "@/pages/settings/ModelsPage";
import SubModelsPage from "@/pages/settings/SubModelsPage";
import ColorsPage from "@/pages/settings/ColorsPage";
import EngineSizesPage from "@/pages/settings/EngineSizesPage";
import FuelTypesPage from "@/pages/settings/FuelTypesPage";
import StandardPricesPage from "@/pages/settings/StandardPricesPage";
import FreebiesPage from "@/pages/settings/FreebiesPage";
import AccessoriesPage from "@/pages/settings/AccessoriesPage";
import BenefitsPage from "@/pages/settings/BenefitsPage";
import SurnamesPage from "@/pages/settings/SurnamesPage";
import CustomersPage from "@/pages/settings/CustomersPage";
import BranchesPage from "@/pages/settings/BranchesPage";
import UsersPage from "@/pages/settings/UsersPage";
import UserGroupsPage from "@/pages/settings/UserGroupsPage";
import UserPermissionsPage from "@/pages/settings/UserPermissionsPage";

// Reports Pages
import MonthlyReservationsPage from "@/pages/reports/MonthlyReservationsPage";
import PendingApprovalPage from "@/pages/reports/PendingApprovalPage";
import CancelledReservationsPage from "@/pages/reports/CancelledReservationsPage";

// Documentation
import DocumentationPage from "@/pages/DocumentationPage";
import ApiSpecPage from "@/pages/ApiSpecPage";

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
              <Route path="/function-overview" element={<FunctionOverviewPage />} />
              <Route path="/test-cases" element={<TestCasesPage />} />
              <Route path="/reservations" element={<ReservationList />} />
              <Route path="/reservations/create" element={<ReservationCreate />} />
              <Route path="/reservations/:id/edit" element={<ReservationEdit />} />
              <Route path="/reservations/cancel" element={<ReservationCancelPage />} />
              <Route path="/reservations/:id/cancel-detail" element={<ReservationCancelDetail />} />
              <Route path="/reservations/pending-payment" element={<ReservationPendingPaymentPage />} />
              
              {/* Reports Routes */}
              <Route path="/reports" element={<MonthlyReservationsPage />} />
              <Route path="/reports/monthly" element={<MonthlyReservationsPage />} />
              <Route path="/reports/pending-approval" element={<PendingApprovalPage />} />
              <Route path="/reports/cancelled" element={<CancelledReservationsPage />} />
              
              {/* Settings Routes */}
              <Route path="/settings" element={<SettingsIndex />} />
              <Route path="/settings/vehicle-types" element={<VehicleTypesPage />} />
              <Route path="/settings/models" element={<ModelsPage />} />
              <Route path="/settings/submodels" element={<SubModelsPage />} />
              <Route path="/settings/colors" element={<ColorsPage />} />
              <Route path="/settings/engine-sizes" element={<EngineSizesPage />} />
              <Route path="/settings/fuel-types" element={<FuelTypesPage />} />
              <Route path="/settings/standard-prices" element={<StandardPricesPage />} />
              <Route path="/settings/freebies" element={<FreebiesPage />} />
              <Route path="/settings/accessories" element={<AccessoriesPage />} />
              <Route path="/settings/benefits" element={<BenefitsPage />} />
              <Route path="/settings/surnames" element={<SurnamesPage />} />
              <Route path="/settings/customers" element={<CustomersPage />} />
              <Route path="/settings/branches" element={<BranchesPage />} />
            </Route>
            {/* Print page outside MainLayout for clean printing */}
            <Route path="/reservations/:id/print" element={<ReservationPrint />} />
            <Route path="/reservations/:id/cancel-print" element={<ReservationCancelPrint />} />
            {/* Documentation pages */}
            <Route path="/docs" element={<DocumentationPage />} />
            <Route path="/api-spec" element={<ApiSpecPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
