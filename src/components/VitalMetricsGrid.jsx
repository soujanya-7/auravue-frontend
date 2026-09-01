import React from 'react';
import { FaHeartbeat, FaThermometerHalf, FaTint, FaLungs, FaShieldAlt } from 'react-icons/fa';

const VitalMetricsGrid = ({
  pulse = 0,
  temp = '36.6',
  bp = '120/80',
  spo2 = 98,
  fallStatus = 'Active & Safe',
  isFallAlert = false,
  onSimulateFall = null
}) => {
  const metrics = [
    {
      id: 'heart-rate',
      label: 'Heart Rate',
      value: pulse || '—',
      unit: 'BPM',
      icon: <FaHeartbeat style={{ color: '#ff4d6d' }} />,
      status: pulse > 100 ? 'Elevated' : pulse < 60 && pulse > 0 ? 'Low' : 'Optimal',
      badgeColor: pulse > 100 ? '#ffb703' : pulse < 60 && pulse > 0 ? '#ff4d6d' : '#00e699'
    },
    {
      id: 'temp',
      label: 'Body Temp',
      value: temp || '36.6',
      unit: '°C',
      icon: <FaThermometerHalf style={{ color: '#ff9f40' }} />,
      status: Number(temp) > 37.5 ? 'Fever' : 'Normal',
      badgeColor: Number(temp) > 37.5 ? '#ffb703' : '#00e699'
    },
    {
      id: 'bp',
      label: 'Blood Pressure',
      value: bp || '120/80',
      unit: 'mmHg',
      icon: <FaTint style={{ color: '#c87eff' }} />,
      status: 'Normal Systolic',
      badgeColor: '#00e699'
    },
    {
      id: 'spo2',
      label: 'Oxygen Saturation',
      value: `${spo2}%`,
      unit: 'SpO₂',
      icon: <FaLungs style={{ color: '#00e6e6' }} />,
      status: spo2 >= 95 ? 'Healthy Range' : 'Attention',
      badgeColor: spo2 >= 95 ? '#00e699' : '#ff4d6d'
    },
    {
      id: 'fall-sensor',
      label: 'Fall Detection AI',
      value: isFallAlert ? 'FALL DETECTED' : fallStatus,
      unit: '6-Axis IMU',
      icon: <FaShieldAlt style={{ color: isFallAlert ? '#ff2a5f' : '#00e6e6' }} />,
      status: isFallAlert ? 'Emergency' : 'Calibrated',
      badgeColor: isFallAlert ? '#ff2a5f' : '#00e699',
      isAlert: isFallAlert,
      action: onSimulateFall
    }
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        width: '100%'
      }}
    >
      {metrics.map((m) => (
        <div
          key={m.id}
          className="glass-card stat-card-v2"
          style={{
            padding: '1.25rem',
            borderRadius: '18px',
            background: m.isAlert
              ? 'rgba(255, 42, 95, 0.15)'
              : 'var(--glass-bg, rgba(14, 32, 48, 0.65))',
            border: `1px solid ${
              m.isAlert ? 'rgba(255, 42, 95, 0.6)' : 'var(--glass-border, rgba(0, 230, 230, 0.14))'
            }`,
            boxShadow: m.isAlert
              ? '0 0 25px rgba(255, 42, 95, 0.4)'
              : 'var(--glass-shadow, 0 16px 40px rgba(0,0,0,0.45))',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.8rem',
            transition: 'transform 0.25s ease, border-color 0.25s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.4rem' }}>{m.icon}</span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: '12px',
                background: `${m.badgeColor}20`,
                color: m.badgeColor,
                border: `1px solid ${m.badgeColor}40`
              }}
            >
              {m.status}
            </span>
          </div>

          <div>
            <p style={{ margin: '0 0 0.2rem', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              {m.label}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: m.isAlert ? '#ff2a5f' : '#ffffff',
                  letterSpacing: '-0.02em'
                }}
              >
                {m.value}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.45)', fontWeight: 600 }}>
                {m.unit}
              </span>
            </div>
          </div>

          {m.action && (
            <button
              onClick={m.action}
              style={{
                marginTop: '0.3rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                border: '1px dashed rgba(255, 42, 95, 0.5)',
                background: 'rgba(255, 42, 95, 0.1)',
                color: '#ff4d6d',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
                justifyContent: 'center'
              }}
            >
              ⚡ Test Fall Alert
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default VitalMetricsGrid;
