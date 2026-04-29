import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/Authcontext';
import { useToast } from '../context/ToastContext';
import { getInitials, validateLoginForm } from '../utils/helpers';

const SettingsPage = () => {
  const { user, token, updateUser, logout } = useAuth();
  const toast = useToast();

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [pwForm, setPwForm]   = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw]           = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [pwErrors, setPwErrors]           = useState({});

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    if (profileErrors[name]) setProfileErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwForm(prev => ({ ...prev, [name]: value }));
    if (pwErrors[name]) setPwErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleProfileSave = async () => {
    const errs = {};
    if (!profileForm.name.trim() || profileForm.name.trim().length < 2)
      errs.name = 'Name must be at least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email))
      errs.email = 'Enter a valid email';
    if (Object.keys(errs).length) { setProfileErrors(errs); return; }

    setSavingProfile(true);
    try {
      const data = await authAPI.updateProfile(profileForm, token);
      updateUser(data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    const errs = {};
    if (!pwForm.currentPassword) errs.currentPassword = 'Enter your current password';
    if (!pwForm.newPassword || pwForm.newPassword.length < 6)
      errs.newPassword = 'New password must be at least 6 characters';
    if (pwForm.newPassword !== pwForm.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) { setPwErrors(errs); return; }

    setSavingPw(true);
    try {
      await authAPI.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      }, token);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account preferences</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

        {/* Profile */}
        <div className="card card-elevated">
          <div className="settings-section-title">Profile Information</div>

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{
              width: 64, height: 64,
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, color: 'white',
            }}>
              {getInitials(user?.name)}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.email}</div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">Full Name</label>
            <input
              className={`form-input ${profileErrors.name ? 'error' : ''}`}
              type="text"
              name="name"
              value={profileForm.name}
              onChange={handleProfileChange}
            />
            {profileErrors.name && <span className="form-error">⚠ {profileErrors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label required">Email Address</label>
            <input
              className={`form-input ${profileErrors.email ? 'error' : ''}`}
              type="email"
              name="email"
              value={profileForm.email}
              onChange={handleProfileChange}
            />
            {profileErrors.email && <span className="form-error">⚠ {profileErrors.email}</span>}
          </div>

          <button
            className="btn btn-primary"
            onClick={handleProfileSave}
            disabled={savingProfile}
          >
            {savingProfile ? <><span className="loading-spinner"></span> Saving…</> : '💾 Save Changes'}
          </button>
        </div>

        {/* Change password */}
        <div className="card card-elevated">
          <div className="settings-section-title">Change Password</div>

          <div className="form-group">
            <label className="form-label required">Current Password</label>
            <input
              className={`form-input ${pwErrors.currentPassword ? 'error' : ''}`}
              type="password"
              name="currentPassword"
              placeholder="••••••••"
              value={pwForm.currentPassword}
              onChange={handlePwChange}
            />
            {pwErrors.currentPassword && <span className="form-error">⚠ {pwErrors.currentPassword}</span>}
          </div>

          <div className="form-group">
            <label className="form-label required">New Password</label>
            <input
              className={`form-input ${pwErrors.newPassword ? 'error' : ''}`}
              type="password"
              name="newPassword"
              placeholder="At least 6 characters"
              value={pwForm.newPassword}
              onChange={handlePwChange}
            />
            {pwErrors.newPassword && <span className="form-error">⚠ {pwErrors.newPassword}</span>}
          </div>

          <div className="form-group">
            <label className="form-label required">Confirm New Password</label>
            <input
              className={`form-input ${pwErrors.confirmPassword ? 'error' : ''}`}
              type="password"
              name="confirmPassword"
              placeholder="Repeat new password"
              value={pwForm.confirmPassword}
              onChange={handlePwChange}
            />
            {pwErrors.confirmPassword && <span className="form-error">⚠ {pwErrors.confirmPassword}</span>}
          </div>

          <button
            className="btn btn-primary"
            onClick={handlePasswordChange}
            disabled={savingPw}
          >
            {savingPw ? <><span className="loading-spinner"></span> Updating…</> : '🔑 Change Password'}
          </button>
        </div>

        {/* Danger zone */}
        <div className="card" style={{ borderColor: 'rgba(255,71,87,0.2)', gridColumn: '1 / -1' }}>
          <div className="settings-section-title" style={{ color: 'var(--accent-danger)' }}>Danger Zone</div>
          <div className="settings-item">
            <div className="settings-item-info">
              <div className="settings-item-label">Sign Out</div>
              <div className="settings-item-desc">Sign out of your account on this device</div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={logout}>🚪 Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;