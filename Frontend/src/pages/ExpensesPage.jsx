import React, { useEffect, useState, useCallback, useRef } from 'react';
import { expenseAPI } from '../services/api';
import { useAuth } from '../context/Authcontext';
import { useExpenses } from '../context/Expensecontext';
import { useToast } from '../context/ToastContext';
import {
  formatCurrency, formatDate, getCategoryInfo, CATEGORIES, getMonthOptions, debounce,
} from '../utils/helpers';
import ExpenseModal from '../../components/ExpenseModal';
import DeleteModal from '../../components/DeleteModal';

const SORT_OPTIONS = [
  { value: 'date_desc',   label: 'Date (Newest)' },
  { value: 'date_asc',    label: 'Date (Oldest)' },
  { value: 'amount_desc', label: 'Amount (High)' },
  { value: 'amount_asc',  label: 'Amount (Low)' },
];

const ExpensesPage = ({ initialOpenAdd }) => {
  const { token } = useAuth();
  const toast = useToast();
  const {
    expenses, loading, error,
    setLoading, setError, setExpenses, setPagination,
    addExpense, updateExpense, deleteExpense,
    filters, setFilters, pagination,
  } = useExpenses();

  const [showModal, setShowModal]       = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving]             = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [sortBy, setSortBy]             = useState('date_desc');
  const [searchInput, setSearchInput]   = useState('');

  const fetchedRef = useRef(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const [field, dir] = sortBy.split('_');
      const data = await expenseAPI.getAll({
        page:     pagination.page,
        limit:    pagination.limit,
        category: filters.category,
        month:    filters.month,
        search:   filters.search,
        sortBy:   field,
        order:    dir,
      }, token);
      setExpenses(data.expenses || []);
      setPagination({ total: data.total || 0, page: data.page || 1 });
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load expenses');
    }
  }, [token, pagination.page, pagination.limit, filters, sortBy]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    if (initialOpenAdd && !fetchedRef.current) {
      fetchedRef.current = true;
      setShowModal(true);
    }
  }, [initialOpenAdd]);

  // Debounced search
  const debouncedSearch = useCallback(debounce((val) => setFilters({ search: val }), 350), []);

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    debouncedSearch(e.target.value);
  };

  // CRUD handlers
  const handleAdd = async (formData) => {
    setSaving(true);
    try {
      const data = await expenseAPI.create(formData, token);
      addExpense(data.expense);
      setShowModal(false);
      toast.success('Expense added successfully! 🎉');
    } catch (err) {
      toast.error(err.message || 'Failed to add expense');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (formData) => {
    setSaving(true);
    try {
      const data = await expenseAPI.update(editTarget._id, formData, token);
      updateExpense(data.expense);
      setEditTarget(null);
      toast.success('Expense updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await expenseAPI.delete(deleteTarget._id, token);
      deleteExpense(deleteTarget._id);
      setDeleteTarget(null);
      toast.success('Expense deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete expense');
    } finally {
      setDeleting(false);
    }
  };

  const monthOptions = getMonthOptions();
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">
            {pagination.total > 0 ? `${pagination.total} record${pagination.total !== 1 ? 's' : ''}` : 'Manage your expenses'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Expense
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            className="form-input"
            type="text"
            placeholder="Search expenses…"
            value={searchInput}
            onChange={handleSearchChange}
          />
        </div>
        <div className="filter-group">
          <select
            className="filter-select"
            value={filters.category}
            onChange={e => setFilters({ category: e.target.value })}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={filters.month}
            onChange={e => setFilters({ month: e.target.value })}
          >
            <option value="">All Months</option>
            {monthOptions.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {(filters.category || filters.month || filters.search) && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setFilters({ category: '', month: '', search: '' });
                setSearchInput('');
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card card-elevated" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-overlay">
            <span className="loading-spinner" /> Loading expenses…
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <p className="empty-title">Failed to load expenses</p>
            <p className="empty-desc">{error}</p>
            <button className="btn btn-primary btn-sm" onClick={fetchExpenses}>Retry</button>
          </div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💸</div>
            <p className="empty-title">
              {filters.category || filters.month || filters.search
                ? 'No matching expenses'
                : 'No expenses yet'}
            </p>
            <p className="empty-desc">
              {filters.category || filters.month || filters.search
                ? 'Try adjusting your filters.'
                : 'Click "Add Expense" to record your first expense!'}
            </p>
            {!filters.category && !filters.month && !filters.search && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                + Add Expense
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="expenses-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(exp => {
                    const cat = getCategoryInfo(exp.category);
                    return (
                      <tr key={exp._id}>
                        <td>
                          <span className={`badge badge-${exp.category}`}>
                            {cat.emoji} {cat.label}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{exp.title || '—'}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{formatDate(exp.date)}</td>
                        <td style={{ color: 'var(--text-muted)', maxWidth: 200 }}>
                          <span className="truncate" style={{ display: 'block', maxWidth: 180 }}>
                            {exp.title || '—'}
                          </span>
                        </td>
                        <td className="table-amount">−{formatCurrency(exp.amount)}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="action-btn edit"
                              title="Edit"
                              onClick={() => setEditTarget(exp)}
                            >✏️</button>
                            <button
                              className="action-btn delete"
                              title="Delete"
                              onClick={() => setDeleteTarget(exp)}
                            >🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: '0 20px 20px' }}>
                <div className="pagination">
                  <span className="pagination-info">
                    Showing {(pagination.page - 1) * pagination.limit + 1}–
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                  </span>
                  <div className="pagination-controls">
                    <button
                      className="page-btn"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination({ page: pagination.page - 1 })}
                    >‹</button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          className={`page-btn ${pagination.page === page ? 'active' : ''}`}
                          onClick={() => setPagination({ page })}
                        >{page}</button>
                      );
                    })}
                    <button
                      className="page-btn"
                      disabled={pagination.page === totalPages}
                      onClick={() => setPagination({ page: pagination.page + 1 })}
                    >›</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <ExpenseModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAdd}
        loading={saving}
      />
      <ExpenseModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEdit}
        initialData={editTarget}
        loading={saving}
      />
      <DeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        expenseName={deleteTarget?.title || getCategoryInfo(deleteTarget?.category)?.label}
      />
    </div>
  );
};

export default ExpensesPage;