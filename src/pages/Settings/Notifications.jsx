import React, { useState } from 'react';

const NOTIFICATIONS = [
  {
    id: 'health_alerts',
    title: 'Health Alerts',
    desc: 'Get notified when vitals cross critical thresholds',
    default: true,
  },
  {
    id: 'fall_detection',
    title: 'Fall Detection',
    desc: 'Immediate alert if the device detects a fall',
    default: true,
  },
  {
    id: 'location_updates',
    title: 'Location Updates',
    desc: 'Periodic patient location change notifications',
    default: false,
  },
  {
    id: 'medication',
    title: 'Medication Reminders',
    desc: 'Remind you when it\'s time for patient medication',
    default: true,
  },
  {
    id: 'weekly_report',
    title: 'Weekly Health Report',
    desc: 'Summary of patient vitals sent every Monday',
    default: false,
  },
];

const Notifications = () => {
  const [prefs, setPrefs] = useState(
    Object.fromEntries(NOTIFICATIONS.map(n => [n.id, n.default]))
  );
  const [saved, setSaved] = useState(false);

  const toggle = (id) => setPrefs(p => ({ ...p, [id]: !p[id] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="settings-section">
      <h2 className="section-title">🔔 Notifications</h2>
      <p className="section-subtitle">Choose which alerts and updates you receive.</p>

      <div className="toggle-group">
        {NOTIFICATIONS.map(({ id, title, desc }) => (
          <div key={id} className="toggle-row">
            <div className="toggle-label">
              <strong>{title}</strong>
              <span>{desc}</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={prefs[id]}
                onChange={() => toggle(id)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        ))}
      </div>

      {saved && <p className="status-msg success">✅ Notification preferences saved.</p>}

      <div className="btn-row">
        <button className="primary-btn" onClick={handleSave}>💾 Save Preferences</button>
      </div>
    </div>
  );
};

export default Notifications;
