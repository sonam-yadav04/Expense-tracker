import React, { useState } from 'react';
import './styles.css';
import { AuthProvider, useAuth } from './context/Authcontext';
import { ExpenseProvider } from './context/Expensecontext';
import { ToastProvider } from './context/ToastContext';
import Authpage from './pages/Authpage';
import Dashboard from './pages/Dashboard';
import ExpensesPage from './pages/ExpensesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import Sidebar from './pages/Sidebar';

const AppShell = () => {
  const { user, loading } = useAuth();
  const [activePage, setActivePage]     = useState('dashboard');
  const [pageProps, setPageProps]       = useState({});
  const [sidebarOpen, setSidebarOpen]   = useState(false);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{ fontSize: 40 }}>💰</div>
        <span className="loading-spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading Expensify…</p>
      </div>
    );
  }

  if (!user) return <Authpage />;

  const navigate = (page, props = {}) => {
    setActivePage(page);
    setPageProps(props);
    setSidebarOpen(false);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':  return <Dashboard onNavigate={navigate} />;
      case 'expenses':   return <ExpensesPage initialOpenAdd={pageProps.openAdd} key={JSON.stringify(pageProps)} />;
      case 'analytics':  return <AnalyticsPage />;
      case 'settings':   return <SettingsPage />;
      default:           return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        activePage={activePage}
        onNavigate={navigate}
        className={sidebarOpen ? 'mobile-open' : ''}
      />

      <div className="main-content">
        {/* Mobile header */}
        <div style={{
          display: 'none',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          alignItems: 'center',
          gap: 12,
          background: 'var(--bg-secondary)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }} className="mobile-header">
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ fontSize: 20, color: 'var(--text-primary)' }}
          >☰</button>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>💰 Expensify</span>
        </div>

        <ExpenseProvider>
          {renderPage()}
        </ExpenseProvider>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;