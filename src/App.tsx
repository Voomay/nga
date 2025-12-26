
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Quotations } from './pages/Quotations';
import { CreateQuote } from './pages/CreateQuote';
import { JobCards } from './pages/JobCards';
import { CreateJobCard } from './pages/CreateJobCard';
import { JobCardPreview } from './pages/JobCardPreview';
import { CreateInvoice } from './pages/CreateInvoice';
import { Invoices } from './pages/Invoices';
import { FinancialReports } from './pages/FinancialReports';
import { Settings } from './pages/Settings';
import { Billing } from './pages/Billing';
import { Support } from './pages/Support';
import { TicketDetails } from './pages/TicketDetails';
import { Inventory } from './pages/Inventory';
import { CreateInventoryPart } from './pages/CreateInventoryPart';
import { Customers } from './pages/Customers';
import { CreateCustomer } from './pages/CreateCustomer';
import { CustomerDetails } from './pages/CustomerDetails';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUserManagement } from './pages/AdminUserManagement';
import { AdminBilling } from './pages/AdminBilling';
import { AdminMemberSubscriptions } from './pages/AdminMemberSubscriptions';
import { AdminSupport } from './pages/AdminSupport';
import { AdminTicketDetails } from './pages/AdminTicketDetails';
import { AdminLandingPageEditor } from './pages/AdminLandingPageEditor';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkshopProvider } from './context/WorkshopContext';
import { DataProvider } from './context/DataContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
};

const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Component for owner-only pages
const OwnerRoute = () => {
  const { user } = useAuth();
  if (user?.role !== 'Owner') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUserManagement />} />
      <Route path="/admin/billing" element={<AdminBilling />} />
      <Route path="/admin/member-subscriptions" element={<AdminMemberSubscriptions />} />
      <Route path="/admin/support" element={<AdminSupport />} />
      <Route path="/admin/support/:id" element={<AdminTicketDetails />} />
      <Route path="/admin/landing-page" element={<AdminLandingPageEditor />} />
      
      <Route path="/" element={<ProtectedRoute />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="quotations" element={<Quotations />} />
        <Route path="quotations/create" element={<CreateQuote />} />
        <Route path="quotations/:id" element={<CreateQuote />} />
        <Route path="job-cards" element={<JobCards />} />
        <Route path="job-cards/create" element={<CreateJobCard />} />
        <Route path="job-cards/:id" element={<CreateJobCard />} />
        <Route path="job-cards/preview/:id" element={<JobCardPreview />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="invoices/create" element={<CreateInvoice />} />
        <Route path="invoices/:id" element={<CreateInvoice />} />
        
        {/* Owner-Only Routes */}
        <Route element={<OwnerRoute />}>
           <Route path="reports" element={<FinancialReports />} />
           <Route path="billing" element={<Billing />} />
        </Route>

        <Route path="support" element={<Support />} />
        <Route path="support/:id" element={<TicketDetails />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="inventory/create" element={<CreateInventoryPart />} />
        <Route path="inventory/:id" element={<CreateInventoryPart />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/create" element={<CreateCustomer />} />
        <Route path="customers/:id" element={<CustomerDetails />} />
        <Route path="customers/:id/edit" element={<CreateCustomer />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <WorkshopProvider>
        <DataProvider>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </DataProvider>
      </WorkshopProvider>
    </AuthProvider>
  );
};

export default App;
