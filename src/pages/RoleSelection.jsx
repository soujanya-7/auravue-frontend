import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RoleSelection.css';

function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="role-selection-page">
      {/* ===== Main Section ===== */}
      <main className="role-selection-container">
        <div className="role-intro">
          <h2>Welcome to <span className="brand-name">AuraVue</span></h2>
          <p>Select your path to continue</p>
        </div>

        <div className="role-grid">
          {/* Caregiver Card */}
          <div className="role-card caregiver" onClick={() => navigate('/login?role=caregiver')}>
            <div className="card-icon">👨‍⚕️</div>
            <h3>I’m a Caregiver</h3>
            <p>Access patient data, manage alerts, and monitor vital signs with precision.</p>
            <button className="select-btn">Manage Care</button>
          </div>

          {/* Patient Card */}
          <div className="role-card patient" onClick={() => navigate('/login?role=patient')}>
            <div className="card-icon">👵</div>
            <h3>I’m a Patient</h3>
            <p>Stay connected with your caregivers and track your health journey effortlessly.</p>
            <button className="select-btn">View My Health</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RoleSelection;

