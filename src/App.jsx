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
            <Route path="admin-management" element={<AdminManagement />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
