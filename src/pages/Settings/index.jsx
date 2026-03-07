import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import '../../styles/Settings.css';

const NAV_LINKS = [
  { to: 'profile', icon: '👤', label: 'Profile' },
  { to: 'family', icon: '👨‍👩‍👧‍👦', label: 'Family Circle' },
  { to: 'emergency', icon: '🚑', label: 'Emergency Profile' },
  { to: 'notifications', icon: '🔔', label: 'Notifications' },
  { to: 'reminders', icon: '💊', label: 'Reminders' },
  { to: 'security', icon: '🔒', label: 'Security' },
];

const Settings = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="settings-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>⚙️ Settings</h2>
        <nav>
          {NAV_LINKS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-divider" />
        <button className="sidebar-footer" onClick={handleLogout}>
          🚪 Sign Out
        </button>
      </aside>

      {/* Page Content */}
      <main className="settings-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Settings;
