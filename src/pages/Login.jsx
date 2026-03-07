import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  reload,
  signOut
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import '../styles/Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState('caregiver');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [unverifiedUser, setUnverifiedUser] = useState(null);
  const [showResend, setShowResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Get ?role= from URL
  useEffect(() => {
    const urlRole = new URLSearchParams(location.search).get('role');
    if (['patient', 'caregiver'].includes(urlRole)) {
      setRole(urlRole);
    }
  }, [location.search]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await reload(user);

      if (!user.emailVerified) {
        setUnverifiedUser(user);
        setShowResend(true);
        alert('❌ Please verify your email before logging in.');
        setLoading(false);
        return;
      }

      // 🔹 Check role from Firestore
      let actualRole = null;

      const caregiverSnap = await getDoc(doc(db, 'caregivers', user.uid));
      if (caregiverSnap.exists()) {
        actualRole = 'caregiver';
      } else {
        const patientSnap = await getDoc(doc(db, 'patients', user.uid));
        if (patientSnap.exists()) {
          actualRole = 'patient';
        }
      }

      if (!actualRole) {
        await signOut(auth);
        alert('❌ No role assigned. Please contact support.');
        setLoading(false);
        return;
      }

      // 🔹 If role mismatch — block login
      if (actualRole !== role) {
        await signOut(auth);
        alert(`❌ You are registered as a ${actualRole}. Please log in using the ${actualRole} role.`);
        setLoading(false);
        return;
      }

      // ✅ Store role for later
      localStorage.setItem('userRole', actualRole);

      // ✅ Navigate to correct dashboard
      if (actualRole === 'caregiver') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/connect', { replace: true });
      }

    } catch (err) {
      console.error(err);
      alert(err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
        ? '❌ Invalid email or password'
        : '❌ Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!unverifiedUser) return;
    try {
      await sendEmailVerification(unverifiedUser);
      alert('📨 Verification email resent! Please check inbox or spam.');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to resend verification email.');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert('Please enter your email address above first.');
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err) {
      console.error(err);
      alert('❌ Could not send reset email. Make sure the address is correct.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* --- Left Side: Branding Panel --- */}
      <div className="auth-side-branding">
        <div className="branding-content">
          <h1 className="branding-logo">Aura<span>Vue</span></h1>
          <p className="branding-tagline">
            Smart Health Monitoring for {role === 'patient' ? 'Your Peace of Mind' : 'Better Patient Care'}.
          </p>
        </div>
      </div>

      {/* --- Right Side: Form Panel --- */}
      <div className="auth-side-form">
        <div className="auth-form-panel">
          <h2>Welcome back</h2>
          <p className="subtitle">Login to your {role} account</p>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="email"
                placeholder="Email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Forgot Password */}
            <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
              {resetSent ? (
                <span style={{ fontSize: '0.82rem', color: '#00e6e6' }}>
                  ✅ Reset email sent! Check your inbox.
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(148,184,196,0.7)', fontSize: '0.82rem',
                    textDecoration: 'underline', padding: 0
                  }}
                >
                  {resetLoading ? 'Sending...' : 'Forgot password?'}
                </button>
              )}
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          {showResend && (
            <div style={{ marginTop: '1.5rem' }}>
              <p style={{ color: '#ff6b6b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Your email is not verified.
              </p>
              <button onClick={resendVerification} className="google-btn">
                Resend Verification Email
              </button>
            </div>
          )}

          <div className="divider">or</div>

          <button
            className="google-btn"
            onClick={() => alert('Google login is disabled.')}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="G" className="google-icon" />
            Continue with Google
          </button>

          <p className="switch-link">
            New to AuraVue?{' '}
            <Link to={`/register?role=${role}`}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}


