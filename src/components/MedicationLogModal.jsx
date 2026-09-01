import React, { useState } from 'react';
import { FaCapsules, FaTimes, FaCheck } from 'react-icons/fa';

const MedicationLogModal = ({
  isOpen = false,
  onClose,
  patientName = 'Patient',
  onLogMedication,
  loading = false
}) => {
  const [form, setForm] = useState({ name: '', dose: '', note: '', time: 'Now' });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onLogMedication(form);
    setForm({ name: '', dose: '', note: '', time: 'Now' });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2, 6, 12, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
        animation: 'toastSlideIn 0.25s ease'
      }}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, #0a1826, #0e2236)',
          border: '1px solid rgba(0, 230, 230, 0.25)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '460px',
          padding: '2rem',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 230, 230, 0.1)',
          color: '#ffffff'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(0, 230, 230, 0.15)',
                color: '#00e6e6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}
            >
              <FaCapsules />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Log Medication</h3>
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                Recording dose for {patientName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.75)', marginBottom: '0.4rem' }}>
              Medicine Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Amlodipine, Metformin"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '12px',
                border: '1px solid rgba(0, 230, 230, 0.25)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                fontSize: '0.95rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.75)', marginBottom: '0.4rem' }}>
                Dosage
              </label>
              <input
                type="text"
                placeholder="e.g. 5mg, 1 tablet"
                value={form.dose}
                onChange={(e) => setForm((p) => ({ ...p, dose: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 230, 230, 0.25)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.75)', marginBottom: '0.4rem' }}>
                Administered
              </label>
              <input
                type="text"
                value={form.time}
                onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 230, 230, 0.25)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.75)', marginBottom: '0.4rem' }}>
              Notes / Instructions (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Taken with food, verified by caregiver"
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '12px',
                border: '1px solid rgba(0, 230, 230, 0.25)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                fontSize: '0.95rem',
                resize: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
            <button
              type="submit"
              disabled={loading || !form.name.trim()}
              style={{
                flex: 1,
                padding: '0.9rem',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #00e6e6, #00a8cc)',
                color: '#05101a',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: form.name.trim() ? 'pointer' : 'not-allowed',
                opacity: form.name.trim() ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <FaCheck /> {loading ? 'Saving...' : 'Confirm & Log Entry'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.9rem 1.4rem',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'transparent',
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicationLogModal;
