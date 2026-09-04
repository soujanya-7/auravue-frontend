import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [aiResult, setAiResult] = useState(null);
  const isMountedRef = useRef(true);

  // Manual or on-event AI scan
  const handleRunScan = useCallback(async () => {
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
      if (isMountedRef.current) {
        setAiResult(result);
      }
    } catch (err) {
      console.warn('AI Scan note:', err);
    } finally {
      if (isMountedRef.current) {
        setIsScanning(false);
      }
    }
  }, [patientName, pulse, spO2, temp, bp, stability, activityLevel, medications, isEmergency, emergencyType]);

  // Run only once on mount and when emergency status changes (NOT on every pulse tick)
  useEffect(() => {
    isMountedRef.current = true;
    handleRunScan();
    return () => {
      isMountedRef.current = false;
    };
  }, [patientName, isEmergency, emergencyType]); // eslint-disable-line react-hooks/exhaustive-deps

  // Compute instantaneous human-friendly status
  const getSimpleStatus = () => {
    if (isEmergency) {
      return {
        title: 'Emergency: Fall Alert',
        text: `A ${emergencyType || 'fall'} alert is active for ${patientName}. Please check on them immediately.`,
        color: '#ff4d6d',
        icon: <FaExclamationTriangle style={{ color: '#ff4d6d', fontSize: '1.2rem', marginTop: '2px', flexShrink: 0 }} />
      };
    }
    if (pulse > 100) {
      return {
        title: 'Attention: High Heart Rate',
        text: `${patientName}'s heart rate is elevated at ${pulse} BPM. Recommend having them sit and rest.`,
        color: '#ffb703',
        icon: <FaExclamationTriangle style={{ color: '#ffb703', fontSize: '1.2rem', marginTop: '2px', flexShrink: 0 }} />
      };
    }
    if (pulse < 60 && pulse > 0) {
      return {
        title: 'Attention: Low Heart Rate',
        text: `${patientName}'s heart rate is at ${pulse} BPM, which is lower than normal.`,
        color: '#ffb703',
        icon: <FaExclamationTriangle style={{ color: '#ffb703', fontSize: '1.2rem', marginTop: '2px', flexShrink: 0 }} />
      };
    }
    return {
      title: 'Health Status: Stable',
      text: aiResult?.summary || `${patientName}'s vital signs are steady and in a healthy normal range.`,
      color: '#00e699',
      icon: <FaCheckCircle style={{ color: '#00e699', fontSize: '1.2rem', marginTop: '2px', flexShrink: 0 }} />
    };
  };

  const status = getSimpleStatus();

  return (
    <div
      className="glass-card ai-insights-card"
      style={{
        padding: '1.4rem',
        borderRadius: '24px',
        background: 'var(--glass-bg, rgba(14, 32, 48, 0.65))',
        border: '1px solid var(--glass-border, rgba(0, 230, 230, 0.14))',
        boxShadow: 'var(--glass-shadow, 0 16px 40px rgba(0,0,0,0.45))',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <FaBrain style={{ color: '#00e6e6', fontSize: '1.2rem' }} />
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
            AI Health Status
          </h3>
        </div>
        <button
          onClick={handleRunScan}
          disabled={isScanning}
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.35rem 0.75rem',
            borderRadius: '10px',
            background: isScanning ? 'rgba(0, 230, 230, 0.25)' : 'rgba(0, 230, 230, 0.12)',
            color: '#00e6e6',
            border: '1px solid rgba(0, 230, 230, 0.25)',
            cursor: isScanning ? 'wait' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s'
          }}
          title="Refresh AI health evaluation"
        >
          <FaSyncAlt style={{ animation: isScanning ? 'spin 1s linear infinite' : 'none' }} />
          {isScanning ? 'Checking...' : 'Check Now'}
        </button>
      </div>

      {/* Main Status Headline */}
      <div
        style={{
          padding: '0.95rem 1rem',
          borderRadius: '14px',
          background: `${status.color}14`,
          border: `1px solid ${status.color}35`,
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}
      >
        {status.icon}
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
            {status.title}
          </h4>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.4 }}>
            {status.text}
          </p>
        </div>
      </div>

      {/* Simple Metrics Progress */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.75)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaHeartbeat style={{ color: '#00e6e6' }} /> Health Stability
            </span>
            <span style={{ fontWeight: 700, color: '#ffffff' }}>{Math.round(rhythmScore || stability)}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, rhythmScore || stability))}%`,
                background: 'linear-gradient(90deg, #00c8c8, #00e699)',
                borderRadius: '3px',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.75)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FaWalking style={{ color: '#ff7eb3' }} /> Movement State
            </span>
            <span style={{ fontWeight: 700, color: '#ffffff' }}>{activityLevel}</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, activityPct))}%`,
                background: 'linear-gradient(90deg, #ff7eb3, #ff758c)',
                borderRadius: '3px',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <FaShieldAlt style={{ color: '#00e6e6' }} /> AuraVue AI Protection
        </span>
        <span>24/7 Monitoring</span>
      </div>
    </div>
  );
};

export default AiInsightsCard;

