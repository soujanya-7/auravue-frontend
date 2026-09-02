import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUserMd,
  FaUserShield,
  FaShieldAlt,
  FaBroadcastTower,
  FaArrowRight,
  FaCheckCircle
} from 'react-icons/fa';
import SEO from '../components/SEO';
import '../styles/RoleSelection.css';

function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="role-selection-page">
      <SEO
        title="Select Your Portal"
        description="Choose between the AuraVue Caregiver Telemetry Hub and the Patient Autonomous Safety Portal."
      />

      <main className="role-selection-container">
        {/* Header Badge & Title */}
        <div className="role-intro">
          <div className="role-badge-tag">
            <span className="role-pulse-dot" /> Connected Health Ecosystem
          </div>
          <h2>
            Choose Your <span className="brand-name">Portal Experience</span>
          </h2>
          <p>
            Access specialized workspaces built for clinical remote telemetry or autonomous personal protection.
          </p>
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
            
            <div className="role-card-header">
              <div className="card-badge caregiver-badge">
                <FaUserMd /> Caregiver & Clinical Hub
              </div>
              <span className="portal-indicator">Family & Clinician View</span>
            </div>

            <div className="card-icon-container caregiver-icon-wrap">
              <FaUserMd className="card-svg-icon" />
            </div>

            <div className="card-body">
              <h3>Caregiver Workspace</h3>
              <p className="role-card-desc">
                Real-time multi-patient telemetry, instant fall and SOS alerts, and AI-powered biometric analysis.
              </p>

              <div className="role-features-list">
                <div className="feature-item">
                  <FaCheckCircle className="check-icon" />
                  <span>100Hz Live Pulse, HRV & Temp Telemetry</span>
                </div>
                <div className="feature-item">
                  <FaCheckCircle className="check-icon" />
                  <span>Instant &lt;3s Fall & SOS Dispatch Alerts</span>
                </div>
                <div className="feature-item">
                  <FaCheckCircle className="check-icon" />
                  <span>Paramedic GPS Life-Link Sharing</span>
                </div>
                <div className="feature-item">
                  <FaCheckCircle className="check-icon" />
                  <span>Gemini AI Clinical Diagnostics</span>
                </div>
              </div>
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

            <div className="role-card-header">
              <div className="card-badge patient-badge">
                <FaUserShield /> Wearer Safety Mode
              </div>
              <span className="portal-indicator">Senior Wearer View</span>
            </div>

            <div className="card-icon-container patient-icon-wrap">
              <FaUserShield className="card-svg-icon" />
            </div>

            <div className="card-body">
              <h3>Patient Safety Shield</h3>
              <p className="role-card-desc">
                Stay protected with autonomous neckband pairing, 1-touch emergency SOS, and medication reminders.
              </p>

              <div className="role-features-list">
                <div className="feature-item">
                  <FaCheckCircle className="check-icon patient-check" />
                  <span>Hands-Free Auto Fall Detection</span>
                </div>
                <div className="feature-item">
                  <FaCheckCircle className="check-icon patient-check" />
                  <span>One-Touch Emergency SOS Broadcast</span>
                </div>
                <div className="feature-item">
                  <FaCheckCircle className="check-icon patient-check" />
                  <span>Wearable Neckband Auto-Sync</span>
                </div>
                <div className="feature-item">
                  <FaCheckCircle className="check-icon patient-check" />
                  <span>Daily Medication Adherence Prompts</span>
                </div>
              </div>
            </div>

            <button className="select-btn select-btn-patient">
              <span>Enter Patient Portal</span>
              <FaArrowRight className="btn-arrow" />
            </button>
          </div>
        </div>

        {/* Bottom Trust & Security Footnote */}
        <div className="role-footer-footnote">
          <div className="footnote-item">
            <FaShieldAlt className="footnote-icon" />
            <span>HIPAA Compliant & End-to-End Encrypted</span>
          </div>
          <span className="footnote-divider">•</span>
          <div className="footnote-item">
            <FaBroadcastTower className="footnote-icon" />
            <span>24/7 Cloud Telemetry Gateway</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RoleSelection;


