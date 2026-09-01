import React from 'react';
import { MdEmergency, MdPhone, MdLocationOn } from 'react-icons/md';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const EmergencyAlertBanner = ({
  active = false,
  type = 'SOS',
  message = 'Emergency Alert Triggered',
  patientName = 'Patient',
  onCall,
  onResolve,
  onViewLocation
}) => {
  if (!active) return null;

  const isFall = type === 'FALL';

  return (
    <div
      className="emergency-banner-active"
      style={{
        width: '100%',
        padding: '1.2rem 1.8rem',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(255, 42, 95, 0.25), rgba(180, 10, 50, 0.35))',
        border: '2px solid #ff2a5f',
        boxShadow: '0 0 35px rgba(255, 42, 95, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.2rem',
        animation: 'sosFlash 1.5s infinite ease-in-out',
        marginBottom: '1.5rem',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: '#ff2a5f',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            boxShadow: '0 0 20px rgba(255, 42, 95, 0.8)',
            flexShrink: 0
          }}
        >
          {isFall ? <FaExclamationTriangle /> : <MdEmergency />}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ff8099' }}>
              CRITICAL EMERGENCY ALERT
            </span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff2a5f', animation: 'pulseGlow 1s infinite' }} />
          </div>
          <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
            {message}
          </h3>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            Immediate caregiver response and life safety protocol activated for <b>{patientName}</b>.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
        {onCall && (
          <button
            onClick={onCall}
            style={{
              padding: '0.75rem 1.3rem',
              borderRadius: '12px',
              border: 'none',
              background: '#ffffff',
              color: '#05101a',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(255, 255, 255, 0.3)'
            }}
          >
            <MdPhone style={{ fontSize: '1.1rem', color: '#ff2a5f' }} /> Call Contact
          </button>
        )}

        {onViewLocation && (
          <button
            onClick={onViewLocation}
            style={{
              padding: '0.75rem 1.2rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <MdLocationOn /> Locate Patient
          </button>
        )}

        {onResolve && (
          <button
            onClick={onResolve}
            style={{
              padding: '0.75rem 1.2rem',
              borderRadius: '12px',
              border: '1px solid rgba(0, 230, 153, 0.4)',
              background: 'rgba(0, 230, 153, 0.15)',
              color: '#00e699',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <FaCheckCircle /> Resolve Alert
          </button>
        )}
      </div>
    </div>
  );
};

export default EmergencyAlertBanner;
