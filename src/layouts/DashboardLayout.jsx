import React, { useContext, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, AlertCircle, Shield, LogOut, Menu, X, CreditCard } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const DashboardLayout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="app-container">
      {/* Mobile overlay */}
      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={closeSidebar}></div>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Xkrow Admin</span>
          <button className="mobile-close-btn" onClick={closeSidebar}>
            <X size={20} />
          </button>
        </div>
        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end onClick={closeSidebar}>
            <LayoutDashboard size={20} />
            Finance Overview
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <Users size={20} />
            Users
          </NavLink>
          <NavLink to="/disputes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <AlertCircle size={20} />
            Disputes
          </NavLink>
          <NavLink to="/transactions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <CreditCard size={20} />
            Transactions
          </NavLink>
          <NavLink to="/admin-management" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <Shield size={20} />
            Admin Management
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button className="nav-link" style={{ width: '100%', color: 'var(--danger-color)' }} onClick={handleLogout}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Dashboard</h2>
          </div>
          <div>
            <span className="badge badge-success" style={{ padding: '6px 12px' }}>Admin Online</span>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
