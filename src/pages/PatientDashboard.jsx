// src/pages/PatientDashboard.jsx — Premium Patient Health Hub
import React, { useEffect, useState } from 'react';
import '../styles/Dashboard.css';
import { FaPhone, FaHeartbeat, FaUserShield, FaExclamationTriangle, FaComments, FaPaperPlane } from 'react-icons/fa';
import { MdEmergency } from 'react-icons/md';
import { auth, db } from '../firebase';
import {
  doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, onSnapshot, query, orderBy, limit
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

const PatientDashboard = () => {
  const [user] = useAuthState(auth);
  const [caregiverName, setCaregiverName] = useState('');
  const [caregiverId, setCaregiverId] = useState(null);
  const [caregiverPhone, setCaregiverPhone] = useState('');
  const [patientName, setPatientName] = useState('Patient');
  const [pulse, setPulse] = useState(0);
  const [thresholds, setThresholds] = useState({ minPulse: 60, maxPulse: 100 });
  const [sosActive, setSosActive] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // 1. Fetch caregiver & patient info first
  useEffect(() => {
    const fetchInfo = async () => {
      if (!user) return;
      try {
        const patientRef = doc(db, 'patients', user.uid);
        const patientSnap = await getDoc(patientRef);

        if (patientSnap.exists()) {
          const patientData = patientSnap.data();
          setPatientName(patientData.name || 'Patient');

          const cgId = (patientData.authorizedCaregivers && patientData.authorizedCaregivers.length > 0)
            ? patientData.authorizedCaregivers[0]
            : patientData.connectedTo;

          if (cgId) {
            setCaregiverId(cgId);
            const caregiverRef = doc(db, 'caregivers', cgId);
            const caregiverSnap = await getDoc(caregiverRef);
            if (caregiverSnap.exists()) {
              const cgData = caregiverSnap.data();
              setCaregiverName(cgData.name);
              setCaregiverPhone(cgData.phone || '');
              if (cgData.minPulse && cgData.maxPulse) {
                setThresholds({ minPulse: cgData.minPulse, maxPulse: cgData.maxPulse });
              }
            }
          }
        }
      } catch (err) {
        console.error('❌ Error fetching info:', err);
      }
    };

    fetchInfo();
  }, [user]);

  // 2. Simulate pulse, sync to Firestore, detect custom thresholds
  useEffect(() => {
    if (!user) return;

    // Simulate pulse based on the thresholds to ensure we mostly stay within bounds
    // but occasionally spike outside them to test alerts.
    const interval = setInterval(async () => {
      const minP = thresholds.minPulse;
      const maxP = thresholds.maxPulse;
      // 90% of the time, stay in range. 10% of the time, spike out of bounds.
      const shouldSpike = Math.random() < 0.1;
      let randomPulse;
      if (shouldSpike) {
        randomPulse = Math.random() > 0.5 ? maxP + 10 : minP - 10;
      } else {
        randomPulse = Math.floor(Math.random() * (maxP - minP + 1)) + minP;
      }

      setPulse(randomPulse);

      try {
        const patientRef = doc(db, 'patients', user.uid);

        // Update live vitals
        await updateDoc(patientRef, {
          liveVitals: {
            pulse: randomPulse,
            lastUpdated: serverTimestamp()
          }
        });

        // Log health history snapshot
        await addDoc(collection(db, 'patients', user.uid, 'health_history'), {
          pulse: randomPulse,
          timestamp: serverTimestamp()
        });

        // Threshold alert using custom bounds
        if (randomPulse > thresholds.maxPulse || randomPulse < thresholds.minPulse) {
          if (caregiverId) {
            await addDoc(collection(db, 'caregivers', caregiverId, 'alerts'), {
              type: randomPulse > thresholds.maxPulse ? 'HIGH_PULSE' : 'LOW_PULSE',
              pulse: randomPulse,
              patientId: user.uid,
              message: randomPulse > thresholds.maxPulse
                ? `⚠️ Elevated pulse detected: ${randomPulse} BPM`
                : `⚠️ Low pulse detected: ${randomPulse} BPM`,
              read: false,
              timestamp: serverTimestamp()
            });
          }
        }
      } catch (err) {
        console.error('❌ Failed to sync live vitals:', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [user, caregiverId, thresholds]);

  // 3. Load messages between patient and caregiver
  useEffect(() => {
    if (!user || !caregiverId) return;
    const msgsRef = query(
      collection(db, 'chats', [user.uid, caregiverId].sort().join('_'), 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );
    const unsub = onSnapshot(msgsRef, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user, caregiverId]);

  // Send message handler
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !caregiverId) return;
    const chatId = [user.uid, caregiverId].sort().join('_');
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: chatInput.trim(),
      senderId: user.uid,
      senderName: patientName,
      timestamp: serverTimestamp()
    });
    setChatInput('');
  };

  // Call caregiver handler
  const handleCallCaregiver = () => {
    if (caregiverPhone) {
      window.open(`tel:${caregiverPhone}`, '_self');
    } else {
      alert(`📞 No phone number on file for ${caregiverName || 'your caregiver'}. Please ask them to add it in their settings.`);
    }
  };

  const formatMsgTime = (ts) => {
    if (!ts?.toDate) return '';
    return ts.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const handleSos = async () => {
    setSosActive(true);
    setTimeout(() => setSosActive(false), 6000);

    try {
      // Write a persistent SOS alert to the caregiver's alerts sub-collection
      if (caregiverId) {
        await addDoc(collection(db, 'caregivers', caregiverId, 'alerts'), {
          type: 'SOS',
          patientId: user.uid,
          message: `🆘 SOS from ${patientName}! Immediate assistance needed.`,
          pulse: pulse,
          read: false,
          timestamp: serverTimestamp()
        });
      }
      // Also mark on the patient's own doc
      await updateDoc(doc(db, 'patients', user.uid), {
        lastSos: serverTimestamp()
      });
    } catch (err) {
      console.error('❌ SOS write failed:', err);
    }
  };

  const getStatusColor = () => {
    if (pulse > 100) return '#fca311';
    if (pulse < 55 && pulse > 0) return '#ff3b3b';
    return '#00c853';
  };

  return (
    <div className="dashboard-v2">
      {/* ── TOP STATUS BAR ── */}
      <div className="top-bar">
        <h1>Welcome Back, {patientName}</h1>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <button className="monitor-btn" style={{ background: 'rgba(0, 230, 230, 0.1)', color: '#00e6e6', border: '1px solid rgba(0, 230, 230, 0.2)' }}>
            🟢 Live Monitoring Active
          </button>
        </div>
      </div>

      <div className="dashboard-bento" style={{ gridTemplateColumns: 'minmax(280px, 1fr) 2fr 1fr' }}>

        {/* LEFT — Profile & Proximity */}
        <div className="glass-card patient-sidebar">
          <div className="avatar-ring">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patientName}`}
              alt="Profile"
              className="profile-pic"
            />
          </div>
          <div className="patient-name">
            <h2>{patientName}</h2>
            <p>Role: Patient</p>
          </div>
          <div className="status-badge" style={{ background: 'rgba(0, 200, 83, 0.1)', color: '#00c853' }}>
            ID: {user?.uid?.slice(0, 8)}...
          </div>

          <div className="sidebar-logs" style={{ marginTop: '2rem' }}>
            <h4>🛡️ Protected by</h4>
            <div className="glass-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${caregiverName || 'cg'}`} style={{ width: '40px', height: '40px', borderRadius: '50%' }} alt="Caregiver" />
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{caregiverName || 'Searching...'}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(0,230,230,0.7)' }}>Primary Caregiver</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER — Vital Focus */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Hero Pulse Card */}
          <div className="glass-card hero-pulse-card" style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="pulse-ring-container">
              <div className="pulse-ring" style={{ borderRadius: '50%' }}></div>
              <div className="pulse-ring" style={{ borderRadius: '50%' }}></div>
              <div className="pulse-core">
                <span className="pulse-bpm" style={{ color: getStatusColor() }}>{pulse || '--'}</span>
                <span className="pulse-unit">BPM</span>
              </div>
            </div>
            <div className="pulse-info">
              <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>YOUR HEART RATE</p>
              <h2 style={{ fontSize: '2rem', margin: '0 0 1rem' }}>Feeling Good?</h2>
              <div className="pulse-range" style={{ justifyContent: 'flex-start' }}>
                <span className="range-tag normal">Stable Readings</span>
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="glass-card stat-card" style={{ padding: '1.5rem' }}>
              <FaUserShield style={{ fontSize: '1.5rem', color: '#00e6e6', marginBottom: '1rem' }} />
              <h3>Secure Cloud Sync</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Your health data is encrypted and synced every 4 seconds.</p>
            </div>
            <div className="glass-card stat-card" style={{ padding: '1.5rem' }}>
              <FaHeartbeat style={{ fontSize: '1.5rem', color: '#ff7eb3', marginBottom: '1rem' }} />
              <h3>Daily Wellness</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>98% consistency in vitals over the last 24 hours.</p>
            </div>
          </div>
        </div>

        {/* RIGHT — Emergency & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* SOS Section */}
          <div className={`glass-card ai-card ${sosActive ? 'sos-active-anim' : ''}`} style={{ borderColor: 'rgba(255,59,59,0.2)', background: 'linear-gradient(135deg, rgba(255,59,59,0.05), transparent)' }}>
            <p className="ai-card-header" style={{ color: '#ff3b3b' }}><FaExclamationTriangle /> Safety Protocol</p>
            <div style={{ padding: '1rem 0', textAlign: 'center' }}>
              <button
                className="action-btn emergency"
                onClick={handleSos}
                style={{ width: '120px', height: '120px', borderRadius: '50%', fontSize: '1.2rem', margin: '1rem auto' }}
              >
                <MdEmergency style={{ fontSize: '3rem' }} /><br />SOS
              </button>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '1rem' }}>
                Tap the button for immediate assistance from your caregiver.
              </p>
            </div>
          </div>

          {/* Quick Contact */}
          <div className="glass-card quick-actions">
            <h4>Quick Contact</h4>
            <button className="action-btn" onClick={handleCallCaregiver}>
              <span className="action-icon"><FaPhone /></span> Call {caregiverName || 'Caregiver'}
            </button>
            <button className="action-btn" onClick={() => setShowMessages(true)} disabled={!caregiverId}>
              <span className="action-icon"><FaComments /></span> Message Hub
            </button>
          </div>

          {/* Message Hub Modal */}
          {showMessages && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 9999, padding: '1rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #0a1a28, #112030)',
                border: '1px solid rgba(0,230,230,0.15)',
                borderRadius: '20px', width: '100%', maxWidth: '480px',
                maxHeight: '80vh', display: 'flex', flexDirection: 'column',
                boxShadow: '0 -20px 60px rgba(0,0,0,0.6)'
              }}>
                {/* Header */}
                <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>💬 {caregiverName}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(0,230,230,0.6)' }}>Secure Chat</p>
                  </div>
                  <button onClick={() => setShowMessages(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1.4rem' }}>✕</button>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {messages.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem', marginTop: '2rem' }}>No messages yet. Say hello! 👋</p>
                  )}
                  {messages.map(m => (
                    <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.senderId === user.uid ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        padding: '0.6rem 1rem', borderRadius: m.senderId === user.uid ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: m.senderId === user.uid ? 'linear-gradient(135deg,#00c8c8,#008fa8)' : 'rgba(255,255,255,0.07)',
                        maxWidth: '80%', fontSize: '0.9rem', color: '#fff'
                      }}>{m.text}</div>
                      <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>{formatMsgTime(m.timestamp)}</span>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.8rem' }}>
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    style={{ flex: 1, padding: '0.7rem 1rem', borderRadius: '12px', border: '1px solid rgba(0,230,230,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                    style={{ padding: '0.7rem 1.2rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#00e6e6,#00a8cc)', color: '#0a1a20', fontWeight: 700, cursor: 'pointer' }}
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      <style>{`
        .sos-active-anim {
          animation: sos-glow 1s infinite alternate;
        }
        @keyframes sos-glow {
          from { box-shadow: 0 0 10px rgba(255,59,59,0.2); border-color: rgba(255,59,59,0.3); }
          to { box-shadow: 0 0 30px rgba(255,59,59,0.5); border-color: rgba(255,59,59,0.7); }
        }
      `}</style>
    </div>
  );
};

export default PatientDashboard;
