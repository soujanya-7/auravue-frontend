// src/pages/PrivateRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const PrivateRoute = ({ children, expectedRole }) => {
  const [user, loading] = useAuthState(auth);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      let foundRole = null;

      const caregiverRef = doc(db, 'caregivers', user.uid);
      const caregiverSnap = await getDoc(caregiverRef);
      if (caregiverSnap.exists()) {
        foundRole = 'caregiver';
      } else {
        const patientRef = doc(db, 'patients', user.uid);
        const patientSnap = await getDoc(patientRef);
        if (patientSnap.exists()) {
          foundRole = 'patient';
        }
      }

      if (!foundRole) {
        setError("No role assigned. Please contact support.");
      } else if (expectedRole && foundRole !== expectedRole) {
        setError(`You are registered as a ${foundRole}. Please log in using the ${foundRole} portal.`);
      }

      setChecking(false);
    };

    checkRole();
  }, [user, expectedRole]);

  if (loading || checking) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '80vh', background: '#050a0f', color: '#00e6e6'
      }}>
        <div style={{
          width: '40px', height: '40px', border: '3px solid rgba(0, 230, 230, 0.2)',
          borderTopColor: '#00e6e6', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh',
        background: '#050a0f', padding: '2rem'
      }}>
        <div className="glass-card" style={{ maxWidth: '440px', padding: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</p>
          <h3 style={{ color: '#ff4d6d', marginBottom: '0.8rem' }}>Access Restricted</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: 1.6 }}>{error}</p>
          <a
            href="/"
            style={{
              marginTop: '1.5rem', display: 'inline-flex', padding: '0.7rem 1.4rem',
              borderRadius: '10px', background: 'rgba(0,230,230,0.15)', color: '#00e6e6',
              textDecoration: 'none', fontWeight: 600, border: '1px solid rgba(0,230,230,0.3)'
            }}
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" />;

  return children;
};

export default PrivateRoute;
