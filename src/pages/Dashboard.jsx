// src/pages/Dashboard.jsx — Premium Caregiver Command Center
import React, { useEffect, useState } from 'react';
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
} from 'chart.js';
import { FaBell, FaBrain, FaMapMarkerAlt, FaSyringe, FaPhone, FaCog, FaComments, FaPaperPlane } from 'react-icons/fa';
import { MdEmergency } from 'react-icons/md';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { auth, db } from '../firebase';
import { doc, getDoc, onSnapshot, collection, query, orderBy, limit, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler);

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [pulse, setPulse] = useState(0);
  const [temp, setTemp] = useState(36.6);
  const [bp, setBp] = useState('120/70');
  const [chartData, setChartData] = useState([]);
  const [location, setLocation] = useState({ lat: 10.8505, lng: 76.2711 });
  const [showAlerts, setShowAlerts] = useState(false);
  const [patientId, setPatientId] = useState(null);
  const [patientName, setPatientName] = useState('Patient');
  const [patientPhone, setPatientPhone] = useState('');
  const [caregiverName, setCaregiverName] = useState('Caregiver');
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMedModal, setShowMedModal] = useState(false);
  const [medInput, setMedInput] = useState({ name: '', dose: '', note: '' });
  const [medLogging, setMedLogging] = useState(false);
  const mapRef = React.useRef(null);
  const [showSettings, setShowSettings] = useState(false);
  const [thresholds, setThresholds] = useState({ minPulse: 60, maxPulse: 100 });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [aiStats, setAiStats] = useState({
    stability: 100,
    activity: 20,
    activityLevel: 'Calculating...',
    rhythm: 100
  });

  // 1. Fetch caregiver & connected patient info
  useEffect(() => {
    const fetchInfo = async () => {
      if (!user) return;
      try {
        const cgRef = doc(db, 'caregivers', user.uid);
        const cgSnap = await getDoc(cgRef);
        if (cgSnap.exists()) {
          const cgData = cgSnap.data();
          setCaregiverName(cgData.name || 'Caregiver');
          if (cgData.minPulse && cgData.maxPulse) {
            setThresholds({ minPulse: cgData.minPulse, maxPulse: cgData.maxPulse });
          }
          if (cgData.connectedPatients?.length > 0) {
            const pid = cgData.connectedPatients[0];
            setPatientId(pid);
            // Also fetch patient's phone once we have their ID
            const patSnap = await getDoc(doc(db, 'patients', pid));
            if (patSnap.exists()) {
              setPatientPhone(patSnap.data().phone || '');
            }
          }
        }
      } catch (err) {
        console.error('❌ Error:', err);
      }
    };
    fetchInfo();
  }, [user]);

  // 2. Live Firestore subscription
  useEffect(() => {
    if (!patientId) return;
    const patientRef = doc(db, 'patients', patientId);
    let pulseHistory = [];

    const unsub = onSnapshot(patientRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setPatientName(data.name || 'Patient');
        if (data.liveVitals) {
          const newPulse = data.liveVitals.pulse;
          setPulse(newPulse);
          setChartData(prev => [...prev.slice(-9), newPulse]);
          setTemp((Math.random() * (37.5 - 36.5) + 36.5).toFixed(1));

          // Compute AI Stats dynamically
          pulseHistory.push(newPulse);
          if (pulseHistory.length > 15) pulseHistory.shift();

          if (pulseHistory.length > 3) {
            // Stability = Inverse of Standard Deviation mapped to a percentage
            const mean = pulseHistory.reduce((a, b) => a + b, 0) / pulseHistory.length;
            const variance = pulseHistory.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / pulseHistory.length;
            const stdDev = Math.sqrt(variance);

            // Map stdDev: 0 = 100% stable, 15+ = 0% stable.
            let stabilityScore = Math.max(0, 100 - (stdDev * 5));

            // Activity Trend = Slope of recent readings
            const recent = pulseHistory.slice(-5);
            const slope = (recent[recent.length - 1] - recent[0]) / recent.length;

            let activityLvl = 'Resting';
            let actPct = 20;
            if (slope > 2) { activityLvl = 'Active'; actPct = 75; }
            else if (slope > 0.5) { activityLvl = 'Light'; actPct = 45; }
            else if (slope < -1) { activityLvl = 'Recovering'; actPct = 35; }

            setAiStats({
              stability: stabilityScore,
              activity: actPct,
              activityLevel: activityLvl,
              rhythm: stabilityScore
            });
          }
        }
      }
    });
    return () => unsub();
  }, [patientId]);

  // 3. Real-time alerts from Firestore
  useEffect(() => {
    if (!user) return;
    const alertsRef = query(
      collection(db, 'caregivers', user.uid, 'alerts'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const unsub = onSnapshot(alertsRef, (snap) => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAlerts(fetched);
      setUnreadCount(fetched.filter(a => !a.read).length);
    });
    return () => unsub();
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    alerts.filter(a => !a.read).forEach(async (a) => {
      await updateDoc(doc(db, 'caregivers', user.uid, 'alerts', a.id), { read: true });
    });
  };

  // Load messages between patient and caregiver
  useEffect(() => {
    if (!user || !patientId) return;
    const msgsRef = query(
      collection(db, 'chats', [user.uid, patientId].sort().join('_'), 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );
    const unsub = onSnapshot(msgsRef, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user, patientId]);

  // Send message handler
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !patientId) return;
    const chatId = [user.uid, patientId].sort().join('_');
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: chatInput.trim(),
        senderId: user.uid,
        timestamp: serverTimestamp()
      });
      setChatInput('');
    } catch (err) {
      console.error('❌ Error sending message:', err);
    }
  };

  const formatMsgTime = (ts) => {
    if (!ts?.toDate) return '';
    return ts.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 4. Location drift simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // BP simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setBp(`${Math.floor(Math.random() * 30) + 110}/${Math.floor(Math.random() * 20) + 70}`);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Pulse status helpers
  const getPulseStatus = () => {
    if (pulse === 0) return { text: 'Waiting...', tag: 'normal' };
    if (pulse > thresholds.maxPulse) return { text: 'Elevated', tag: 'warning' };
    if (pulse < thresholds.minPulse) return { text: 'Low', tag: 'danger' };
    return { text: 'Normal', tag: 'normal' };
  };

  const pulseStatus = getPulseStatus();

  const getPulseColor = () => {
    if (pulse > thresholds.maxPulse) return '#fca311';
    if (pulse < thresholds.minPulse) return '#ff3b3b';
    return '#00c853';
  };

  // Chart config
  const chartConfig = {
    labels: chartData.map((_, i) => `${i + 1}`),
    datasets: [{
      label: 'BPM',
      data: chartData,
      fill: true,
      borderColor: '#00e6e6',
      backgroundColor: 'rgba(0,230,230,0.07)',
      pointBackgroundColor: '#00e6e6',
      pointRadius: 3,
      pointHoverRadius: 6,
      tension: 0.4,
      borderWidth: 2,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        ticks: { color: 'rgba(139,168,181,0.7)', font: { size: 10 } },
        grid: { color: 'rgba(255,255,255,0.04)' },
        min: 40, max: 140,
      },
      x: {
        ticks: { color: 'rgba(139,168,181,0.7)', font: { size: 10 } },
        grid: { color: 'rgba(255,255,255,0.03)' },
      },
    },
  };

  const getAlertIcon = (type) => {
    if (type === 'SOS') return '🆘';
    if (type === 'HIGH_PULSE') return '💓';
    if (type === 'LOW_PULSE') return '🩺';
    return '🔔';
  };

  const formatTime = (ts) => {
    if (!ts?.toDate) return '';
    const diff = Math.floor((Date.now() - ts.toDate().getTime()) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  // === QUICK ACTION HANDLERS ===

  // 1. Call Patient
  const handleCallPatient = () => {
    if (patientPhone) {
      window.open(`tel:${patientPhone}`, '_self');
    } else {
      alert(`📞 No phone number on file for ${patientName}. Please add it in patient settings.`);
    }
  };

  // 2. Log Medication
  const handleLogMedication = async () => {
    if (!medInput.name.trim()) return;
    setMedLogging(true);
    try {
      await addDoc(collection(db, 'patients', patientId, 'medication_log'), {
        name: medInput.name.trim(),
        dose: medInput.dose.trim(),
        note: medInput.note.trim(),
        loggedBy: caregiverName,
        timestamp: serverTimestamp()
      });
      setMedInput({ name: '', dose: '', note: '' });
      setShowMedModal(false);
    } catch (err) {
      console.error('❌ Medication log failed:', err);
      alert('Failed to log medication. Please try again.');
    } finally {
      setMedLogging(false);
    }
  };

  // 3. Track Location — scroll to map
  const handleTrackLocation = () => {
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // 4. Trigger SOS from caregiver side
  const handleTriggerSOS = async () => {
    const confirmed = window.confirm(`Send SOS alert for ${patientName}? This will add an emergency record.`);
    if (!confirmed) return;
    try {
      await addDoc(collection(db, 'caregivers', user.uid, 'alerts'), {
        type: 'SOS',
        patientId: patientId,
        message: `🆘 SOS triggered by caregiver for ${patientName}.`,
        pulse: pulse,
        read: false,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error('❌ SOS trigger failed:', err);
    }
  };

  // 5. Save Settings
  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      await updateDoc(doc(db, 'caregivers', user.uid), {
        minPulse: Number(thresholds.minPulse),
        maxPulse: Number(thresholds.maxPulse)
      });
      setShowSettings(false);
      alert('✅ Alert thresholds updated successfully!');
    } catch (err) {
      console.error('❌ Settings save failed:', err);
      alert('Failed to save settings.');
    } finally {
      setSettingsSaving(false);
    }
  };

  return (
    <>
      <SEO
        title={`Caregiver Hub • ${patientName}`}
        description="Monitor real-time heart rate, track location, and manage medical alerts for your connected patient."
      />
      <div className="dashboard-v2">

        {/* ── TOP STATUS BAR ── */}
        <div className="top-bar">
          <h1>AuraVue Command Center</h1>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', position: 'relative' }}>
            <FaCog
              className="notif-bell"
              title="Settings"
              onClick={() => setShowSettings(true)}
              style={{ fontSize: '1.2rem' }}
            />
            <button className="monitor-btn">🩺 Monitoring: {patientName}</button>
            <div style={{ position: 'relative' }}>
              <FaBell
                className="notif-bell"
                onClick={() => { setShowAlerts(!showAlerts); if (!showAlerts) markAllRead(); }}
              />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  background: '#ff3b3b', color: '#fff', borderRadius: '50%',
                  fontSize: '0.65rem', width: '18px', height: '18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, pointerEvents: 'none'
                }}>{unreadCount}</span>
              )}
              {showAlerts && (
                <div className="notif-dropdown">
                  {alerts.length === 0 && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>No alerts yet</p>}
                  {alerts.map((a) => (
                    <p key={a.id} style={{ opacity: a.read ? 0.5 : 1 }}>
                      {getAlertIcon(a.type)} {a.message} <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{formatTime(a.timestamp)}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── BENTO GRID ── */}
        <div className="dashboard-bento">

          {/* LEFT — Patient Sidebar */}
          <div className="glass-card patient-sidebar">
            <div className="avatar-ring">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${caregiverName}`}
                alt="Profile"
                className="profile-pic"
              />
            </div>
            <div className="patient-name">
              <h2>{caregiverName}</h2>
              <p>Monitoring • {patientName}</p>
            </div>
            <div className="status-badge">Active Session</div>
            <div className="sidebar-logs">
              <h4>📋 Live Readings</h4>
              <div className="log-item">
                <span>💖 Heart Rate</span>
                <span>{pulse || '—'} bpm</span>
              </div>
              <div className="log-item">
                <span>🌡️ Temperature</span>
                <span>{temp} °C</span>
              </div>
              <div className="log-item">
                <span>🩸 Blood Pressure</span>
                <span>{bp}</span>
              </div>
              <div className="log-item">
                <span>🫁 SpO₂</span>
                <span>98%</span>
              </div>
              <div className="log-item">
                <span>⚡ Status</span>
                <span style={{ color: getPulseColor() }}>{pulseStatus.text}</span>
              </div>
            </div>
          </div>

          {/* CENTER-TOP — Hero Pulse */}
          <div className="glass-card hero-pulse-card">
            <div className="pulse-ring-container">
              <div className="pulse-ring" style={{ borderRadius: '50%' }}></div>
              <div className="pulse-ring" style={{ borderRadius: '50%' }}></div>
              <div className="pulse-ring" style={{ borderRadius: '50%' }}></div>
              <div className="pulse-core">
                <span className="pulse-bpm" style={{ color: getPulseColor() }}>{pulse || '—'}</span>
                <span className="pulse-unit">BPM</span>
              </div>
            </div>
            <div className="pulse-info">
              <p className="pulse-info h2" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(0,230,230,0.6)', margin: '0 0 0.5rem' }}>LIVE HEART RATE</p>
              <p className="pulse-status-text" style={{ color: getPulseColor() }}>{pulseStatus.text}</p>
              <p className="pulse-subtext">Real-time monitoring active for {patientName}</p>
              <div className="pulse-range">
                <span className="range-tag normal">Thresholds: {thresholds.minPulse}–{thresholds.maxPulse}</span>
                <span className={`range-tag ${pulseStatus.tag}`}>Current: {pulse || '—'} bpm</span>
              </div>
            </div>
          </div>

          {/* CENTER-MIDDLE — Vital Stats */}
          <div className="vitals-row">
            <div className="glass-card stat-card pulse-card">
              <span className="stat-icon">💖</span>
              <p className="stat-label">Heart Rate</p>
              <p className="stat-value" style={{ color: getPulseColor() }}>{pulse || '—'}</p>
              <p className="stat-unit">beats per minute</p>
            </div>
            <div className="glass-card stat-card temp-card">
              <span className="stat-icon">🌡️</span>
              <p className="stat-label">Body Temp</p>
              <p className="stat-value" style={{ color: '#ff9f40' }}>{temp}</p>
              <p className="stat-unit">degrees Celsius</p>
            </div>
            <div className="glass-card stat-card bp-card">
              <span className="stat-icon">🩸</span>
              <p className="stat-label">Blood Pressure</p>
              <p className="stat-value" style={{ color: '#c87eff', fontSize: '1.5rem' }}>{bp}</p>
              <p className="stat-unit">mmHg systolic/diastolic</p>
            </div>
          </div>

          {/* CENTER-BOTTOM — Chart */}
          <div className="glass-card chart-panel">
            <h3><span>📈</span> Pulse History</h3>
            <div className="chart-wrapper">
              <Line data={chartConfig} options={chartOptions} />
            </div>
          </div>

          {/* RIGHT — AI Sidebar */}
          {/* RIGHT — AI Sidebar */}
          <div className="ai-sidebar">
            {/* AI Status Card */}
            <div className="glass-card ai-card">
              <p className="ai-card-header"><FaBrain /> AI Analysis</p>
              <p className="ai-status-main">
                {aiStats.stability > 80 ? '✅ All Normal' : (aiStats.stability > 50 ? '⚠️ Check Patient' : '🚨 Critical Rhythm')}
              </p>
              <p className="ai-status-sub">
                {aiStats.stability > 80 ? 'No anomalies detected' : 'Irregular pulse patterns detected'}
              </p>
              <div className="ai-metrics">
                <div className="ai-metric-row">
                  <span className="ai-metric-label">Rhythm</span>
                  <div className="ai-metric-bar"><div className="ai-metric-fill" style={{ width: `${aiStats.stability}%`, background: aiStats.stability > 80 ? '#00e6e6' : '#ff3b3b' }}></div></div>
                  <span className="ai-metric-val">{Math.round(aiStats.stability)}%</span>
                </div>
                <div className="ai-metric-row">
                  <span className="ai-metric-label">Stability</span>
                  <div className="ai-metric-bar"><div className="ai-metric-fill" style={{ width: `${aiStats.stability}%`, background: aiStats.stability > 80 ? '#00e6e6' : '#ff3b3b' }}></div></div>
                  <span className="ai-metric-val">{Math.round(aiStats.stability)}%</span>
                </div>
                <div className="ai-metric-row">
                  <span className="ai-metric-label">Activity</span>
                  <div className="ai-metric-bar"><div className="ai-metric-fill" style={{ width: `${aiStats.activity}%`, background: '#ff7eb3' }}></div></div>
                  <span className="ai-metric-val">{aiStats.activityLevel}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card quick-actions">
              <h4>Quick Actions</h4>
              <button className="action-btn" onClick={handleCallPatient}>
                <span className="action-icon"><FaPhone /></span> Call Patient
              </button>
              <button className="action-btn" onClick={() => setShowMessages(true)} disabled={!patientId}>
                <span className="action-icon"><FaComments /></span> Message Hub
              </button>
              <button className="action-btn" onClick={() => setShowMedModal(true)} disabled={!patientId}>
                <span className="action-icon"><FaSyringe /></span> Log Medication
              </button>
              <button className="action-btn" onClick={handleTrackLocation}>
                <span className="action-icon"><FaMapMarkerAlt /></span> Track Location
              </button>
              <button className="action-btn emergency" onClick={handleTriggerSOS} disabled={!patientId}>
                <span className="action-icon"><MdEmergency /></span> Trigger SOS
              </button>
            </div>

            {/* Alerts */}
            <div className="glass-card alerts-panel">
              <h4>Recent Alerts {unreadCount > 0 && <span style={{ background: '#ff3b3b', borderRadius: '50%', padding: '0 6px', fontSize: '0.7rem', marginLeft: '0.5rem' }}>{unreadCount} new</span>}</h4>
              {alerts.length === 0 && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', padding: '0.5rem 0' }}>No alerts yet</p>}
              {alerts.map((a) => (
                <div key={a.id} className="alert-item" style={{ opacity: a.read ? 0.5 : 1 }}>
                  <span style={{ fontSize: '1rem' }}>{getAlertIcon(a.type)}</span>
                  <div>
                    <span style={{ fontSize: '0.88rem' }}>{a.message}</span>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{formatTime(a.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM FULL-WIDTH — Map */}
          <div className="glass-card map-full" ref={mapRef}>
            <h3><FaMapMarkerAlt style={{ color: '#00e6e6' }} /> Patient Location</h3>
            <MapContainer center={[location.lat, location.lng]} zoom={15}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <Marker position={[location.lat, location.lng]}>
                <Popup>🧓 {patientName}<br />Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}
      {/* ── MEDICATION LOG MODAL ── */}
      {showMedModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0e2030, #162d3e)',
            border: '1px solid rgba(0,230,230,0.15)',
            borderRadius: '20px', padding: '2rem', width: '90%', maxWidth: '440px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ color: '#00e6e6', marginBottom: '1.5rem', fontWeight: 700 }}>💊 Log Medication</h3>
            <input
              placeholder="Medication name *"
              value={medInput.name}
              onChange={e => setMedInput(p => ({ ...p, name: e.target.value }))}
              style={{ width: '100%', marginBottom: '0.8rem', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid rgba(0,230,230,0.2)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }}
            />
            <input
              placeholder="Dose (e.g., 500mg)"
              value={medInput.dose}
              onChange={e => setMedInput(p => ({ ...p, dose: e.target.value }))}
              style={{ width: '100%', marginBottom: '0.8rem', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid rgba(0,230,230,0.2)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }}
            />
            <textarea
              placeholder="Notes (optional)"
              value={medInput.note}
              onChange={e => setMedInput(p => ({ ...p, note: e.target.value }))}
              rows={3}
              style={{ width: '100%', marginBottom: '1.2rem', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid rgba(0,230,230,0.2)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: '0.95rem', resize: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button
                onClick={handleLogMedication}
                disabled={medLogging || !medInput.name.trim()}
                style={{ flex: 1, padding: '0.9rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #00e6e6, #00a8cc)', color: '#0a1a20', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}
              >
                {medLogging ? 'Saving...' : '✅ Log Entry'}
              </button>
              <button
                onClick={() => { setShowMedModal(false); setMedInput({ name: '', dose: '', note: '' }); }}
                style={{ padding: '0.9rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS MODAL ── */}
      {showSettings && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0e2030, #162d3e)',
            border: '1px solid rgba(0,230,230,0.15)',
            borderRadius: '20px', padding: '2rem', width: '90%', maxWidth: '400px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ color: '#00e6e6', marginBottom: '1.5rem', fontWeight: 700 }}>⚙️ Alert Thresholds</h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>
              Customize the heart rate range for {patientName}. You will be alerted if the pulse falls outside these bounds.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem' }}>Low Pulse Alert (BPM)</label>
              <input
                type="number"
                value={thresholds.minPulse}
                onChange={e => setThresholds(p => ({ ...p, minPulse: e.target.value }))}
                style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid rgba(0,230,230,0.2)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: '1rem', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem' }}>High Pulse Alert (BPM)</label>
              <input
                type="number"
                value={thresholds.maxPulse}
                onChange={e => setThresholds(p => ({ ...p, maxPulse: e.target.value }))}
                style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid rgba(0,230,230,0.2)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: '1rem', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button
                onClick={handleSaveSettings}
                disabled={settingsSaving}
                style={{ flex: 1, padding: '0.9rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #00e6e6, #00a8cc)', color: '#0a1a20', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}
              >
                {settingsSaving ? 'Saving...' : 'Save Settings'}
              </button>
              <button
                onClick={() => setShowSettings(false)}
                style={{ padding: '0.9rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: 600 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MESSAGE HUB MODAL ── */}
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
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>💬 {patientName}</p>
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
    </>
  );
};

export default Dashboard;
