// src/pages/Register.jsx

import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import { auth, db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { generateFamilyCode } from '../utils/familyCode';
import SEO from '../components/SEO';
import { useToast } from '../context/ToastContext';
import '../styles/Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const role = new URLSearchParams(location.search).get('role') || 'caregiver';

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [enteredCode, setEnteredCode] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      if (role === 'caregiver') {
        const familyCode = generateFamilyCode();

        await setDoc(doc(db, 'caregivers', user.uid), {
          email,
          name,
          mobileNumber,
          role,
          familyCode,
          createdAt: new Date().toISOString()
        });

        await sendEmailVerification(user);
        toast.success(`Registered! Verification email sent. Family Code: ${familyCode}`, 7000);
        navigate('/login?role=caregiver');
      }

      else if (role === 'patient') {
        const q = query(collection(db, 'caregivers'), where('familyCode', '==', enteredCode.trim()));
        const snap = await getDocs(q);

        if (snap.empty) {
          toast.error('Invalid family code. Please check code with your caregiver.');
          return;
        }

        const caregiverDoc = snap.docs[0];
        const caregiverId = caregiverDoc.id;
        const caregiverName = caregiverDoc.data().name;

        await setDoc(doc(db, 'patients', user.uid), {
          email,
          name,
          mobileNumber,
          role,
          familyCode: enteredCode.trim(),
          authorizedCaregivers: [caregiverId],
          createdAt: new Date().toISOString()
        });

        await setDoc(doc(db, `caregivers/${caregiverId}/patients`, user.uid), {
          email,
          name,
          mobileNumber,
          linkedOn: new Date().toISOString()
        });

        await sendEmailVerification(user);
        toast.success(`Connected to caregiver ${caregiverName}! Verification email sent.`, 7000);
        navigate('/login?role=patient');
      }
    } catch (err) {
      console.error(err);
      switch (err.code) {
        case 'auth/email-already-in-use':
          toast.error('This email address is already registered.');
          break;
        case 'auth/invalid-email':
          toast.error('Invalid email address format.');
          break;
        case 'auth/weak-password':
          toast.error('Password must be at least 6 characters.');
          break;
        default:
          toast.error('Registration failed: ' + err.message);
      }
    }
  };

  return (
    <div className="auth-page">
      <SEO
        title={`Join AuraVue as ${role}`}
        description="Register for AuraVue to start intelligent health monitoring for yourself or your loved ones."
      />
      {/* --- Left Side: Unique Interactive Telemetry Showcase --- */}
      <div className="auth-side-branding">
        <div className="telemetry-showcase-container">
          <div className="telemetry-badge-tag">
            <span className="telemetry-pulse-dot" />
            {role === 'patient' ? 'Patient Safety Enrollment' : 'Caregiver Hub Setup'}
          </div>

          <h2 className="telemetry-headline">
            {role === 'patient'
              ? 'Join the Autonomous Safety Network'
              : 'Empower Your Caregiving with AI Insights'}
          </h2>

          <p className="telemetry-subtext">
            {role === 'patient'
              ? 'Connect directly to your family circle and receive 24/7 automated protection and medicine reminders.'
              : 'Create your centralized clinical monitoring workspace with instant emergency triage and family sharing.'}
          </p>

          {/* Live Telemetry Floating Metric Chips */}
          <div className="telemetry-cards-stack">
            <div className="auth-telemetry-chip chip-cardiac">
              <div className="chip-icon-wrap icon-pulse">
                ❤️
              </div>
              <div className="chip-info">
                <div className="chip-label">Continuous Monitoring</div>
                <div className="chip-val">100Hz Real-Time Telemetry</div>
              </div>
            </div>

            <div className="auth-telemetry-chip chip-fall">
              <div className="chip-icon-wrap icon-shield">
                🛡️
              </div>
              <div className="chip-info">
                <div className="chip-label">Autonomous Safety</div>
                <div className="chip-val">Zero-Button Emergency Protocol</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Right Side: Form Panel --- */}
      <div className="auth-side-form">
        <div className="auth-form-panel">
          {/* Role Switcher Tab */}
          <div className="auth-role-tabs">
            <Link
              to="/register?role=caregiver"
              className={`role-tab-btn ${role === 'caregiver' ? 'active' : ''}`}
            >
              👨‍⚕️ Caregiver
            </Link>
            <Link
              to="/register?role=patient"
              className={`role-tab-btn ${role === 'patient' ? 'active' : ''}`}
            >
              👵 Patient
            </Link>
          </div>

          <h2>Create Account</h2>
          <p className="subtitle">Sign up for your {role === 'patient' ? 'patient safety' : 'caregiver'} account</p>

          <form onSubmit={handleRegister}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Full Name"
                required
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input
                type="email"
                placeholder="Email address"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input
                type="tel"
                placeholder="Mobile Number (e.g. +1234567890)"
                required
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Create Password"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {role === 'patient' && (
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Enter Family Code"
                  required
                  onChange={(e) => setEnteredCode(e.target.value)}
                />
              </div>
            )}
            <button type="submit" className="auth-btn">Register Now</button>
          </form>

          <div className="divider">or</div>

          <button
            className="google-btn"
            onClick={() => alert('Google signup is disabled.')}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="G" className="google-icon" />
            Sign up with Google
          </button>

          <p className="switch-link">
            Already have an account?{' '}
            <Link to={`/login?role=${role}`}>Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

