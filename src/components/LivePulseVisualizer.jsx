import React, { useEffect, useRef } from 'react';

const LivePulseVisualizer = ({
  pulse = 0,
  minThreshold = 60,
  maxThreshold = 100,
  patientName = 'Patient',
  isPatientView = false
}) => {
  const canvasRef = useRef(null);

  // Determine pulse status & color
  const getStatus = () => {
    if (!pulse || pulse === 0) return { label: 'Standby / Syncing', color: '#00e6e6', tag: 'normal' };
    if (pulse > maxThreshold) return { label: 'Elevated (High BPM)', color: '#ffb703', tag: 'warning' };
    if (pulse < minThreshold) return { label: 'Bradycardia (Low BPM)', color: '#ff4d6d', tag: 'danger' };
    return { label: 'Normal & Stable', color: '#00e699', tag: 'normal' };
  };

  const status = getStatus();

  // Draw real-time ECG waveform canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    const points = [];
    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    // Pre-fill points with mid-line
    for (let i = 0; i < width; i++) {
      points.push(midY);
    }

    let beatCounter = 0;
    const bpm = pulse > 0 ? pulse : 75;
    // Interval between ECG spikes based on BPM
    const beatInterval = Math.max(20, Math.floor((60 / bpm) * 60));

    const render = () => {
      beatCounter++;
      let newY = midY;

      // Generate ECG P-Q-R-S-T wave pattern on beat
      const offset = beatCounter % beatInterval;
      if (offset === 1) newY = midY - 6; // P wave
      else if (offset === 3) newY = midY + 4; // Q wave
      else if (offset === 5) newY = midY - 26; // R wave (sharp peak)
      else if (offset === 7) newY = midY + 12; // S wave
      else if (offset === 11) newY = midY - 8; // T wave
      else {
        // Subtle baseline vibration
        newY = midY + (Math.random() - 0.5) * 1.5;
      }

      points.shift();
      points.push(newY);

      // Clear & draw grid lines
      ctx.clearRect(0, 0, width, height);

      // Grid background
      ctx.strokeStyle = 'rgba(0, 230, 230, 0.05)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < width; gx += 20) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += 15) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }

      // Draw ECG wave
      ctx.beginPath();
      ctx.strokeStyle = status.color;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = status.color;
      ctx.shadowBlur = 10;
      ctx.lineJoin = 'round';

      for (let i = 0; i < points.length; i++) {
        if (i === 0) ctx.moveTo(i, points[i]);
        else ctx.lineTo(i, points[i]);
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [pulse, status.color]);

  return (
    <div
      className="glass-card live-pulse-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
        padding: '1.8rem',
        background: 'var(--glass-bg, rgba(14, 32, 48, 0.65))',
        borderRadius: '24px',
        border: '1px solid var(--glass-border, rgba(0, 230, 230, 0.14))',
        boxShadow: 'var(--glass-shadow, 0 16px 40px rgba(0,0,0,0.45))',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0, 230, 230, 0.8)', display: 'block', marginBottom: '0.2rem' }}>
            {isPatientView ? 'Your Live Heart Rate' : `Real-Time Vitals — ${patientName}`}
          </span>
          <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700, color: '#ffffff' }}>
            {status.label}
          </h2>
        </div>
      </div>

      {/* Main Core & Canvas View */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Animated Pulse Ring Core */}
        <div className="pulse-ring-container" style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
          <div
            className="pulse-ring"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `2px solid ${status.color}`,
              opacity: 0.7,
              animation: `pulseRing 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite`
            }}
          />
          <div
            className="pulse-ring"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `2px solid ${status.color}`,
              opacity: 0.4,
              animation: `pulseRing 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite 0.6s`
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '12px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(14,35,50,0.9) 0%, rgba(5,15,25,0.95) 100%)',
              border: `1px solid ${status.color}60`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 25px ${status.color}30`
            }}
          >
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: status.color, lineHeight: 1 }}>
              {pulse || '—'}
            </span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.08em', marginTop: '2px' }}>
              BPM
            </span>
          </div>
        </div>

        {/* ECG Waveform Canvas */}
        <div style={{ flex: 1, minWidth: '220px', height: '110px', position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={400}
            height={110}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '14px',
              background: 'rgba(5, 12, 20, 0.7)',
              border: '1px solid rgba(0, 230, 230, 0.1)'
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '6px',
              right: '10px',
              fontSize: '0.65rem',
              color: 'rgba(0, 230, 230, 0.6)',
              fontWeight: 600,
              letterSpacing: '0.1em'
            }}
          >
            ECG STREAM 100Hz
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulseRing {
          0% {
            transform: scale(0.85);
            opacity: 0.8;
          }
          70% {
            transform: scale(1.25);
            opacity: 0;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LivePulseVisualizer;
