import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MembersPage from './pages/MembersPage';
import ChitFundsPage from './pages/ChitFundsPage';
import ChitFundTemplatesPage from './pages/ChitFundTemplatesPage';
import TransactionsPage from './pages/TransactionsPage';
import MemberDetailPage from './pages/MemberDetailPage';
import ChitFundDetailPage from './pages/ChitFundDetailPage';
import ChitFundFormPage from './pages/ChitFundFormPage';
import ChitFundContributionsPage from './pages/ChitFundContributionsPage';
import ChitFundTemplateDetailPage from './pages/ChitFundTemplateDetailPage';
import ChitFundTemplateFormPage from './pages/ChitFundTemplateFormPage';
import TransactionDetailPage from './pages/TransactionDetailPage';

interface RouteProps {
  children: React.ReactNode;
}

// Protected Route Component
const ProtectedRoute = ({ children }: RouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route (Accessible only when logged out)
const PublicRoute = ({ children }: RouteProps) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />

          {/* Protected Main Layout Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="members/:id" element={<MemberDetailPage />} />
            <Route path="chitfunds" element={<ChitFundsPage />} />
            <Route path="chitfunds/new" element={<ChitFundFormPage />} />
            <Route path="chitfunds/:id" element={<ChitFundDetailPage />} />
            <Route path="chitfunds/:id/contributions" element={<ChitFundContributionsPage />} />
            <Route path="chitfunds/:id/edit" element={<ChitFundFormPage />} />
            <Route path="chitfund-templates" element={<ChitFundTemplatesPage />} />
            <Route path="chitfund-templates/new" element={<ChitFundTemplateFormPage />} />
            <Route path="chitfund-templates/:id" element={<ChitFundTemplateDetailPage />} />
            <Route path="chitfund-templates/:id/edit" element={<ChitFundTemplateFormPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="transactions/:id" element={<TransactionDetailPage />} />

            {/* Placeholder for Loans */}
            <Route path="loans" element={<div className="p-8 text-center text-slate-400">Loans Management Coming Soon</div>} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
