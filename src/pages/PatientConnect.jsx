// src/pages/PatientConnect.jsx — Premium Connection Flow
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBluetooth } from 'react-icons/fa';
import '../styles/PatientConnect.css';

const PatientConnect = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    // Simulate connection delay
    setTimeout(() => {
      setLoading(false);
      navigate('/patient-dashboard');
    }, 2500);
  };

  return (
    <div className="patient-connect-container">
      <div className="connect-card">
        <div className="sync-icon">
          <FaBluetooth />
        </div>
        <h2>Device Pair Selection</h2>
        <p>Sync your AuraVue vitals monitor via Bluetooth to begin real-time health streaming.</p>

        {loading ? (
          <div style={{ padding: '1rem 0' }}>
            <div className="loading-spinner-v2"></div>
            <p style={{ color: '#00e6e6', fontWeight: 600, fontSize: '0.9rem' }}>
              SCANNING FOR DEVICES...
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button onClick={handleConnect} className="connect-btn">
              Connect Aura Monitor
            </button>
            <button
              className="ghost-btn"
              style={{ border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.85rem' }}
              onClick={() => navigate('/patient-dashboard')}
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientConnect;
