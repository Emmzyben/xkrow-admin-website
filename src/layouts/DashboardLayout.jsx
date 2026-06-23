import React, { useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, AlertCircle, Shield, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const DashboardLayout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          xKrow Admin
        </div>
        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={20} />
            Finance Overview
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            Users
          </NavLink>
          <NavLink to="/disputes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <AlertCircle size={20} />
            Disputes
          </NavLink>
          <NavLink to="/admin-management" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
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
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Dashboard</h2>
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
