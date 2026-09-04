import React from 'react';
import { FaHeartbeat, FaThermometerHalf, FaTint, FaLungs } from 'react-icons/fa';

const VitalMetricsGrid = ({
  pulse = 0,
  temp = '36.6',
  bp = '120/80',
  spo2 = 98
}) => {
  const metrics = [
    {
      id: 'heart-rate',
      label: 'Heart Rate',
      value: pulse || '—',
      unit: 'BPM',
      icon: <FaHeartbeat style={{ color: '#ff4d6d' }} />
    },
    {
      id: 'temp',
      label: 'Body Temp',
      value: temp || '36.6',
      unit: '°C',
      icon: <FaThermometerHalf style={{ color: '#ff9f40' }} />
    },
    {
      id: 'bp',
      label: 'Blood Pressure',
      value: bp || '120/80',
      unit: 'mmHg',
      icon: <FaTint style={{ color: '#c87eff' }} />
    },
    {
      id: 'spo2',
      label: 'Oxygen Saturation',
      value: `${spo2}%`,
      unit: 'SpO₂',
      icon: <FaLungs style={{ color: '#00e6e6' }} />
    }
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <span style={{ fontSize: '1.4rem' }}>{m.icon}</span>
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
        </div>
      ))}
    </div>
  );
};

export default VitalMetricsGrid;
