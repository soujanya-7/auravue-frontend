import React, { useState, useRef } from 'react';
import { auth, db, storage } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

const Profile = () => {
  const [user] = useAuthState(auth);
  const [name, setName] = useState(user?.displayName || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [preview, setPreview] = useState(user?.photoURL || null);

  const fileInputRef = useRef(null);

  // --- Avatar preview (local) ---
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  // --- Save profile ---
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      let photoURL = user?.photoURL || null;

      // 1. Upload new avatar if selected
      const file = fileInputRef.current?.files[0];
      if (file && storage) {
        const storageRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(storageRef, file);
        photoURL = await getDownloadURL(storageRef);
      }

      // 2. Update Firebase Auth profile
      if (user) {
        await updateProfile(user, { displayName: name, ...(photoURL ? { photoURL } : {}) });
      }

      // 3. Update Firestore doc
      if (user) {
        await updateDoc(doc(db, 'caregivers', user.uid), {
          name,
          phone,
          ...(photoURL ? { photoURL } : {}),
        });
      }

      setMsg({ type: 'success', text: '✅ Profile saved successfully.' });
    } catch (err) {
      console.error(err);
      // If storage isn't configured, still save name/phone
      try {
        await updateProfile(user, { displayName: name });
        await updateDoc(doc(db, 'caregivers', user.uid), { name, phone });
        setMsg({ type: 'success', text: '✅ Profile saved (avatar upload not available).' });
      } catch (e2) {
        setMsg({ type: 'error', text: '❌ Failed to save. Please try again.' });
      }
    } finally {
      setSaving(false);
    }
  };

  // Displayed avatar: local preview → auth photoURL → DiceBear fallback
  const avatarSrc =
    preview ||
    user?.photoURL ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'user'}`;

  return (
    <div className="settings-section">
      <h2 className="section-title">👤 Profile</h2>
      <p className="section-subtitle">Manage your personal information and display preferences.</p>

      {/* Avatar block */}
      <div className="profile-avatar-block">
        <img
          src={avatarSrc}
          alt="Avatar"
          className="avatar-img"
          onClick={handleAvatarClick}
          title="Click to change avatar"
        />
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="avatar-file-input"
          onChange={handleFileChange}
        />
        <div className="avatar-info">
          <h3>{name || 'Caregiver'}</h3>
          <p>{email}</p>
          <button type="button" className="avatar-upload-btn" onClick={handleAvatarClick}>
            📷 Change Avatar
          </button>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="form-grid">
          <div className="form-row">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="+91 xxxxx xxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            disabled
            style={{ opacity: 0.45, cursor: 'not-allowed' }}
          />
          <p className="form-hint">Managed by Firebase Auth — cannot be changed here.</p>
        </div>

        {msg && <p className={`status-msg ${msg.type}`}>{msg.text}</p>}

        <div className="btn-row">
          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? '⏳ Saving…' : '💾 Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
