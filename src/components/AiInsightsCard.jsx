import React, { useState, useEffect, useCallback } from 'react';
import {
  FaBrain,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHeartbeat,
  FaWalking,
  FaSyncAlt,
  FaShieldAlt
} from 'react-icons/fa';
import { analyzePatientHealthWithAi } from '../services/geminiService';

const AiInsightsCard = ({
  patientName = 'Patient',
  pulse = 72,
  spO2 = 98,
  temp = 36.6,
  bp = '120/80',
  stability = 95,
  activityLevel = 'Resting',
  activityPct = 25,
  rhythmScore = 96,
  anomalyText = null,
  medications = [],
  isEmergency = false,
  emergencyType = null
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [assessment, setAssessment] = useState(null);

  const runAiDiagnosticScan = useCallback(async () => {
    setIsScanning(true);
    try {
      const result = await analyzePatientHealthWithAi({
        patientName,
        pulse,
        spO2,
        temp,
        bp,
        stability,
        activityLevel,
        medications,
        isEmergency,
        emergencyType
      });
      setAssessment(result);
    } catch (err) {
      console.error('Failed to run AI assessment:', err);
    } finally {
      setIsScanning(false);
    }
  }, [patientName, pulse, spO2, temp, bp, stability, activityLevel, medications, isEmergency, emergencyType]);

  // Initial assessment on load
  useEffect(() => {
    runAiDiagnosticScan();
  }, [runAiDiagnosticScan]);

  const riskLevel = assessment?.riskLevel || (stability >= 80 ? 'Optimal' : stability >= 55 ? 'Moderate Concern' : 'Critical Alert');
  const isHealthy = riskLevel === 'Optimal';
  const isCritical = riskLevel === 'Critical Alert';
  const statusColor = isHealthy ? '#00e699' : isCritical ? '#ff4d6d' : '#ffb703';

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
        gap: '1.2rem',
        position: 'relative'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <FaBrain style={{ color: '#00e6e6', fontSize: '1.3rem' }} />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary, #ffffff)' }}>
            Gemini AI Diagnostics
          </h3>
        </div>
        <button
          onClick={runAiDiagnosticScan}
          disabled={isScanning}
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.3rem 0.75rem',
            borderRadius: '12px',
            background: isScanning ? 'rgba(0, 230, 230, 0.25)' : 'rgba(0, 230, 230, 0.12)',
            color: '#00e6e6',
            border: '1px solid rgba(0, 230, 230, 0.25)',
            cursor: isScanning ? 'wait' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s'
          }}
          title="Re-run live AI clinical evaluation"
        >
          <FaSyncAlt style={{ animation: isScanning ? 'spin 1s linear infinite' : 'none' }} />
          {isScanning ? 'Analyzing...' : 'Run Scan'}
        </button>
      </div>

      {/* Main Status Headline */}
      <div
        style={{
          padding: '1rem 1.1rem',
          borderRadius: '16px',
          background: `${statusColor}12`,
          border: `1px solid ${statusColor}30`,
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.8rem'
        }}
      >
        {isHealthy ? (
          <FaCheckCircle style={{ color: statusColor, fontSize: '1.2rem', flexShrink: 0, marginTop: '2px' }} />
        ) : (
          <FaExclamationTriangle style={{ color: statusColor, fontSize: '1.2rem', flexShrink: 0, marginTop: '2px' }} />
        )}
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary, #ffffff)' }}>
            {assessment?.riskLevel || (isHealthy ? 'Optimal Cardiovascular Stability' : 'Irregular Variance Detected')}
          </h4>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary, rgba(255, 255, 255, 0.8))', lineHeight: 1.45 }}>
            {assessment?.summary || anomalyText || (isHealthy ? 'Pulse and telemetry metrics stay within standard baseline parameters.' : 'Pulse fluctuation exceeds standard thresholds.')}
          </p>
        </div>
      </div>

      {/* Metrics Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {/* Stability Metric */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--text-secondary, rgba(255, 255, 255, 0.75))', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaHeartbeat style={{ color: '#00e6e6' }} /> Cardiac Rhythm Regularity
            </span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary, #ffffff)' }}>{Math.round(rhythmScore)}%</span>
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
            <span style={{ color: 'var(--text-secondary, rgba(255, 255, 255, 0.75))', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaWalking style={{ color: '#ff7eb3' }} /> Movement / Activity State
            </span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary, #ffffff)' }}>{activityLevel} ({activityPct}%)</span>
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

      {/* Model Footnote */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.6rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <FaShieldAlt style={{ color: '#00e6e6' }} /> {assessment?.source || 'Gemini 1.5 Clinical Telemetry'}
        </span>
        <span>{assessment?.timestamp ? `Evaluated at ${assessment.timestamp}` : 'Continuous Monitoring'}</span>
      </div>
    </div>
  );
};

export default AiInsightsCard;

