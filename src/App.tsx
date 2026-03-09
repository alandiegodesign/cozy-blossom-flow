import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import EventDetailPage from "./pages/EventDetailPage";
import CreateEventPage from "./pages/CreateEventPage";
import EditEventPage from "./pages/EditEventPage";
import ProducerDashboardPage from "./pages/ProducerDashboardPage";
import DashboardOverviewPage from "./pages/DashboardOverviewPage";
import ManageLocationsPage from "./pages/ManageLocationsPage";
import TicketSelectionPage from "./pages/TicketSelectionPage";
import CheckoutPage from "./pages/CheckoutPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import SoldTicketsPage from "./pages/SoldTicketsPage";
import ArchivedEventsPage from "./pages/ArchivedEventsPage";
import TrashPage from "./pages/TrashPage";
import RevenueDashboardPage from "./pages/RevenueDashboardPage";
import ValidateTicketsPage from "./pages/ValidateTicketsPage";
import MyPagePage from "./pages/MyPagePage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminProducerDetailPage from "./pages/AdminProducerDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function ProducerRoute({ children }: { children: React.ReactNode }) {
  const { session, profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!session) return <Navigate to="/login" replace />;
  if (profile && profile.user_type !== 'produtor') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { session, isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!session) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (session) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
    <Route path="/event/:id" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    <Route path="/my-orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
    <Route path="/create-event" element={<ProducerRoute><CreateEventPage /></ProducerRoute>} />
    <Route path="/edit-event/:id" element={<ProducerRoute><EditEventPage /></ProducerRoute>} />
    <Route path="/my-page" element={<ProducerRoute><MyPagePage /></ProducerRoute>} />
    <Route path="/dashboard" element={<ProducerRoute><DashboardOverviewPage /></ProducerRoute>} />
    <Route path="/dashboard/:eventId" element={<ProducerRoute><ProducerDashboardPage /></ProducerRoute>} />
    <Route path="/revenue" element={<ProducerRoute><RevenueDashboardPage /></ProducerRoute>} />
    <Route path="/manage-locations/:eventId" element={<ProducerRoute><ManageLocationsPage /></ProducerRoute>} />
    <Route path="/sold-tickets" element={<ProducerRoute><SoldTicketsPage /></ProducerRoute>} />
    <Route path="/archived" element={<ProducerRoute><ArchivedEventsPage /></ProducerRoute>} />
    <Route path="/trash" element={<ProducerRoute><TrashPage /></ProducerRoute>} />
    <Route path="/validate-tickets" element={<ProducerRoute><ValidateTicketsPage /></ProducerRoute>} />
    <Route path="/tickets/:eventId" element={<ProtectedRoute><TicketSelectionPage /></ProtectedRoute>} />
    <Route path="/checkout/:eventId" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
    <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
