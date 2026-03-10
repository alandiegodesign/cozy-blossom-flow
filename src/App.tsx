import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const HomePage = lazy(() => import("./pages/HomePage"));
const EventDetailPage = lazy(() => import("./pages/EventDetailPage"));
const CreateEventPage = lazy(() => import("./pages/CreateEventPage"));
const EditEventPage = lazy(() => import("./pages/EditEventPage"));
const ProducerDashboardPage = lazy(() => import("./pages/ProducerDashboardPage"));
const DashboardOverviewPage = lazy(() => import("./pages/DashboardOverviewPage"));
const ManageLocationsPage = lazy(() => import("./pages/ManageLocationsPage"));
const TicketSelectionPage = lazy(() => import("./pages/TicketSelectionPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const MyOrdersPage = lazy(() => import("./pages/MyOrdersPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SoldTicketsPage = lazy(() => import("./pages/SoldTicketsPage"));
const ArchivedEventsPage = lazy(() => import("./pages/ArchivedEventsPage"));
const TrashPage = lazy(() => import("./pages/TrashPage"));
const RevenueDashboardPage = lazy(() => import("./pages/RevenueDashboardPage"));
const ValidateTicketsPage = lazy(() => import("./pages/ValidateTicketsPage"));
const MyPagePage = lazy(() => import("./pages/MyPagePage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const AdminProducerDetailPage = lazy(() => import("./pages/AdminProducerDetailPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

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

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>
);

const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
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
      <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      <Route path="/admin/producer/:producerId" element={<AdminRoute><AdminProducerDetailPage /></AdminRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
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
