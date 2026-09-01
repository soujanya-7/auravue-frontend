import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaTimes, FaComments } from 'react-icons/fa';

const MessageHubModal = ({
  isOpen = false,
  onClose,
  partnerName = 'Contact',
  messages = [],
  currentUserId,
  onSendMessage
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const formatMsgTime = (ts) => {
    if (!ts) return '';
    if (ts.toDate) {
      return ts.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (ts instanceof Date) {
      return ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return '';
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
          maxWidth: '480px',
          height: '620px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 230, 230, 0.1)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.2rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(5, 12, 20, 0.6)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00e6e6, #008fa8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#05101a',
                fontSize: '1.1rem',
                fontWeight: 700
              }}
            >
              {partnerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>
                {partnerName}
              </p>
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: '#00e699', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00e699' }} />
                Encrypted Connection Active
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              transition: 'all 0.2s'
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Message Feed */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.9rem'
          }}
        >
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'rgba(255, 255, 255, 0.4)', padding: '2rem' }}>
              <FaComments style={{ fontSize: '2.5rem', color: 'rgba(0, 230, 230, 0.3)', marginBottom: '0.8rem' }} />
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>No messages yet</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem' }}>Send a message to start check-in conversation.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId === currentUserId;
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMine ? 'flex-end' : 'flex-start',
                    maxWidth: '100%'
                  }}
                >
                  <div
                    style={{
                      padding: '0.75rem 1.1rem',
                      borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isMine
                        ? 'linear-gradient(135deg, #00c8c8, #008899)'
                        : 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      maxWidth: '82%',
                      fontSize: '0.92rem',
                      lineHeight: 1.45,
                      boxShadow: isMine ? '0 4px 15px rgba(0, 200, 200, 0.25)' : 'none',
                      wordBreak: 'break-word'
                    }}
                  >
                    {m.text}
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: 'rgba(255, 255, 255, 0.4)',
                      marginTop: '4px',
                      padding: '0 4px'
                    }}
                  >
                    {formatMsgTime(m.timestamp)}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            gap: '0.8rem',
            background: 'rgba(5, 12, 20, 0.5)'
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Message ${partnerName}...`}
            style={{
              flex: 1,
              padding: '0.8rem 1.1rem',
              borderRadius: '14px',
              border: '1px solid rgba(0, 230, 230, 0.25)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              fontSize: '0.92rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            style={{
              padding: '0.8rem 1.4rem',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #00e6e6, #00a8cc)',
              color: '#05101a',
              fontWeight: 700,
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              opacity: input.trim() ? 1 : 0.45,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'transform 0.15s ease'
            }}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageHubModal;
