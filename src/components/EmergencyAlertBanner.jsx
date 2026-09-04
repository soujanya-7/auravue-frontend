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
        padding: '1rem 1.4rem',
        borderRadius: '18px',
        background: 'linear-gradient(135deg, rgba(255, 42, 95, 0.22), rgba(180, 10, 50, 0.3))',
        border: '1.5px solid #ff2a5f',
        boxShadow: '0 0 30px rgba(255, 42, 95, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: '#ff2a5f',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            boxShadow: '0 0 16px rgba(255, 42, 95, 0.7)',
            flexShrink: 0
          }}
        >
          {isFall ? <FaExclamationTriangle /> : <MdEmergency />}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
            {message}
          </h3>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            Immediate caregiver action required for <b>{patientName}</b>
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
        {onCall && (
          <button
            onClick={onCall}
            style={{
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              border: 'none',
              background: '#ffffff',
              color: '#05101a',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 4px 12px rgba(255, 255, 255, 0.25)'
            }}
          >
            <MdPhone style={{ fontSize: '1rem', color: '#ff2a5f' }} /> Call Contact
          </button>
        )}

        {onViewLocation && (
          <button
            onClick={onViewLocation}
            style={{
              padding: '0.65rem 1.1rem',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.82rem',
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
              padding: '0.65rem 1.1rem',
              borderRadius: '10px',
              border: '1px solid rgba(0, 230, 153, 0.4)',
              background: 'rgba(0, 230, 153, 0.15)',
              color: '#00e699',
              fontWeight: 700,
              fontSize: '0.82rem',
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
