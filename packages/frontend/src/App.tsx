import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';
import { CreateExpenseReportPage } from '@/pages/CreateExpenseReportPage';
import { EditExpenseReportPage } from '@/pages/EditExpenseReportPage';
import { ExpenseReportListPage } from '@/pages/ExpenseReportListPage';
import { ExpenseReportDetailPage } from '@/pages/ExpenseReportDetailPage';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            
            {/* Employee Routes */}
            <Route path="/expense-reports" element={
              <ProtectedRoute>
                <ExpenseReportListPage />
              </ProtectedRoute>
            } />
            <Route path="/expense-reports/new" element={
              <ProtectedRoute requiredRole="employee">
                <CreateExpenseReportPage />
              </ProtectedRoute>
            } />
            <Route path="/expense-reports/:id" element={
              <ProtectedRoute>
                <ExpenseReportDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/expense-reports/:id/edit" element={
              <ProtectedRoute requiredRole="employee">
                <EditExpenseReportPage />
              </ProtectedRoute>
            } />
            
            {/* Accounting Routes */}
            <Route path="/accounting/*" element={
              <ProtectedRoute requiredRole="accounting">
                <div>Accounting Dashboard (Coming Soon)</div>
              </ProtectedRoute>
            } />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;