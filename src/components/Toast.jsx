import React from 'react';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimesCircle,
  FaTimes
} from 'react-icons/fa';
import { MdEmergency } from 'react-icons/md';

const Toast = ({ id, type = 'info', message, duration = 4500, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle style={{ color: '#00e699' }} />;
      case 'error':
        return <FaTimesCircle style={{ color: '#ff4d6d' }} />;
      case 'warning':
        return <FaExclamationTriangle style={{ color: '#ffb703' }} />;
      case 'sos':
      case 'emergency':
        return <MdEmergency style={{ color: '#ff2a5f', fontSize: '1.4rem' }} />;
      default:
        return <FaInfoCircle style={{ color: '#00e6e6' }} />;
    }
  };

  return (
    <div
      className={`auravue-toast auravue-toast-${type}`}
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        padding: '0.9rem 1.2rem',
        borderRadius: '14px',
        background: type === 'sos' ? 'rgba(255, 42, 95, 0.15)' : 'rgba(10, 22, 34, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${
          type === 'sos'
            ? 'rgba(255, 42, 95, 0.6)'
            : type === 'success'
            ? 'rgba(0, 230, 153, 0.35)'
            : type === 'error'
            ? 'rgba(255, 77, 109, 0.35)'
            : 'rgba(0, 230, 230, 0.25)'
        }`,
        boxShadow: type === 'sos'
          ? '0 10px 40px rgba(255, 42, 95, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          : '0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        minWidth: '280px',
        maxWidth: '420px',
        pointerEvents: 'auto',
        animation: 'toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {getIcon()}
      </div>

      <div style={{ flex: 1, fontSize: '0.9rem', lineHeight: 1.45, fontWeight: 500 }}>
        {message}
      </div>

      <button
        onClick={() => onClose(id)}
        aria-label="Close notification"
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.5)',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          transition: 'color 0.2s ease',
          fontSize: '0.9rem',
          flexShrink: 0
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)')}
      >
        <FaTimes />
      </button>

      {/* Progress countdown bar */}
      {duration > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            background:
              type === 'sos'
                ? '#ff2a5f'
                : type === 'success'
                ? '#00e699'
                : type === 'error'
                ? '#ff4d6d'
                : '#00e6e6',
            width: '100%',
            animation: `toastProgress ${duration}ms linear forwards`,
            opacity: 0.8
          }}
        />
      )}
    </div>
  );
};

export default Toast;
