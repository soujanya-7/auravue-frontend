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
      {/* --- Left Side: Sleek Holographic Cardiogram Visual --- */}
      <div className="auth-side-branding">
        <div className="telemetry-showcase-container">
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
          {/* Role Switcher Tab */}
          <div className="auth-role-tabs">
            <Link
              to="/register?role=caregiver"
              className={`role-tab-btn ${role === 'caregiver' ? 'active' : ''}`}
            >
              Caregiver
            </Link>
            <Link
              to="/register?role=patient"
              className={`role-tab-btn ${role === 'patient' ? 'active' : ''}`}
            >
              Patient
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

