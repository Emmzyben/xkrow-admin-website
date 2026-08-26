import React, { useContext, useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Users, AlertCircle, Shield, LogOut, Menu, X, CreditCard, PackageOpen, Settings, Briefcase, Headphones, Bell, MessageSquare, ExternalLink } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../constants';
import io from 'socket.io-client';

const NotificationDropdown = ({ token }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const unreadCount = notifications.filter(notification => !notification.read).length;

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) setNotifications(await response.json());
    } catch (error) {
      console.error('Failed to fetch admin notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const socket = io(BASE_URL, { auth: { token } });
    socket.on('admin_notification', notification => {
      setNotifications(previous => [
        { ...notification, id: `live-${Date.now()}`, read: false },
        ...previous
      ]);
    });
    return () => socket.disconnect();
  }, [token]);

  useEffect(() => {
    const handleOutsideClick = event => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const markAsRead = async notification => {
    if (notification.read || notification.id.startsWith('live-')) return;
    try {
      await fetch(`${BASE_URL}/api/admin/notifications/${notification.id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(previous => previous.map(item =>
        item.id === notification.id ? { ...item, read: true } : item
      ));
    } catch (error) {
      console.error('Failed to mark admin notification as read:', error);
    }
  };

  const getNotificationLink = notification => {
    if (notification.type === 'dispute' && notification.data?.escrowId) {
      return `/disputes/${notification.data.escrowId}`;
    }
    return '/support';
  };

  return (
    <div ref={containerRef} style={styles.notificationWrap}>
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={isOpen}
        style={styles.notificationButton}
        onClick={() => setIsOpen(previous => !previous)}
      >
        <Bell size={19} />
        {unreadCount > 0 && <span style={styles.notificationCount}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>
      {isOpen && (
        <div style={styles.notificationPanel}>
          <div style={styles.notificationHeader}>
            <strong>Notifications</strong>
            <span>{unreadCount} unread</span>
          </div>
          <div style={styles.notificationList}>
            {notifications.length === 0 ? (
              <div style={styles.notificationEmpty}>No support or dispute requests</div>
            ) : notifications.slice(0, 30).map(notification => (
              <Link
                key={notification.id}
                to={getNotificationLink(notification)}
                style={{ ...styles.notificationItem, ...(notification.read ? {} : styles.notificationUnread) }}
                onClick={() => { markAsRead(notification); setIsOpen(false); }}
              >
                <span style={styles.notificationIcon}>
                  {notification.type === 'dispute' ? <AlertCircle size={16} /> : <MessageSquare size={16} />}
                </span>
                <span style={styles.notificationContent}>
                  <strong>{notification.title}</strong>
                  <span>{notification.body}</span>
                  <small>{new Date(notification.createdAt).toLocaleString()}</small>
                </span>
                <ExternalLink size={14} style={{ flexShrink: 0, opacity: 0.55 }} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const DashboardLayout = () => {
  const { logout, user } = useContext(AuthContext);
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
          <NavLink to="/escrows" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <PackageOpen size={20} />
            Escrows
          </NavLink>
          <NavLink to="/admin-management" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <Shield size={20} />
            Admin Management
          </NavLink>
          <NavLink to="/app-settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <Settings size={20} />
            App Settings
          </NavLink>
          <NavLink to="/business-accounts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <Briefcase size={20} />
            Business Accounts
          </NavLink>
          <NavLink to="/support" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <Headphones size={20} />
            Support Inbox
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <NotificationDropdown token={token} />
            <span className="badge badge-success" style={{ padding: '6px 12px' }}>{user?.name || 'Admin'} Online</span>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const styles = {
  notificationWrap: { position: 'relative' },
  notificationButton: {
    position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 36, height: 36, border: '1px solid var(--border-color)', borderRadius: 8,
    background: 'var(--sidebar-bg)', color: 'var(--text-primary)', cursor: 'pointer'
  },
  notificationCount: {
    position: 'absolute', top: -6, right: -6, minWidth: 18, height: 18, padding: '0 4px',
    borderRadius: 9, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  notificationPanel: {
    position: 'absolute', top: 46, right: 0, width: 360, maxWidth: 'calc(100vw - 32px)',
    background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 8,
    boxShadow: '0 12px 30px rgba(0,0,0,0.18)', zIndex: 20, overflow: 'hidden'
  },
  notificationHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px',
    borderBottom: '1px solid var(--border-color)', fontSize: 13
  },
  notificationList: { maxHeight: 420, overflowY: 'auto' },
  notificationItem: {
    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
    color: 'var(--text-primary)', textDecoration: 'none', borderBottom: '1px solid var(--border-color)'
  },
  notificationUnread: { background: 'rgba(99,102,241,0.08)' },
  notificationIcon: { color: '#6366f1', paddingTop: 2 },
  notificationContent: { display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0, fontSize: 12 },
  notificationEmpty: { padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12 }
};

export default DashboardLayout;
