import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/Authcontext';
import { useToast } from '../context/ToastContext';
import { validateLoginForm, validateRegisterForm } from '../utils/helpers';

const AuthPage = () => {
  const { login } = useAuth();
  const toast = useToast();
  const [mode, setMode]     = useState('login');  // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validate = mode === 'login' ? validateLoginForm : validateRegisterForm;
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await authAPI.login({ email: form.email, password: form.password });
        login(data.user, data.token);
        toast.success(`Welcome back, ${data.user.name}! 👋`);
      } else {
        const data = await authAPI.register({ name: form.name, email: form.email, password: form.password });
        login(data.user, data.token);
        toast.success(`Account created! Welcome, ${data.user.name}! 🎉`);
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setForm({ name: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-shape auth-bg-shape-1" />
      <div className="auth-bg-shape auth-bg-shape-2" />

      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">💰</div>
          <div className="auth-logo-name">Expensify</div>
        </div>

        <h1 className="auth-heading">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="auth-subheading">
          {mode === 'login'
            ? 'Sign in to track and manage your expenses.'
            : 'Start managing your finances with clarity.'}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label required">Full Name</label>
              <input
                className={`form-input ${errors.name ? 'error' : ''}`}
                type="text"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
              {errors.name && <span className="form-error">⚠ {errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label required">Email Address</label>
            <input
              className={`form-input ${errors.email ? 'error' : ''}`}
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
            {errors.email && <span className="form-error">⚠ {errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label required">Password</label>
            <input
              className={`form-input ${errors.password ? 'error' : ''}`}
              type="password"
              name="password"
              placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
              value={form.password}
              onChange={handleChange}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            {errors.password && <span className="form-error">⚠ {errors.password}</span>}
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label required">Confirm Password</label>
              <input
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                type="password"
                name="confirmPassword"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <span className="form-error">⚠ {errors.confirmPassword}</span>}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: 8 }}
            disabled={loading}
          >
            {loading
              ? <><span className="loading-spinner"></span> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
              : mode === 'login' ? '🔐 Sign In' : '🚀 Create Account'}
          </button>
        </form>

        {mode === 'login' && (
          <>
            <div className="auth-divider">or try a demo</div>
            <button
              className="btn btn-secondary btn-full"
              onClick={() => {
                setForm({ ...form, email: 'demo@expensify.com', password: 'demo123' });
                toast.info('Demo credentials filled in! Click Sign In.');
              }}
            >
              🎭 Use Demo Account
            </button>
          </>
        )}

        <p className="auth-link-text">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span className="auth-link" onClick={switchMode}>
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;