import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UsersList from './pages/UsersList';
import UserDetails from './pages/UserDetails';
import DisputesList from './pages/DisputesList';
import DisputeDetails from './pages/DisputeDetails';
import AdminManagement from './pages/AdminManagement';
import TransactionsList from './pages/TransactionsList';
import EscrowsList from './pages/EscrowsList';
import EscrowDetails from './pages/EscrowDetails';
import AppSettings from './pages/AppSettings';
import BusinessAccountsList from './pages/BusinessAccountsList';
import BusinessAccountDetails from './pages/BusinessAccountDetails';
import SupportInbox from './pages/SupportInbox';

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UsersList />} />
            <Route path="users/:id" element={<UserDetails />} />
            <Route path="disputes" element={<DisputesList />} />
            <Route path="disputes/:id" element={<DisputeDetails />} />
            <Route path="transactions" element={<TransactionsList />} />
            <Route path="escrows" element={<EscrowsList />} />
            <Route path="escrows/:id" element={<EscrowDetails />} />
            <Route path="admin-management" element={<AdminManagement />} />
            <Route path="app-settings" element={<AppSettings />} />
            <Route path="business-accounts" element={<BusinessAccountsList />} />
            <Route path="business-accounts/:userId/:accountId" element={<BusinessAccountDetails />} />
            <Route path="support" element={<SupportInbox />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
