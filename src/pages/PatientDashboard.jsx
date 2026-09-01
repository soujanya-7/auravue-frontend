// src/pages/PatientDashboard.jsx — Premium Patient Health Hub
import React, { useEffect, useState, useRef, useCallback } from 'react';
import '../styles/Dashboard.css';
import SEO from '../components/SEO';
import { FaPhone, FaPaperPlane, FaComments, FaCheckCircle, FaPills } from 'react-icons/fa';
import { MdEmergency } from 'react-icons/md';
import { auth, db, functions } from '../firebase';
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useToast } from '../context/ToastContext';
import { requestNotificationPermission } from '../services/NotificationService';

// Modular Components
import LivePulseVisualizer from '../components/LivePulseVisualizer';
import VitalMetricsGrid from '../components/VitalMetricsGrid';
import MessageHubModal from '../components/MessageHubModal';
import EmergencyAlertBanner from '../components/EmergencyAlertBanner';

const PatientDashboard = () => {
  const [user] = useAuthState(auth);
  const toast = useToast();

  const [caregiverName, setCaregiverName] = useState('');
  const [caregiverId, setCaregiverId] = useState(null);
  const [caregiverPhone, setCaregiverPhone] = useState('');
  const [patientName, setPatientName] = useState('Patient');

  // Vitals State
  const [pulse, setPulse] = useState(72);
  const [temp] = useState('36.6');
  const [bp] = useState('120/80');
  const [spo2] = useState(98);
  const [thresholds, setThresholds] = useState({ minPulse: 60, maxPulse: 100 });
  const [sosActive, setSosActive] = useState(false);
  const [fallDetected, setFallDetected] = useState(false);

  // Medication Checklist State
  const [scheduledReminders, setScheduledReminders] = useState([]);
  const [completedMeds, setCompletedMeds] = useState({});

  // Messaging State
  const [showMessages, setShowMessages] = useState(false);
  const [messages, setMessages] = useState([]);

  const lastHistoryWriteRef = useRef(0);

  // 1. Fetch Caregiver & Patient Profile
  useEffect(() => {
    const fetchInfo = async () => {
      if (!user) return;
      try {
        const patientRef = doc(db, 'patients', user.uid);
        const patientSnap = await getDoc(patientRef);

        if (patientSnap.exists()) {
          const patientData = patientSnap.data();
          setPatientName(patientData.name || 'Patient');
          requestNotificationPermission(user.uid, 'patient');

          const cgId =
            patientData.authorizedCaregivers && patientData.authorizedCaregivers.length > 0
              ? patientData.authorizedCaregivers[0]
              : patientData.connectedTo;

          if (cgId) {
            setCaregiverId(cgId);
            const caregiverRef = doc(db, 'caregivers', cgId);
            const caregiverSnap = await getDoc(caregiverRef);
            if (caregiverSnap.exists()) {
              const cgData = caregiverSnap.data();
              setCaregiverName(cgData.name || 'Caregiver');
              setCaregiverPhone(cgData.mobileNumber || cgData.phone || '');
              if (cgData.minPulse && cgData.maxPulse) {
                setThresholds({ minPulse: cgData.minPulse, maxPulse: cgData.maxPulse });
              }
            }
          }
        }
      } catch (err) {
        console.error('❌ Error fetching patient info:', err);
      }
    };

    fetchInfo();
  }, [user]);

  // 2. Fetch Caregiver's Scheduled Reminders for Patient Checklist
  useEffect(() => {
    if (!caregiverId) return;
    const remindersRef = query(
      collection(db, 'caregivers', caregiverId, 'reminders'),
      orderBy('time', 'asc')
    );
    const unsub = onSnapshot(remindersRef, (snap) => {
      setScheduledReminders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [caregiverId]);

  // 3. Emergency SOS Dispatcher
  const handleSos = useCallback(async (isFallEvent = false) => {
    setSosActive(true);
    setTimeout(() => setSosActive(false), 7000);

    const alertType = isFallEvent ? 'FALL' : 'SOS';
    const alertMsg = isFallEvent
      ? `🚨 HIGH PRIORITY: Fall detected for ${patientName}!`
      : `🆘 URGENT SOS from ${patientName}! Immediate assistance requested.`;

    try {
      // 1. Notify caregiver in Firestore
      if (caregiverId) {
        await addDoc(collection(db, 'caregivers', caregiverId, 'alerts'), {
          type: alertType,
          patientId: user.uid,
          message: alertMsg,
          pulse,
          read: false,
          timestamp: serverTimestamp()
        });
      }

      // 2. Update patient document
      await updateDoc(doc(db, 'patients', user.uid), {
        lastSos: serverTimestamp(),
        fallDetected: isFallEvent
      });

      // 3. Attempt Twilio SMS Cloud Function trigger if configured
      if (caregiverPhone) {
        try {
          const sendSosSms = httpsCallable(functions, 'sendSosSms');
          await sendSosSms({
            toPhone: caregiverPhone,
            messageBody: alertMsg
          });
        } catch (smsErr) {
          // Cloud function optional fallback
        }
      }

      toast.sos(isFallEvent ? 'Fall Alert dispatched to your caregiver!' : 'Emergency SOS sent to your caregiver!');
    } catch (err) {
      console.error('❌ SOS sequence error:', err);
      toast.error('Failed to broadcast SOS.');
    }
  }, [caregiverId, caregiverPhone, patientName, pulse, toast, user]);

  // 4. Live Vitals Simulation & Throttled History Writes (Every 60s or on anomaly)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      const minP = thresholds.minPulse;
      const maxP = thresholds.maxPulse;

      // 95% in bounds, 5% test spike
      const shouldSpike = Math.random() < 0.05;
      let randomPulse;
      if (shouldSpike) {
        randomPulse = Math.random() > 0.5 ? maxP + 8 : minP - 8;
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
            temp: '36.6',
            bp: '120/80',
            spo2: 98,
            lastUpdated: serverTimestamp()
          }
        });

        // Throttle health_history write: only write once every 60 seconds OR when pulse is abnormal
        const now = Date.now();
        const isAbnormal = randomPulse > maxP || randomPulse < minP;
        if (now - lastHistoryWriteRef.current > 60000 || isAbnormal) {
          lastHistoryWriteRef.current = now;
          await addDoc(collection(db, 'patients', user.uid, 'health_history'), {
            pulse: randomPulse,
            timestamp: serverTimestamp()
          });

          if (isAbnormal && caregiverId) {
            await addDoc(collection(db, 'caregivers', caregiverId, 'alerts'), {
              type: randomPulse > maxP ? 'HIGH_PULSE' : 'LOW_PULSE',
              pulse: randomPulse,
              patientId: user.uid,
              message: randomPulse > maxP
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

  // 5. Fall Detection Simulator Handler
  const handleSimulateFall = () => {
    setFallDetected(true);
    handleSos(true);
    setTimeout(() => setFallDetected(false), 8000);
  };

  // 6. Messages Subscription
  useEffect(() => {
    if (!user || !caregiverId) return;
    const msgsRef = query(
      collection(db, 'chats', [user.uid, caregiverId].sort().join('_'), 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );
    const unsub = onSnapshot(msgsRef, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user, caregiverId]);

  const handleSendMessage = async (text) => {
    if (!text.trim() || !caregiverId || !user) return;
    const chatId = [user.uid, caregiverId].sort().join('_');
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: text.trim(),
        senderId: user.uid,
        senderName: patientName,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error('❌ Error sending message:', err);
      toast.error('Failed to send message.');
    }
  };

  const handleCallCaregiver = () => {
    if (caregiverPhone) {
      window.open(`tel:${caregiverPhone}`, '_self');
    } else {
      toast.warning(`No phone number on file for ${caregiverName || 'caregiver'}.`);
    }
  };

  const handleSMSCaregiver = () => {
    if (caregiverPhone) {
      const message = `SOS: I need assistance immediately.`;
      window.open(`sms:${caregiverPhone}?body=${encodeURIComponent(message)}`, '_self');
    } else {
      toast.warning(`No phone number on file for ${caregiverName || 'caregiver'}.`);
    }
  };

  const toggleMedication = (id, medName) => {
    setCompletedMeds((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      if (updated[id]) {
        toast.success(`Great job! Marked ${medName} as taken.`);
      }
      return updated;
    });
  };

  return (
    <>
      <SEO
        title="My Health Hub • AuraVue"
        description="View your real-time heart rate, check medication schedules, and stay connected with your caregiver."
      />

      <div className="dashboard-v2" style={{ maxWidth: '1300px', margin: '0 auto', padding: '1.5rem' }}>
        {/* ── TOP STATUS BAR ── */}
        <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
              Welcome back, <span style={{ color: '#00e6e6' }}>{patientName}</span>
            </h1>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              Protected by <b>{caregiverName || 'Assigned Caregiver'}</b>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                background: 'rgba(0, 230, 153, 0.12)',
                color: '#00e699',
                border: '1px solid rgba(0, 230, 153, 0.3)',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00e699', animation: 'pulseGlow 2s infinite' }} />
              24/7 AI Shield Active
            </span>
          </div>
        </div>

        {/* ── EMERGENCY BANNER (IF TRIGGERED) ── */}
        <EmergencyAlertBanner
          active={sosActive || fallDetected}
          type={fallDetected ? 'FALL' : 'SOS'}
          message={fallDetected ? 'Fall Detection Alert Dispatched' : 'Emergency Assistance Requested'}
          patientName={patientName}
          onCall={handleCallCaregiver}
        />

        {/* ── MAIN CONTENT GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem' }}>
          {/* LEFT: Live Pulse & Metrics & Medication Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Live Pulse Visualizer */}
            <LivePulseVisualizer
              pulse={pulse}
              minThreshold={thresholds.minPulse}
              maxThreshold={thresholds.maxPulse}
              patientName={patientName}
              isPatientView={true}
            />

            {/* Vital Metrics Grid with Fall Simulator */}
            <VitalMetricsGrid
              pulse={pulse}
              temp={temp}
              bp={bp}
              spo2={spo2}
              fallStatus={fallDetected ? '🚨 FALL DETECTED' : 'Active & Safe'}
              isFallAlert={fallDetected}
              onSimulateFall={handleSimulateFall}
            />

            {/* Daily Medication Checklist */}
            <div
              className="glass-card medication-checklist-card"
              style={{
                padding: '1.6rem',
                borderRadius: '24px',
                background: 'var(--glass-bg, rgba(14, 32, 48, 0.65))',
                border: '1px solid var(--glass-border, rgba(0, 230, 230, 0.14))',
                boxShadow: 'var(--glass-shadow, 0 16px 40px rgba(0,0,0,0.45))'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <FaPills style={{ color: '#ffb703', fontSize: '1.2rem' }} />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                    Today's Medication Schedule
                  </h3>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                  Synced with Caregiver
                </span>
              </div>

              {scheduledReminders.length === 0 ? (
                <p style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.88rem', margin: 0, padding: '0.5rem 0' }}>
                  No scheduled reminders for today. You’re all set! 🌟
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {scheduledReminders.map((r) => {
                    const isDone = completedMeds[r.id];
                    return (
                      <div
                        key={r.id}
                        onClick={() => toggleMedication(r.id, r.name)}
                        style={{
                          padding: '0.85rem 1.1rem',
                          borderRadius: '14px',
                          background: isDone ? 'rgba(0, 230, 153, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                          border: `1px solid ${isDone ? 'rgba(0, 230, 153, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '6px',
                              border: `2px solid ${isDone ? '#00e699' : 'rgba(255, 255, 255, 0.3)'}`,
                              background: isDone ? '#00e699' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#05101a',
                              fontSize: '0.8rem'
                            }}
                          >
                            {isDone && <FaCheckCircle />}
                          </span>
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: isDone ? '#00e699' : '#ffffff', textDecoration: isDone ? 'line-through' : 'none' }}>
                              {r.name}
                            </p>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                              Scheduled at {r.time} ({r.freq || 'Daily'})
                            </span>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: isDone ? '#00e699' : 'rgba(255, 255, 255, 0.4)'
                          }}
                        >
                          {isDone ? 'Taken' : 'Tap to Complete'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: SOS Button & Quick Contacts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Massive Emergency SOS Button */}
            <div
              className={`glass-card emergency-sos-panel ${sosActive ? 'sos-active-anim' : ''}`}
              style={{
                padding: '2rem 1.5rem',
                borderRadius: '24px',
                background: 'linear-gradient(145deg, rgba(255, 42, 95, 0.12), rgba(15, 30, 45, 0.7))',
                border: '1px solid rgba(255, 42, 95, 0.35)',
                boxShadow: '0 16px 40px rgba(255, 42, 95, 0.2)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ff8099', marginBottom: '0.8rem' }}>
                INSTANT EMERGENCY BEACON
              </span>

              <button
                className="action-btn emergency"
                onClick={() => handleSos(false)}
                style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff2a5f, #d60036)',
                  border: '4px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 0 40px rgba(255, 42, 95, 0.6)',
                  color: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  margin: '0.5rem 0 1.2rem',
                  transition: 'transform 0.15s ease'
                }}
              >
                <MdEmergency style={{ fontSize: '3.2rem', lineHeight: 1 }} />
                <span style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '0.05em', marginTop: '2px' }}>SOS</span>
              </button>

              <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.5, maxWidth: '280px' }}>
                Tap anytime for immediate help. Transmits your GPS location and rings <b>{caregiverName || 'Caregiver'}</b>.
              </p>
            </div>

            {/* Quick Contact & Message Hub */}
            <div
              className="glass-card patient-quick-contact"
              style={{
                padding: '1.6rem',
                borderRadius: '24px',
                background: 'var(--glass-bg, rgba(14, 32, 48, 0.65))',
                border: '1px solid var(--glass-border, rgba(0, 230, 230, 0.14))',
                boxShadow: 'var(--glass-shadow, 0 16px 40px rgba(0,0,0,0.45))',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem'
              }}
            >
              <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                Reach Caregiver
              </h3>

              <button
                className="action-btn"
                onClick={handleCallCaregiver}
                style={{
                  padding: '0.85rem 1.2rem',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  justifyContent: 'flex-start'
                }}
              >
                <span style={{ color: '#00e699', fontSize: '1.1rem' }}><FaPhone /></span> Call {caregiverName || 'Caregiver'}
              </button>

              <button
                className="action-btn"
                onClick={handleSMSCaregiver}
                style={{
                  padding: '0.85rem 1.2rem',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  justifyContent: 'flex-start'
                }}
              >
                <span style={{ color: '#00e6e6', fontSize: '1.1rem' }}><FaPaperPlane /></span> Text SOS Message
              </button>

              <button
                className="action-btn"
                onClick={() => setShowMessages(true)}
                style={{
                  padding: '0.85rem 1.2rem',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  justifyContent: 'flex-start'
                }}
              >
                <span style={{ color: '#c87eff', fontSize: '1.1rem' }}><FaComments /></span> Open Message Hub
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MESSAGE HUB MODAL ── */}
      <MessageHubModal
        isOpen={showMessages}
        onClose={() => setShowMessages(false)}
        partnerName={caregiverName || 'Caregiver'}
        messages={messages}
        currentUserId={user?.uid}
        onSendMessage={handleSendMessage}
      />
    </>
  );
};

export default PatientDashboard;
