import React, { useState, useEffect } from 'react';
import { FaSlidersH, FaTimes, FaSave } from 'react-icons/fa';

const ThresholdSettingsModal = ({
  isOpen = false,
  onClose,
  patientName = 'Patient',
  thresholds = { minPulse: 60, maxPulse: 100 },
  onSave,
  saving = false
}) => {
  const [minPulse, setMinPulse] = useState(thresholds.minPulse || 60);
  const [maxPulse, setMaxPulse] = useState(thresholds.maxPulse || 100);

  useEffect(() => {
    setMinPulse(thresholds.minPulse || 60);
    setMaxPulse(thresholds.maxPulse || 100);
  }, [thresholds, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ minPulse: Number(minPulse), maxPulse: Number(maxPulse) });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2, 6, 12, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
        animation: 'toastSlideIn 0.25s ease'
      }}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, #0a1826, #0e2236)',
          border: '1px solid rgba(0, 230, 230, 0.25)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '440px',
          padding: '2rem',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 230, 230, 0.1)',
          color: '#ffffff'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(0, 230, 230, 0.15)',
                color: '#00e6e6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}
            >
              <FaSlidersH />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Vital Alarm Thresholds</h3>
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                Target heart rate alerts for {patientName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FaTimes />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          Automated push notifications and SMS alerts trigger whenever {patientName}’s heart rate exceeds these custom bounds for more than 10 seconds.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)' }}>
                Low Pulse Threshold (Bradycardia)
              </label>
              <span style={{ color: '#ff4d6d', fontWeight: 700, fontSize: '0.9rem' }}>{minPulse} BPM</span>
            </div>
            <input
              type="range"
              min="40"
              max="75"
              value={minPulse}
              onChange={(e) => setMinPulse(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#ff4d6d', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.4)' }}>
              Standard resting lower bound is 50-60 BPM.
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)' }}>
                High Pulse Threshold (Tachycardia)
              </label>
              <span style={{ color: '#ffb703', fontWeight: 700, fontSize: '0.9rem' }}>{maxPulse} BPM</span>
            </div>
            <input
              type="range"
              min="85"
              max="150"
              value={maxPulse}
              onChange={(e) => setMaxPulse(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#ffb703', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.4)' }}>
              Standard upper bound for resting heart rate is 100 BPM.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.8rem' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                padding: '0.9rem',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #00e6e6, #00a8cc)',
                color: '#05101a',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <FaSave /> {saving ? 'Saving...' : 'Save Thresholds'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.9rem 1.4rem',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'transparent',
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ThresholdSettingsModal;
