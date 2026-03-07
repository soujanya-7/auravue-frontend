import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

const Reminders = () => {
  const [user] = useAuthState(auth);
  const [reminders, setReminders] = useState([]);
  const [newTime, setNewTime] = useState('12:00');
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Fetch reminders from Firestore
  useEffect(() => {
    if (!user) return;
    const remindersRef = query(
      collection(db, 'caregivers', user.uid, 'reminders'),
      orderBy('time', 'asc')
    );

    const unsub = onSnapshot(remindersRef, (snap) => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setReminders(fetched);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const addReminder = async () => {
    if (!newName.trim() || !user) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'caregivers', user.uid, 'reminders'), {
        time: newTime,
        name: newName.trim(),
        freq: 'Daily',
        createdAt: serverTimestamp()
      });
      setNewName('');
      setNewTime('12:00');
    } catch (err) {
      console.error('❌ Failed to add reminder:', err);
      alert('Failed to save reminder.');
    } finally {
      setSaving(false);
    }
  };

  const deleteReminder = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'caregivers', user.uid, 'reminders', id));
    } catch (err) {
      console.error('❌ Failed to delete reminder:', err);
    }
  };

  return (
    <div className="settings-section">
      <h2 className="section-title">💊 Medication Reminders</h2>
      <p className="section-subtitle">Schedule daily medication reminders for your patient. These are synced to your account.</p>

      {/* Existing reminders */}
      <div className="reminder-list">
        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', padding: '1rem' }}>Loading reminders...</p>
        ) : reminders.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', padding: '1rem' }}>No reminders scheduled yet.</p>
        ) : (
          reminders.map(r => (
            <div key={r.id} className="reminder-item">
              <span className="reminder-time">{r.time}</span>
              <span className="reminder-name">{r.name}</span>
              <span className="reminder-badge">{r.freq}</span>
              <button
                className="reminder-delete"
                onClick={() => deleteReminder(r.id)}
                title="Remove"
              >🗑</button>
            </div>
          ))
        )}
      </div>

      {/* Add new reminder */}
      <div className="form-grid" style={{ marginBottom: '1rem' }}>
        <div className="form-row">
          <label>Time</label>
          <input
            type="time"
            value={newTime}
            onChange={e => setNewTime(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label>Medicine Name</label>
          <input
            type="text"
            placeholder="e.g. Metformin"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
        </div>
      </div>

      <div className="btn-row">
        <button
          className="primary-btn"
          onClick={addReminder}
          disabled={saving || !newName.trim()}
        >
          {saving ? '⏳ Saving...' : '➕ Add Reminder'}
        </button>
      </div>
    </div>
  );
};

export default Reminders;
