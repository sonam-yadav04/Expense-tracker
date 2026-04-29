import React, { useEffect, useState, useCallback } from 'react';
import { expenseAPI } from '../services/api';
import { useAuth } from '../context/Authcontext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, getCategoryInfo, getMonthOptions, CATEGORIES } from '../utils/helpers';

const BAR_HEIGHT = 180;

const AnalyticsPage = () => {
  const { token } = useAuth();
  const toast     = useToast();
  const [monthly, setMonthly]     = useState([]);
  const [catSummary, setCatSummary] = useState([]);
  const [selMonth, setSelMonth]   = useState('');
  const [loading, setLoading]     = useState(true);

  const monthOptions = getMonthOptions();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [mon, cat] = await Promise.all([
        expenseAPI.getMonthly(token),
        expenseAPI.getSummary({ month: selMonth }, token),
      ]);
      setMonthly(mon.monthly || []);
      setCatSummary(cat.categories || []);
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [token, selMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const maxMonthly = monthly.length ? Math.max(...monthly.map(m => m.total), 1) : 1;
  const totalSpent = catSummary.reduce((s, c) => s + c.total, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Visual breakdown of your spending</p>
        </div>
        <select
          className="filter-select"
          value={selMonth}
          onChange={e => setSelMonth(e.target.value)}
        >
          <option value="">All Time</option>
          {monthOptions.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-overlay" style={{ paddingTop: 80 }}>
          <span className="loading-spinner" /> Crunching numbers…
        </div>
      ) : (
        <>
          {/* Monthly bar chart */}
          <div className="card card-elevated" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <div>
                <div className="card-title">Monthly Spending Trend</div>
                <div className="card-subtitle">Last 6 months</div>
              </div>
            </div>

            {monthly.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 0' }}>
                <div className="empty-icon">📈</div>
                <p className="empty-desc">No monthly data available yet</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 16,
                  padding: '0 8px 16px',
                  minWidth: 400,
                  height: BAR_HEIGHT + 60,
                }}>
                  {monthly.slice(-6).map((m, i) => {
                    const barH = Math.max((m.total / maxMonthly) * BAR_HEIGHT, 4);
                    const isMax = m.total === maxMonthly;
                    return (
                      <div
                        key={i}
                        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
                      >
                        <div style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: 'var(--text-muted)',
                          textAlign: 'center',
                        }}>
                          {formatCurrency(m.total, 'INR').replace('₹', '₹')}
                        </div>
                        <div style={{
                          width: '100%',
                          height: barH,
                          borderRadius: '6px 6px 0 0',
                          background: isMax
                            ? 'var(--accent-primary)'
                            : 'linear-gradient(180deg, var(--bg-hover) 0%, var(--bg-elevated) 100%)',
                          border: isMax ? '1px solid rgba(108,99,255,0.4)' : '1px solid var(--border-subtle)',
                          transition: 'height 0.8s cubic-bezier(0.4,0,0.2,1)',
                          position: 'relative',
                          cursor: 'default',
                        }}>
                          {isMax && (
                            <div style={{
                              position: 'absolute',
                              top: -20,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              background: 'var(--accent-primary)',
                              color: 'white',
                              fontSize: 10,
                              padding: '2px 6px',
                              borderRadius: 4,
                              whiteSpace: 'nowrap',
                              fontWeight: 700,
                            }}>Peak</div>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center' }}>
                          {new Date(m.year, m.month - 1).toLocaleDateString('en-IN', { month: 'short' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Category breakdown table */}
          <div className="card card-elevated">
            <div className="card-header">
              <div>
                <div className="card-title">Category Analysis</div>
                <div className="card-subtitle">
                  {selMonth ? 'Selected month' : 'All time'} — Total: {formatCurrency(totalSpent)}
                </div>
              </div>
            </div>

            {catSummary.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 0' }}>
                <div className="empty-icon">📦</div>
                <p className="empty-desc">No category data for this period</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {CATEGORIES.map(cat => {
                  const found = catSummary.find(c => c._id === cat.value);
                  if (!found) return null;
                  const pct = totalSpent > 0 ? (found.total / totalSpent) * 100 : 0;
                  return (
                    <div key={cat.value} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '14px 0',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}>
                      <div style={{
                        width: 40, height: 40,
                        background: `${cat.color}20`,
                        borderRadius: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, flexShrink: 0,
                      }}>{cat.emoji}</div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>
                          {cat.label}
                        </div>
                        <div style={{ background: 'var(--bg-elevated)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: cat.color,
                            borderRadius: 3,
                            transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                          }} />
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {formatCurrency(found.total)}
                        </div>
                        <div style={{ fontSize: 12, color: cat.color, fontWeight: 600 }}>
                          {pct.toFixed(1)}%
                        </div>
                      </div>

                      <div style={{
                        minWidth: 32, textAlign: 'right',
                        fontSize: 12, color: 'var(--text-muted)',
                      }}>
                        {found.count}×
                      </div>
                    </div>
                  );
                }).filter(Boolean)}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;