import React, { createContext, useContext, useReducer, useCallback } from 'react';

const ExpenseContext = createContext(null);

const initialState = {
  expenses: [],
  loading: false,
  error: null,
  filters: { category: '', month: '', search: '' },
  pagination: { page: 1, limit: 10, total: 0 },
};

function expenseReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':  return { ...state, loading: action.payload };
    case 'SET_ERROR':    return { ...state, error: action.payload, loading: false };
    case 'SET_EXPENSES': return { ...state, expenses: action.payload, loading: false, error: null };
    case 'SET_PAGINATION': return { ...state, pagination: { ...state.pagination, ...action.payload } };
    case 'ADD_EXPENSE':  return { ...state, expenses: [action.payload, ...state.expenses] };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(e => e._id === action.payload._id ? action.payload : e),
      };
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e._id !== action.payload) };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload }, pagination: { ...state.pagination, page: 1 } };
    case 'CLEAR_ERROR':  return { ...state, error: null };
    default: return state;
  }
}

export const ExpenseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  const setLoading   = useCallback((v) => dispatch({ type: 'SET_LOADING', payload: v }), []);
  const setError     = useCallback((e) => dispatch({ type: 'SET_ERROR', payload: e }), []);
  const setExpenses  = useCallback((d) => dispatch({ type: 'SET_EXPENSES', payload: d }), []);
  const setPagination = useCallback((p) => dispatch({ type: 'SET_PAGINATION', payload: p }), []);
  const addExpense   = useCallback((e) => dispatch({ type: 'ADD_EXPENSE', payload: e }), []);
  const updateExpense = useCallback((e) => dispatch({ type: 'UPDATE_EXPENSE', payload: e }), []);
  const deleteExpense = useCallback((id) => dispatch({ type: 'DELETE_EXPENSE', payload: id }), []);
  const setFilters   = useCallback((f) => dispatch({ type: 'SET_FILTERS', payload: f }), []);
  const clearError   = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  return (
    <ExpenseContext.Provider value={{
      ...state,
      setLoading, setError, setExpenses, setPagination,
      addExpense, updateExpense, deleteExpense, setFilters, clearError,
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenses must be used within ExpenseProvider');
  return ctx;
};