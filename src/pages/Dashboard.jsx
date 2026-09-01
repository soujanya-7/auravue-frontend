// src/pages/Dashboard.jsx — Premium Caregiver Command Center
import React, { useEffect, useState, useRef } from 'react';
import '../styles/Dashboard.css';
import SEO from '../components/SEO';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import {
  FaBell,
  FaCog,
  FaPhone,
  FaPaperPlane,
  FaComments,
  FaSyringe,
  FaMapMarkerAlt,
  FaUserFriends
} from 'react-icons/fa';
import { MdEmergency } from 'react-icons/md';
import { auth, db } from '../firebase';
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  updateDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useToast } from '../context/ToastContext';
import { requestNotificationPermission } from '../services/NotificationService';

// Modular Components
import LivePulseVisualizer from '../components/LivePulseVisualizer';
import VitalMetricsGrid from '../components/VitalMetricsGrid';
import AiInsightsCard from '../components/AiInsightsCard';
import PatientLocationMap from '../components/PatientLocationMap';
import MessageHubModal from '../components/MessageHubModal';
import MedicationLogModal from '../components/MedicationLogModal';
import ThresholdSettingsModal from '../components/ThresholdSettingsModal';
import EmergencyAlertBanner from '../components/EmergencyAlertBanner';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const toast = useToast();

  // Patient & Caregiver state
  const [caregiverName, setCaregiverName] = useState('Caregiver');
  const [connectedPatients, setConnectedPatients] = useState([]);
  const [patientId, setPatientId] = useState(null);
  const [patientName, setPatientName] = useState('Patient');
  const [patientPhone, setPatientPhone] = useState('');

  // Live Vitals State
  const [pulse, setPulse] = useState(72);
  const [temp, setTemp] = useState('36.6');
  const [bp, setBp] = useState('120/80');
  const [spo2, setSpo2] = useState(98);
  const [fallStatus, setFallStatus] = useState('Active & Safe');
  const [isFallAlert, setIsFallAlert] = useState(false);
  const [chartData, setChartData] = useState([70, 72, 74, 73, 71, 75, 72, 73, 76]);
  const [chartLabels, setChartLabels] = useState(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
  const [location, setLocation] = useState({ lat: 10.8505, lng: 76.2711 });

  // Alerts & Notifications
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAlerts, setShowAlerts] = useState(false);
  const [activeEmergency, setActiveEmergency] = useState(null);

  // AI Analytics State
  const [aiStats, setAiStats] = useState({
    stability: 96,
    activity: 25,
    activityLevel: 'Resting',
    rhythm: 95,
    anomalyText: null
  });

  // Thresholds
  const [thresholds, setThresholds] = useState({ minPulse: 60, maxPulse: 100 });
  const [showSettings, setShowSettings] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Modals & Drawers
  const [showMedModal, setShowMedModal] = useState(false);
  const [medLogging, setMedLogging] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [messages, setMessages] = useState([]);

  const mapRef = useRef(null);

  // 1. Fetch Caregiver Profile & Connected Patients List
  useEffect(() => {
    const fetchCaregiverData = async () => {
      if (!user) return;
      try {
        const cgRef = doc(db, 'caregivers', user.uid);
        const cgSnap = await getDoc(cgRef);
        if (cgSnap.exists()) {
          const cgData = cgSnap.data();
          setCaregiverName(cgData.name || 'Caregiver');
          requestNotificationPermission(user.uid, 'caregiver');

          if (cgData.minPulse && cgData.maxPulse) {
            setThresholds({ minPulse: cgData.minPulse, maxPulse: cgData.maxPulse });
          }

          if (cgData.connectedPatients && cgData.connectedPatients.length > 0) {
            // Load list of all connected patients
            const patientList = [];
            for (const pid of cgData.connectedPatients) {
              const pSnap = await getDoc(doc(db, 'patients', pid));
              if (pSnap.exists()) {
                patientList.push({ id: pid, ...pSnap.data() });
              } else {
                patientList.push({ id: pid, name: `Patient ${pid.slice(0, 5)}` });
              }
            }
            setConnectedPatients(patientList);
            // Default to first patient if none selected
            if (!patientId && patientList.length > 0) {
              setPatientId(patientList[0].id);
              setPatientName(patientList[0].name || 'Patient');
              setPatientPhone(patientList[0].mobileNumber || patientList[0].phone || '');
            }
          }
        }
      } catch (err) {
        console.error('❌ Error fetching caregiver info:', err);
      }
    };
    fetchCaregiverData();
  }, [user, patientId]);

  // Handle Switching Patients
  const handleSelectPatient = async (pid) => {
    setPatientId(pid);
    const selected = connectedPatients.find((p) => p.id === pid);
    if (selected) {
      setPatientName(selected.name || 'Patient');
      setPatientPhone(selected.mobileNumber || selected.phone || '');
      toast.info(`Switched monitoring view to ${selected.name}`);
    }
  };

  // 2. Real-time Live Firestore subscription for Selected Patient
  useEffect(() => {
    if (!patientId) return;
    const patientRef = doc(db, 'patients', patientId);
    let pulseHistory = [];

    const unsub = onSnapshot(patientRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.name) setPatientName(data.name);
        if (data.mobileNumber || data.phone) setPatientPhone(data.mobileNumber || data.phone);

        // Fall detection status
        if (data.fallDetected) {
          setIsFallAlert(true);
          setFallStatus('🚨 FALL INCIDENT DETECTED');
          setActiveEmergency({
            type: 'FALL',
            message: `Fall detected for ${data.name || 'Patient'}!`
          });
        } else {
          setIsFallAlert(false);
          setFallStatus('Active & Safe');
        }

        // Live Vitals
        if (data.liveVitals) {
          const newPulse = data.liveVitals.pulse;
          setPulse(newPulse);
          setChartData((prev) => [...prev.slice(-14), newPulse]);
          setChartLabels((prev) => [...prev.slice(-14), new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })]);

          if (data.liveVitals.temp) setTemp(data.liveVitals.temp);
          if (data.liveVitals.bp) setBp(data.liveVitals.bp);
          if (data.liveVitals.spo2) setSpo2(data.liveVitals.spo2);

          // Compute AI stability & activity slope
          pulseHistory.push(newPulse);
          if (pulseHistory.length > 20) pulseHistory.shift();

          if (pulseHistory.length > 3) {
            const mean = pulseHistory.reduce((a, b) => a + b, 0) / pulseHistory.length;
            const variance = pulseHistory.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / pulseHistory.length;
            const stdDev = Math.sqrt(variance);
            const stabilityScore = Math.max(0, Math.min(100, 100 - stdDev * 4.5));

            const recent = pulseHistory.slice(-5);
            const slope = (recent[recent.length - 1] - recent[0]) / recent.length;

            let activityLvl = 'Resting';
            let actPct = 20;
            if (slope > 2) { activityLvl = 'Active'; actPct = 80; }
            else if (slope > 0.6) { activityLvl = 'Light Movement'; actPct = 50; }
            else if (slope < -1) { activityLvl = 'Recovering'; actPct = 35; }

            setAiStats({
              stability: stabilityScore,
              activity: actPct,
              activityLevel: activityLvl,
              rhythm: stabilityScore > 75 ? stabilityScore : Math.max(50, stabilityScore),
              anomalyText: newPulse > thresholds.maxPulse
                ? 'Elevated heart rate spike detected.'
                : newPulse < thresholds.minPulse
                ? 'Lower resting heart rate detected.'
                : null
            });
          }
        }
      }
    });

    return () => unsub();
  }, [patientId, thresholds]);

  // 3. Real-time alerts from Firestore
  useEffect(() => {
    if (!user) return;
    const alertsRef = query(
      collection(db, 'caregivers', user.uid, 'alerts'),
      orderBy('timestamp', 'desc'),
      limit(12)
    );
    const unsub = onSnapshot(alertsRef, (snap) => {
      const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAlerts(fetched);
      const unread = fetched.filter((a) => !a.read);
      setUnreadCount(unread.length);

      // Check if there is an unread SOS or Fall alert
      const activeEmerg = unread.find((a) => a.type === 'SOS' || a.type === 'FALL');
      if (activeEmerg) {
        setActiveEmergency({
          type: activeEmerg.type,
          message: activeEmerg.message || `Critical ${activeEmerg.type} Alert for ${patientName}`
        });
      }
    });
    return () => unsub();
  }, [user, patientName]);

  const markAllRead = async () => {
    if (!user) return;
    alerts.filter((a) => !a.read).forEach(async (a) => {
      await updateDoc(doc(db, 'caregivers', user.uid, 'alerts', a.id), { read: true });
    });
    setUnreadCount(0);
  };

  // 4. Location Drift Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLocation((prev) => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.0003,
        lng: prev.lng + (Math.random() - 0.5) * 0.0003
      }));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // 5. Messages Subscription
  useEffect(() => {
    if (!user || !patientId) return;
    const msgsRef = query(
      collection(db, 'chats', [user.uid, patientId].sort().join('_'), 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );
    const unsub = onSnapshot(msgsRef, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user, patientId]);

  // Actions
  const handleCallPatient = () => {
    if (patientPhone) {
      window.open(`tel:${patientPhone}`, '_self');
    } else {
      toast.warning(`No phone number on file for ${patientName}.`);
    }
  };

  const handleSMSPatient = () => {
    if (patientPhone) {
      const message = `AuraVue Health Check: Hello ${patientName}, checking in on you.`;
      window.open(`sms:${patientPhone}?body=${encodeURIComponent(message)}`, '_self');
    } else {
      toast.warning(`No phone number on file for ${patientName}.`);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || !patientId || !user) return;
    const chatId = [user.uid, patientId].sort().join('_');
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: text.trim(),
        senderId: user.uid,
        senderName: caregiverName,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error('❌ Error sending message:', err);
      toast.error('Failed to send message.');
    }
  };

  const handleLogMedication = async (medData) => {
    if (!patientId || !user) return;
    setMedLogging(true);
    try {
      await addDoc(collection(db, 'patients', patientId, 'medications'), {
        ...medData,
        loggedBy: user.uid,
        timestamp: serverTimestamp()
      });
      setShowMedModal(false);
      toast.success(`Logged ${medData.name} for ${patientName}!`);
    } catch (err) {
      console.error('❌ Error logging medication:', err);
      toast.error('Failed to log medication.');
    } finally {
      setMedLogging(false);
    }
  };

  const handleTriggerSOS = async () => {
    if (!patientId || !user) return;
    try {
      await addDoc(collection(db, 'caregivers', user.uid, 'alerts'), {
        type: 'SOS',
        patientId,
        message: `🆘 Emergency SOS initiated by Caregiver for ${patientName}.`,
        pulse,
        read: false,
        timestamp: serverTimestamp()
      });
      toast.sos(`Emergency protocol dispatched for ${patientName}!`);
    } catch (err) {
      console.error('❌ SOS trigger failed:', err);
      toast.error('Could not dispatch SOS.');
    }
  };

  const handleSaveSettings = async (newThresholds) => {
    if (!user) return;
    setSettingsSaving(true);
    try {
      await updateDoc(doc(db, 'caregivers', user.uid), {
        minPulse: newThresholds.minPulse,
        maxPulse: newThresholds.maxPulse
      });
      setThresholds(newThresholds);
      setShowSettings(false);
      toast.success('Heart rate alarm thresholds updated!');
    } catch (err) {
      console.error('❌ Error saving thresholds:', err);
      toast.error('Failed to update thresholds.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleResolveEmergency = async () => {
    setActiveEmergency(null);
    if (patientId) {
      try {
        await updateDoc(doc(db, 'patients', patientId), {
          fallDetected: false
        });
      } catch (e) {}
    }
    toast.success('Emergency marked as resolved.');
  };

  // Chart Configuration
  const chartConfig = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Heart Rate (BPM)',
        data: chartData,
        fill: true,
        borderColor: '#00e6e6',
        backgroundColor: 'rgba(0, 230, 230, 0.08)',
        pointBackgroundColor: '#00e6e6',
        pointRadius: 4,
        pointHoverRadius: 7,
        tension: 0.35,
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(5, 15, 25, 0.9)',
        titleColor: '#00e6e6',
        bodyColor: '#ffffff',
        borderColor: 'rgba(0, 230, 230, 0.3)',
        borderWidth: 1,
        padding: 10
      }
    },
    scales: {
      y: {
        ticks: { color: 'rgba(170, 195, 210, 0.7)', font: { size: 10 } },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        min: 40,
        max: 140
      },
      x: {
        ticks: { color: 'rgba(170, 195, 210, 0.7)', font: { size: 9 }, maxRotation: 0 },
        grid: { color: 'rgba(255, 255, 255, 0.03)' }
      }
    }
  };

  const formatTime = (ts) => {
    if (!ts?.toDate) return '';
    const diff = Math.floor((Date.now() - ts.toDate().getTime()) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  return (
    <>
      <SEO
        title={`Caregiver Hub • ${patientName}`}
        description="Monitor real-time heart rate, detect falls, track live GPS location, and manage care for your connected loved ones."
      />

      <div className="dashboard-v2" style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem' }}>
        {/* ── TOP STATUS & PATIENT SWITCHER BAR ── */}
        <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
              AuraVue <span style={{ color: '#00e6e6' }}>Command Center</span>
            </h1>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              Logged in as <b>{caregiverName}</b>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            {/* Multi-Patient Switcher */}
            {connectedPatients.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FaUserFriends style={{ color: '#00e6e6' }} />
                <select
                  value={patientId || ''}
                  onChange={(e) => handleSelectPatient(e.target.value)}
                  style={{
                    padding: '0.55rem 0.9rem',
                    borderRadius: '12px',
                    background: 'rgba(14, 32, 48, 0.8)',
                    color: '#ffffff',
                    border: '1px solid rgba(0, 230, 230, 0.3)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {connectedPatients.map((p) => (
                    <option key={p.id} value={p.id} style={{ background: '#0a1622', color: '#fff' }}>
                      🧓 {p.name || 'Patient'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Threshold Settings Gear */}
            <button
              onClick={() => setShowSettings(true)}
              aria-label="Settings"
              style={{
                padding: '0.6rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(0, 230, 230, 0.2)',
                color: '#00e6e6',
                cursor: 'pointer',
                fontSize: '1.1rem'
              }}
              title="Configure Alert Thresholds"
            >
              <FaCog />
            </button>

            {/* Notification Bell Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setShowAlerts(!showAlerts);
                  if (!showAlerts) markAllRead();
                }}
                aria-label="Notifications"
                style={{
                  padding: '0.6rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(0, 230, 230, 0.2)',
                  color: '#00e6e6',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  position: 'relative'
                }}
              >
                <FaBell />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      background: '#ff2a5f',
                      color: '#ffffff',
                      borderRadius: '50%',
                      fontSize: '0.65rem',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      boxShadow: '0 0 10px rgba(255, 42, 95, 0.7)'
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {showAlerts && (
                <div
                  className="glass-card notif-dropdown"
                  style={{
                    position: 'absolute',
                    top: '48px',
                    right: 0,
                    width: '320px',
                    borderRadius: '18px',
                    background: 'rgba(10, 22, 34, 0.95)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(0, 230, 230, 0.25)',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
                    zIndex: 1000,
                    padding: '1rem',
                    animation: 'toastSlideIn 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#ffffff' }}>Alert History</h4>
                    {alerts.length > 0 && (
                      <button
                        onClick={markAllRead}
                        style={{ background: 'none', border: 'none', color: '#00e6e6', fontSize: '0.72rem', cursor: 'pointer', padding: 0, minHeight: 'auto', minWidth: 'auto' }}
                      >
                        Clear unread
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {alerts.length === 0 ? (
                      <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                        No new notifications
                      </p>
                    ) : (
                      alerts.map((a) => (
                        <div
                          key={a.id}
                          style={{
                            padding: '0.6rem 0.8rem',
                            borderRadius: '10px',
                            background: a.read ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 230, 230, 0.08)',
                            borderLeft: `3px solid ${a.type === 'SOS' || a.type === 'FALL' ? '#ff2a5f' : '#00e6e6'}`,
                            fontSize: '0.82rem'
                          }}
                        >
                          <p style={{ margin: 0, fontWeight: a.read ? 400 : 700, color: '#ffffff' }}>{a.message}</p>
                          <span style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.4)', marginTop: '2px', display: 'block' }}>
                            {formatTime(a.timestamp)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── EMERGENCY ALERT BANNER (IF ACTIVE) ── */}
        <EmergencyAlertBanner
          active={Boolean(activeEmergency)}
          type={activeEmergency?.type || 'SOS'}
          message={activeEmergency?.message || `Critical Emergency for ${patientName}`}
          patientName={patientName}
          onCall={handleCallPatient}
          onResolve={handleResolveEmergency}
          onViewLocation={() => mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
        />

        {/* ── MAIN DASHBOARD GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.3fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* LEFT MAIN: Live Pulse ECG + Vitals Grid + History Chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Live Pulse & ECG Visualizer */}
            <LivePulseVisualizer
              pulse={pulse}
              minThreshold={thresholds.minPulse}
              maxThreshold={thresholds.maxPulse}
              patientName={patientName}
            />

            {/* Vital Metrics Grid with SpO2, Temp, BP, Fall Sensor */}
            <VitalMetricsGrid
              pulse={pulse}
              temp={temp}
              bp={bp}
              spo2={spo2}
              fallStatus={fallStatus}
              isFallAlert={isFallAlert}
            />

            {/* Pulse Rate History Chart */}
            <div
              className="glass-card chart-panel"
              style={{
                padding: '1.6rem',
                borderRadius: '24px',
                background: 'var(--glass-bg, rgba(14, 32, 48, 0.65))',
                border: '1px solid var(--glass-border, rgba(0, 230, 230, 0.14))',
                boxShadow: 'var(--glass-shadow, 0 16px 40px rgba(0,0,0,0.45))'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                  📈 Continuous Pulse Stream
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                  Rolling 15-point window
                </span>
              </div>
              <div style={{ height: '220px', width: '100%' }}>
                <Line data={chartConfig} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: AI Insights + Quick Action Hub */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* AI Health Diagnostics Card */}
            <AiInsightsCard
              patientName={patientName || 'Patient'}
              pulse={pulse}
              spO2={spo2}
              temp={temp}
              bp={bp}
              stability={aiStats.stability}
              activityLevel={aiStats.activityLevel}
              activityPct={aiStats.activity}
              rhythmScore={aiStats.rhythm}
              anomalyText={aiStats.anomalyText}
            />

            {/* Quick Actions Hub */}
            <div
              className="glass-card quick-actions-panel"
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
                Quick Response Hub
              </h3>

              <button
                className="action-btn"
                onClick={handleCallPatient}
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
                  justifyContent: 'flex-start',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ color: '#00e699', fontSize: '1.1rem' }}><FaPhone /></span> Call {patientName}
              </button>

              <button
                className="action-btn"
                onClick={handleSMSPatient}
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
                <span style={{ color: '#00e6e6', fontSize: '1.1rem' }}><FaPaperPlane /></span> Quick SMS Check-In
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
                <span style={{ color: '#c87eff', fontSize: '1.1rem' }}><FaComments /></span> Encrypted Message Hub
              </button>

              <button
                className="action-btn"
                onClick={() => setShowMedModal(true)}
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
                <span style={{ color: '#ffb703', fontSize: '1.1rem' }}><FaSyringe /></span> Log Medication Dose
              </button>

              <button
                className="action-btn"
                onClick={() => mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
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
                <span style={{ color: '#00e6e6', fontSize: '1.1rem' }}><FaMapMarkerAlt /></span> Live Location Pin
              </button>

              <button
                className="action-btn emergency"
                onClick={handleTriggerSOS}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.95rem 1.2rem',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(255, 42, 95, 0.8), rgba(200, 20, 60, 0.9))',
                  border: '1px solid #ff2a5f',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  boxShadow: '0 8px 25px rgba(255, 42, 95, 0.4)'
                }}
              >
                <MdEmergency style={{ fontSize: '1.3rem' }} /> Dispatch Emergency SOS
              </button>
            </div>
          </div>
        </div>

        {/* ── BOTTOM: FULL-WIDTH PATIENT LOCATION MAP ── */}
        <div ref={mapRef}>
          <PatientLocationMap location={location} patientName={patientName} />
        </div>
      </div>

      {/* ── MODALS ── */}
      <MedicationLogModal
        isOpen={showMedModal}
        onClose={() => setShowMedModal(false)}
        patientName={patientName}
        onLogMedication={handleLogMedication}
        loading={medLogging}
      />

      <ThresholdSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        patientName={patientName}
        thresholds={thresholds}
        onSave={handleSaveSettings}
        saving={settingsSaving}
      />

      <MessageHubModal
        isOpen={showMessages}
        onClose={() => setShowMessages(false)}
        partnerName={patientName}
        messages={messages}
        currentUserId={user?.uid}
        onSendMessage={handleSendMessage}
      />
    </>
  );
};

export default Dashboard;
