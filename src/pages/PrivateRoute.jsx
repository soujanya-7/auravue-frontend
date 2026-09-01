// src/pages/PrivateRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const PrivateRoute = ({ children, expectedRole }) => {
  const [user, loading] = useAuthState(auth);
  const [role, setRole] = useState(null);
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
        setError("❌ No role assigned. Please contact support.");
      } else if (expectedRole && foundRole !== expectedRole) {
        setError(`❌ You are registered as ${foundRole}. Please login as ${foundRole} role.`);
      }

      setRole(foundRole);
      setChecking(false);
    };

    checkRole();
  }, [user, expectedRole]);

  if (loading || checking) return <div>Loading...</div>;

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red", fontWeight: "bold" }}>
        {error}
      </div>
    );
  }

  if (!user) return <Navigate to="/" />;

  return children;
};

export default PrivateRoute;
