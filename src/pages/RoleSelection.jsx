import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUserMd,
  FaUserShield,
  FaArrowRight
} from 'react-icons/fa';
import SEO from '../components/SEO';
import '../styles/RoleSelection.css';

function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="role-selection-page">
      <SEO
        title="Select Your Portal"
        description="Choose between the AuraVue Caregiver Telemetry Hub and the Patient Safety Portal."
      />

      <main className="role-selection-container">
        {/* Header Title */}
        <div className="role-intro">
          <h2>
            Choose Your <span className="brand-name">Portal</span>
          </h2>
          <p>Select your specialized workspace to continue.</p>
        </div>

        <div className="role-grid">
          {/* Caregiver Portal Card */}
          <div
            className="role-card caregiver"
            onClick={() => navigate('/login?role=caregiver')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/login?role=caregiver')}
          >
            <div className="role-card-glow caregiver-glow" />
            
            <div className="card-icon-container caregiver-icon-wrap">
              <FaUserMd className="card-svg-icon" />
            </div>

            <div className="card-body">
              <h3>I'm a Caregiver</h3>
              <p className="role-card-desc">
                Monitor live patient vitals, receive instant fall/SOS alerts, and review AI diagnostics.
              </p>
            </div>

            <button className="select-btn select-btn-caregiver">
              <span>Launch Caregiver Portal</span>
              <FaArrowRight className="btn-arrow" />
            </button>
          </div>

          {/* Patient Portal Card */}
          <div
            className="role-card patient"
            onClick={() => navigate('/login?role=patient')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/login?role=patient')}
          >
            <div className="role-card-glow patient-glow" />

            <div className="card-icon-container patient-icon-wrap">
              <FaUserShield className="card-svg-icon" />
            </div>

            <div className="card-body">
              <h3>I'm a Patient</h3>
              <p className="role-card-desc">
                Connect your wearable neckband, access one-touch SOS, and stay safely connected.
              </p>
            </div>

            <button className="select-btn select-btn-patient">
              <span>Enter Patient Portal</span>
              <FaArrowRight className="btn-arrow" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RoleSelection;



