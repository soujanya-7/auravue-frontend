import React from 'react';
import { FaBrain, FaCheckCircle, FaExclamationTriangle, FaHeartbeat, FaWalking } from 'react-icons/fa';

const AiInsightsCard = ({
  stability = 95,
  activityLevel = 'Resting',
  activityPct = 25,
  rhythmScore = 96,
  anomalyText = null
}) => {
  const isHealthy = stability >= 80;
  const statusColor = isHealthy ? '#00e699' : stability >= 55 ? '#ffb703' : '#ff4d6d';

  return (
    <div
      className="glass-card ai-insights-card"
      style={{
        padding: '1.6rem',
        borderRadius: '24px',
        background: 'var(--glass-bg, rgba(14, 32, 48, 0.65))',
        border: '1px solid var(--glass-border, rgba(0, 230, 230, 0.14))',
        boxShadow: 'var(--glass-shadow, 0 16px 40px rgba(0,0,0,0.45))',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <FaBrain style={{ color: '#00e6e6', fontSize: '1.3rem' }} />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
            AI Health Diagnostics
          </h3>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.25rem 0.65rem',
            borderRadius: '12px',
            background: 'rgba(0, 230, 230, 0.12)',
            color: '#00e6e6',
            border: '1px solid rgba(0, 230, 230, 0.25)'
          }}
        >
          Model v2.4 Active
        </span>
      </div>

      {/* Main Status Headline */}
      <div
        style={{
          padding: '1rem',
          borderRadius: '14px',
          background: `${statusColor}12`,
          border: `1px solid ${statusColor}35`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem'
        }}
      >
        {isHealthy ? (
          <FaCheckCircle style={{ color: statusColor, fontSize: '1.4rem', flexShrink: 0 }} />
        ) : (
          <FaExclamationTriangle style={{ color: statusColor, fontSize: '1.4rem', flexShrink: 0 }} />
        )}
        <div>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
            {isHealthy ? 'Optimal Cardiovascular Stability' : 'Irregular Variance Detected'}
          </h4>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
            {anomalyText || (isHealthy ? 'Pulse & HRV stay within standard baseline parameters.' : 'Pulse fluctuation exceeds standard thresholds.')}
          </p>
        </div>
      </div>

      {/* Metrics Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {/* Stability Metric */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.75)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaHeartbeat style={{ color: '#00e6e6' }} /> Cardiac Rhythm Regularity
            </span>
            <span style={{ fontWeight: 700, color: '#ffffff' }}>{Math.round(rhythmScore)}%</span>
          </div>
          <div style={{ height: '7px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, rhythmScore))}%`,
                background: 'linear-gradient(90deg, #00c8c8, #00e699)',
                borderRadius: '4px',
                transition: 'width 0.6s ease'
              }}
            />
          </div>
        </div>

        {/* Activity Metric */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.75)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaWalking style={{ color: '#ff7eb3' }} /> Movement / Activity State
            </span>
            <span style={{ fontWeight: 700, color: '#ffffff' }}>{activityLevel} ({activityPct}%)</span>
          </div>
          <div style={{ height: '7px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, activityPct))}%`,
                background: 'linear-gradient(90deg, #ff7eb3, #ff758c)',
                borderRadius: '4px',
                transition: 'width 0.6s ease'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiInsightsCard;
