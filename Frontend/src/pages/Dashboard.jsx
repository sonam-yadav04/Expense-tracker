import React, { useEffect, useState, useCallback } from 'react';
import { expenseAPI } from '../services/api';
import { useAuth } from '../context/Authcontext';
import { useToast } from '../context/ToastContext';
import {
  formatCurrency, formatDate, getCategoryInfo, CATEGORIES, getMonthYear,
} from '../utils/helpers';
import DonutChart from '../components/DonutChart';

const SkeletonStat = () => (
  <div className="stat-card">
    <div className="skeleton skeleton-text" style={{ width: 80, marginBottom: 14 }} />
    <div className="skeleton skeleton-title" style={{ width: 120, height: 32, marginBottom: 8 }} />
    <div className="skeleton skeleton-text" style={{ width: 60 }} />
  </div>
);

const Dashboard = ({ onNavigate }) => {
  const { token } = useAuth();
  const toast = useToast();
  const [summary, setSummary]     = useState(null);
  const [recent, setRecent]       = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingRecent, setLoadingRecent]   = useState(true);

  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  const fetchData = useCallback(async () => {
    setLoadingSummary(true);
    setLoadingRecent(true);
    try {
      const [sumData, recentData] = await Promise.all([
        expenseAPI.getSummary({ month: currentMonth }, token),
        expenseAPI.getAll({ limit: 5, page: 1 }, token),
      ]);
      setSummary(sumData);
      setRecent(recentData.expenses || []);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoadingSummary(false);
      setLoadingRecent(false);
    }
  }, [token, currentMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const total       = summary?.total || 0;
  const count       = summary?.count || 0;
  const categories  = summary?.categories || [];
  const prevTotal   = summary?.prevTotal || 0;
  const avgPerDay   = summary?.avgPerDay || 0;

  const changeAmt  = total - prevTotal;
  const changePct  = prevTotal > 0 ? ((changeAmt / prevTotal) * 100).toFixed(1) : null;

  // Enrich category data
  const enriched = categories.map(c => {
    const info = getCategoryInfo(c._id);
    return { ...c, label: info.label, emoji: info.emoji, color: info.color };
  });

  // Category bar chart
  const maxCatTotal = enriched.length ? Math.max(...enriched.map(c => c.total)) : 1;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{getMonthYear(new Date())} — Overview</p>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate('expenses', { openAdd: true })}>
          + Add Expense
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {loadingSummary ? (
          [1,2,3,4].map(i => <SkeletonStat key={i} />)
        ) : (
          <>
            <div className="stat-card purple">
              <div className="stat-label"><span className="stat-icon">💸</span>Total Spent</div>
              <div className="stat-value">{formatCurrency(total)}</div>
              <div className={`stat-change ${changeAmt > 0 ? 'down' : changeAmt < 0 ? 'up' : 'neutral'}`}>
                {changePct != null
                  ? <>{changeAmt > 0 ? '▲' : '▼'} {Math.abs(changePct)}% vs last month</>
                  : 'No previous month data'}
              </div>
            </div>

            <div className="stat-card teal">
              <div className="stat-label"><span className="stat-icon">📋</span>Transactions</div>
              <div className="stat-value">{count}</div>
              <div className="stat-change neutral">This month</div>
            </div>

            <div className="stat-card yellow">
              <div className="stat-label"><span className="stat-icon">📅</span>Avg / Day</div>
              <div className="stat-value">{formatCurrency(avgPerDay)}</div>
              <div className="stat-change neutral">Daily average</div>
            </div>

            <div className="stat-card red">
              <div className="stat-label"><span className="stat-icon">🏆</span>Top Category</div>
              <div className="stat-value" style={{ fontSize: 26 }}>
                {enriched[0] ? `${enriched[0].emoji} ${enriched[0].label}` : '—'}
              </div>
              <div className="stat-change neutral">
                {enriched[0] ? formatCurrency(enriched[0].total) : 'No data'}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts + Recent */}
      <div className="dashboard-grid">
        {/* Donut */}
        <div className="card card-elevated">
          <div className="card-header">
            <div>
              <div className="card-title">Category Breakdown</div>
              <div className="card-subtitle">This month's spending</div>
            </div>
          </div>
          {loadingSummary ? (
            <div className="loading-overlay">
              <span className="loading-spinner" /> Loading chart…
            </div>
          ) : enriched.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-icon">📊</div>
              <p className="empty-desc">No expense data for this month</p>
            </div>
          ) : (
            <DonutChart data={enriched} total={total} />
          )}
        </div>

        {/* Category bars */}
        <div className="card card-elevated">
          <div className="card-header">
            <div>
              <div className="card-title">Spending by Category</div>
              <div className="card-subtitle">Ranked by amount</div>
            </div>
          </div>
          {loadingSummary ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[1,2,3,4].map(i => (
                <div key={i} className="skeleton" style={{ height: 18, borderRadius: 4 }} />
              ))}
            </div>
          ) : enriched.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-icon">📦</div>
              <p className="empty-desc">Add some expenses to see breakdown</p>
            </div>
          ) : (
            <div className="category-list">
              {enriched.slice(0, 6).map(cat => (
                <div key={cat._id} className="category-row">
                  <span className="category-dot" style={{ background: cat.color }} />
                  <span className="category-name">{cat.emoji} {cat.label}</span>
                  <div className="category-bar-track">
                    <div
                      className="category-bar-fill"
                      style={{
                        width: `${(cat.total / maxCatTotal) * 100}%`,
                        background: cat.color,
                      }}
                    />
                  </div>
                  <span className="category-amount">{formatCurrency(cat.total)}</span>
                  <span className="category-pct">{((cat.total / total) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div className="card card-elevated full-width">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Transactions</div>
              <div className="card-subtitle">Latest 5 expenses</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('expenses')}>
              View all →
            </button>
          </div>

          {loadingRecent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '10px 0' }}>
                  <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                    <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                  </div>
                  <div className="skeleton skeleton-text" style={{ width: 70 }} />
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💳</div>
              <p className="empty-title">No expenses yet</p>
              <p className="empty-desc">Add your first expense to get started!</p>
              <button className="btn btn-primary btn-sm" onClick={() => onNavigate('expenses', { openAdd: true })}>
                + Add Expense
              </button>
            </div>
          ) : (
            <div className="transactions-list">
              {recent.map(exp => {
                const cat = getCategoryInfo(exp.category);
                return (
                  <div key={exp._id} className="transaction-item">
                    <div className="transaction-icon" style={{ background: `${cat.color}20` }}>
                      {cat.emoji}
                    </div>
                    <div className="transaction-info">
                      <div className="transaction-title">{exp.title || cat.label}</div>
                      <div className="transaction-meta">{formatDate(exp.date)}</div>
                    </div>
                    <span className={`badge badge-${exp.category}`}>{cat.label}</span>
                    <div className="transaction-amount">−{formatCurrency(exp.amount)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;