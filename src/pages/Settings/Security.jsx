import React, { useState } from 'react';
import { auth } from '../../firebase';
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  deleteUser,
} from 'firebase/auth';

const getStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: '', color: '' },
    { label: 'Weak', color: '#ff3b3b' },
    { label: 'Fair', color: '#fca311' },
    { label: 'Good', color: '#00c9ff' },
    { label: 'Strong', color: '#00c853' },
  ];
  return { score, ...levels[score] };
};

const Security = () => {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState({ old: false, new: false, confirm: false });

  const strength = getStrength(newPw);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      return setMsg({ type: 'error', text: '❌ New passwords do not match.' });
    }
    if (strength.score < 2) {
      return setMsg({ type: 'error', text: '❌ Please use a stronger password.' });
    }

    setLoading(true);
    setMsg(null);
    const user = auth.currentUser;
    try {
      const cred = EmailAuthProvider.credential(user.email, oldPw);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPw);
      setMsg({ type: 'success', text: '✅ Password updated successfully.' });
      setOldPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      setMsg({ type: 'error', text: '❌ Incorrect current password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const toggleShow = (field) => setShow(s => ({ ...s, [field]: !s[field] }));

  return (
    <div className="settings-section">
      <h2 className="section-title">🔒 Security</h2>
      <p className="section-subtitle">Update your password and manage account security.</p>

      <form onSubmit={handlePasswordChange}>
        {/* Current password */}
        <div className="form-row">
          <label>Current Password</label>
          <div className="input-with-eye">
            <input
              type={show.old ? 'text' : 'password'}
              placeholder="Your current password"
              value={oldPw}
              onChange={e => setOldPw(e.target.value)}
              required
            />
            <button type="button" className="eye-btn" onClick={() => toggleShow('old')}>
              {show.old ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        {/* New password */}
        <div className="form-row">
          <label>New Password</label>
          <div className="input-with-eye">
            <input
              type={show.new ? 'text' : 'password'}
              placeholder="At least 8 characters"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              required
            />
            <button type="button" className="eye-btn" onClick={() => toggleShow('new')}>
              {show.new ? '🙈' : '👁'}
            </button>
          </div>
          {/* Strength bar */}
          {newPw && (
            <div style={{ marginTop: '0.4rem' }}>
              <div className="password-strength">
                <div
                  className="password-strength-bar"
                  style={{
                    width: `${(strength.score / 4) * 100}%`,
                    background: strength.color,
                  }}
                />
              </div>
              <p className="form-hint" style={{ color: strength.color, marginTop: '0.25rem' }}>
                {strength.label}
              </p>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div className="form-row">
          <label>Confirm New Password</label>
          <div className="input-with-eye">
            <input
              type={show.confirm ? 'text' : 'password'}
              placeholder="Re-enter new password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              required
            />
            <button type="button" className="eye-btn" onClick={() => toggleShow('confirm')}>
              {show.confirm ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        {msg && <p className={`status-msg ${msg.type}`}>{msg.text}</p>}

        <div className="btn-row">
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? '⏳ Updating…' : '🔑 Update Password'}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="danger-zone">
        <h4>⚠️ Danger Zone</h4>
        <button
          className="danger-btn"
          onClick={() => {
            if (window.confirm('This will permanently delete your account. Are you sure?')) {
              deleteUser(auth.currentUser).catch(console.error);
            }
          }}
        >
          🗑 Delete Account
        </button>
      </div>
    </div>
  );
};

export default Security;
