import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FaHeartbeat, FaPhone, FaLink, FaSave, FaExternalLinkAlt } from 'react-icons/fa';

const Emergency = () => {
    const [user] = useAuthState(auth);
    const [patientId, setPatientId] = useState(null);
    const [patientName, setPatientName] = useState('');
    const [form, setForm] = useState({
        name: '',
        bloodType: '',
        condition: '',
        allergies: '',
        medications: '',
        contacts: [{ name: '', relation: '', phone: '' }]
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const cgSnap = await getDoc(doc(db, 'caregivers', user.uid));
                if (cgSnap.exists() && cgSnap.data().connectedPatients?.length > 0) {
                    const pid = cgSnap.data().connectedPatients[0];
                    setPatientId(pid);

                    const pSnap = await getDoc(doc(db, 'patients', pid));
                    if (pSnap.exists()) {
                        setPatientName(pSnap.data().name);
                        setForm(prev => ({ ...prev, name: pSnap.data().name }));
                    }

                    const infoSnap = await getDoc(doc(db, 'patients', pid, 'public_profile', 'info'));
                    if (infoSnap.exists()) {
                        setForm(infoSnap.data());
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleSave = async () => {
        if (!patientId) return;
        setSaving(true);
        setMsg(null);
        try {
            await setDoc(doc(db, 'patients', patientId, 'public_profile', 'info'), form);
            setMsg({ type: 'success', text: '✅ Emergency profile updated successfully!' });
        } catch (err) {
            console.error(err);
            setMsg({ type: 'error', text: '❌ Failed to save profile.' });
        } finally {
            setSaving(false);
        }
    };

    const updateContact = (index, field, value) => {
        const newContacts = [...form.contacts];
        newContacts[index][field] = value;
        setForm({ ...form, contacts: newContacts });
    };

    const addContact = () => {
        setForm({ ...form, contacts: [...form.contacts, { name: '', relation: '', phone: '' }] });
    };

    const publicLink = `${window.location.origin}/emergency/${patientId}`;

    if (loading) return <div className="settings-section">Loading emergency profile...</div>;
    if (!patientId) return <div className="settings-section">No connected patient found. Please link a patient first.</div>;

    return (
        <div className="settings-section">
            <h2 className="section-title"><FaHeartbeat style={{ color: '#ff3b3b' }} /> Emergency Life-Link</h2>
            <p className="section-subtitle">Configure the public safety profile for <b>{patientName}</b>. This info is visible to first responders.</p>

            <div className="form-grid">
                <div className="form-row">
                    <label>Full Name (as it appears on ID)</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                </div>
                <div className="form-row">
                    <label>Blood Type</label>
                    <select value={form.bloodType} onChange={e => setForm({ ...form, bloodType: e.target.value })}>
                        <option value="">Select...</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </select>
                </div>
            </div>

            <div className="form-row" style={{ marginTop: '1.5rem' }}>
                <label>Primary Condition (e.g. Type 2 Diabetes, Alzheimer's)</label>
                <input
                    type="text"
                    placeholder="Main health concern"
                    value={form.condition}
                    onChange={e => setForm({ ...form, condition: e.target.value })}
                />
            </div>

            <div className="form-row" style={{ marginTop: '1.5rem' }}>
                <label>Critical Allergies</label>
                <textarea
                    rows={2}
                    placeholder="Peanuts, Penicillin, etc."
                    value={form.allergies}
                    onChange={e => setForm({ ...form, allergies: e.target.value })}
                />
            </div>

            <div className="form-row" style={{ marginTop: '1.5rem' }}>
                <label>Active Medications</label>
                <textarea
                    rows={2}
                    placeholder="List essential medications"
                    value={form.medications}
                    onChange={e => setForm({ ...form, medications: e.target.value })}
                />
            </div>

            {/* Emergency Contacts */}
            <div style={{ marginTop: '2.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}><FaPhone /> Emergency Contacts</h3>
                {form.contacts.map((contact, index) => (
                    <div key={index} className="form-grid" style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px' }}>
                        <div className="form-row">
                            <label>Name</label>
                            <input type="text" value={contact.name} onChange={e => updateContact(index, 'name', e.target.value)} />
                        </div>
                        <div className="form-row">
                            <label>Relation</label>
                            <input type="text" placeholder="e.g. Daughter" value={contact.relation} onChange={e => updateContact(index, 'relation', e.target.value)} />
                        </div>
                        <div className="form-row">
                            <label>Phone Number</label>
                            <input type="tel" value={contact.phone} onChange={e => updateContact(index, 'phone', e.target.value)} />
                        </div>
                    </div>
                ))}
                <button className="ghost-btn" onClick={addContact} style={{ padding: '0.5rem 1rem' }}>+ Add Another Contact</button>
            </div>

            {msg && <p className={`status-msg ${msg.type}`} style={{ marginTop: '1.5rem' }}>{msg.text}</p>}

            <div className="btn-row" style={{ marginTop: '2.5rem' }}>
                <button className="primary-btn" onClick={handleSave} disabled={saving}>
                    <FaSave /> {saving ? 'Saving...' : 'Save Emergency Profile'}
                </button>
            </div>

            {/* Public Link Section */}
            <div style={{
                marginTop: '3rem',
                padding: '1.5rem',
                background: 'rgba(0,230,230,0.05)',
                border: '1px solid rgba(0,230,230,0.2)',
                borderRadius: '16px'
            }}>
                <h4 style={{ margin: '0 0 0.5rem', color: '#00e6e6' }}><FaLink /> Responder Access Link</h4>
                <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '1rem' }}>
                    This link should be printed or added to medical ID tags. It allows first responders to see the info above without a password.
                </p>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <input
                        readOnly
                        value={publicLink}
                        style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: 'none', padding: '0.7rem', borderRadius: '8px', color: '#00e6e6', fontSize: '0.85rem' }}
                    />
                    <button
                        className="ghost-btn"
                        onClick={() => window.open(publicLink, '_blank')}
                        style={{ padding: '0.7rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <FaExternalLinkAlt /> View Live
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Emergency;
