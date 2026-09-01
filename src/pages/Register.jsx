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
import '../styles/Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
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
        alert(`✅ Registered as Caregiver!\n📧 Verification email sent.\n👨‍👩‍👧 Family Code: ${familyCode}`);
        navigate('/login?role=caregiver');
      }

      else if (role === 'patient') {
        const q = query(collection(db, 'caregivers'), where('familyCode', '==', enteredCode));
        const snap = await getDocs(q);

        if (snap.empty) {
          alert('❌ Invalid family code. Please check with your caregiver.');
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
          familyCode: enteredCode,
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
        alert(`🎉 You're now connected to caregiver: ${caregiverName}\n📧 A verification email has been sent.`);
        navigate('/login?role=patient');
      }
    } catch (err) {
      console.error(err);
      switch (err.code) {
        case 'auth/email-already-in-use':
          alert('❌ This email is already registered.');
          break;
        case 'auth/invalid-email':
          alert('❌ Invalid email format.');
          break;
        case 'auth/weak-password':
          alert('❌ Password must be at least 6 characters.');
          break;
        default:
          alert('❌ Registration failed: ' + err.message);
      }
    }
  };

  return (
    <div className="auth-page">
      <SEO
        title={`Join AuraVue as ${role}`}
        description="Register for AuraVue to start intelligent health monitoring for yourself or your loved ones."
      />
      {/* --- Left Side: Branding Panel --- */}
      <div className="auth-side-branding">
        <div className="branding-content">
          <h1 className="branding-logo">Aura<span>Vue</span></h1>
          <p className="branding-tagline">
            {role === 'patient'
              ? 'Join our community and stay connected with your loved ones.'
              : 'Empower your caregiving with advanced health insights.'}
          </p>
        </div>
      </div>

      {/* --- Right Side: Form Panel --- */}
      <div className="auth-side-form">
        <div className="auth-form-panel">
          <h2>Create Account</h2>
          <p className="subtitle">Join as a {role}</p>

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

