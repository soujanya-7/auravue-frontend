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
import SEO from '../components/SEO';
import { useToast } from '../context/ToastContext';
import '../styles/Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

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
        toast.warning('Please verify your email address before logging in.');
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
        toast.error('No account role assigned. Please contact support.');
        setLoading(false);
        return;
      }

      // 🔹 If role mismatch — block login
      if (actualRole !== role) {
        await signOut(auth);
        toast.error(`You are registered as a ${actualRole}. Please select the ${actualRole} login.`);
        setLoading(false);
        return;
      }

      // ✅ Store role for later
      localStorage.setItem('userRole', actualRole);
      toast.success(`Welcome back to AuraVue!`);

      // ✅ Navigate to correct dashboard
      if (actualRole === 'caregiver') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/connect', { replace: true });
      }

    } catch (err) {
      console.error(err);
      toast.error(err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
        ? 'Invalid email or password.'
        : 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!unverifiedUser) return;
    try {
      await sendEmailVerification(unverifiedUser);
      toast.success('Verification email sent! Check your inbox or spam folder.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to resend verification email.');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.warning('Please enter your email address in the field above.');
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      toast.success('Password reset email sent!');
    } catch (err) {
      console.error(err);
      toast.error('Could not send reset email. Ensure the address is correct.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <SEO
        title={`Login as ${role === 'patient' ? 'Patient' : 'Caregiver'}`}
        description="Securely access your AuraVue account to monitor health vitals or connect with caregivers."
      />
      {/* --- Left Side: Sleek Holographic Cardiogram Visual --- */}
      <div className="auth-side-branding">
        <div className="telemetry-showcase-container">
          <h2 className="telemetry-headline">
            {role === 'patient'
              ? 'Autonomous Health & Safety Shield'
              : 'Continuous Biometric Intelligence'}
          </h2>

          <p className="telemetry-subtext">
            {role === 'patient'
              ? 'Stay protected around the clock with hands-free fall detection and instant family emergency connection.'
              : 'Monitor live patient vitals, detect cardiac anomalies, and coordinate rapid first-responder triage.'}
          </p>

          {/* Animated SVG Cardiogram Waveform */}
          <div className="ecg-visual-card">
            <div className="ecg-header">
              <span className="ecg-title">Live Biometric Stream</span>
              <span className="ecg-status">100Hz Telemetry Active</span>
            </div>
            <div className="ecg-waveform-wrap">
              <svg className="ecg-svg" viewBox="0 0 500 120" preserveAspectRatio="none">
                <path
                  className="ecg-path"
                  d="M0,60 L80,60 L95,60 L105,20 L115,100 L125,45 L135,75 L145,60 L230,60 L245,60 L255,15 L265,105 L275,40 L285,78 L295,60 L380,60 L395,60 L405,20 L415,100 L425,45 L435,75 L445,60 L500,60"
                />
              </svg>
              <div className="ecg-scan-line" />
            </div>
            <div className="ecg-footer">
              <div className="ecg-metric">
                <span className="metric-num">72</span>
                <span className="metric-unit">BPM Heart Rate</span>
              </div>
              <div className="ecg-divider" />
              <div className="ecg-metric">
                <span className="metric-num">98%</span>
                <span className="metric-unit">SpO2 Oxygen</span>
              </div>
              <div className="ecg-divider" />
              <div className="ecg-metric">
                <span className="metric-num">&lt;3s</span>
                <span className="metric-unit">AI Fall Guard</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Right Side: Form Panel --- */}
      <div className="auth-side-form">
        <div className="auth-form-panel">
          <h2>{role === 'patient' ? 'Patient Login' : 'Caregiver Login'}</h2>
          <p className="subtitle">Sign in to access your {role === 'patient' ? 'safety shield' : 'caregiver telemetry'}</p>

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
            <div style={{ textAlign: 'right', marginBottom: '0.8rem' }}>
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
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {showResend && (
            <div style={{ marginTop: '1.2rem' }}>
              <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
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

          <p className="switch-role-subtle">
            <Link to="/role">‹ Switch role</Link>
          </p>
        </div>
      </div>
    </div>
  );
}


