import React, { useState, useEffect } from 'react';

const PulseMonitor = () => {
  const [pulse, setPulse] = useState(80);
  const [status, setStatus] = useState('');
  const [sosSent, setSosSent] = useState(false);

  const HIGH = 120;
  const LOW = 50;

  useEffect(() => {
    const interval = setInterval(async () => {
      
      const simulatedPulse = Math.floor(Math.random() * 100) + 40;
      setPulse(simulatedPulse);

      if (!sosSent && (simulatedPulse > HIGH || simulatedPulse < LOW)) {
        await sendSOS(simulatedPulse);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [sosSent]);

  const sendSOS = async (pulseValue) => {
    setSosSent(true);
    setStatus(`⚠️ Pulse ${pulseValue} bpm abnormal. Sending SOS...`);

    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );

      const payload = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        type: `Pulse abnormal: ${pulseValue} bpm`
      };

      const res = await fetch('http://localhost:5000/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      setStatus(res.ok ? `✅ SOS sent: ${text}` : `❌ Failed: ${text}`);
    } catch (err) {
      console.error(err);
      setStatus('❌ Could not send SOS.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      <h2>🩺 Pulse Rate: {pulse} bpm</h2>
      <p style={{ color: status.startsWith('✅') ? 'green' : 'red' }}>{status}</p>
    </div>
  );
};

export default PulseMonitor;
