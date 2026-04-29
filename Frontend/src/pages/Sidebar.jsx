import React from 'react';
import { useAuth } from '../context/Authcontext';
import { getInitials } from '../utils/helpers';

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',  icon: '📊' },
  { id: 'expenses',   label: 'Expenses',   icon: '💳' },
  { id: 'analytics',  label: 'Analytics',  icon: '📈' },
  { id: 'settings',   label: 'Settings',   icon: '⚙️' },
];

const Sidebar = ({ activePage, onNavigate }) => {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">💰</div>
        <div className="sidebar-logo-text">
          Expensify
          <span>Finance Tracker</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {NAV_ITEMS.map(item => (
          <div
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="sidebar-footer">
        <div className="user-profile-card">
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">{user?.email}</div>
          </div>
          <button className="btn-logout" onClick={logout} title="Logout">🚪</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;