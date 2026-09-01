import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import {
    doc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FaUserPlus, FaUserFriends, FaIdCard } from 'react-icons/fa';

const Family = () => {
    const [user] = useAuthState(auth);
    const [caregiverData, setCaregiverData] = useState(null);
    const [patients, setPatients] = useState([]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [inviting, setInviting] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const cgSnap = await getDoc(doc(db, 'caregivers', user.uid));
                if (cgSnap.exists()) {
                    const data = cgSnap.data();
                    setCaregiverData(data);

                    if (data.connectedPatients?.length > 0) {
                        const patList = [];
                        for (const pid of data.connectedPatients) {
                            const pSnap = await getDoc(doc(db, 'patients', pid));
                            if (pSnap.exists()) {
                                patList.push({ id: pid, ...pSnap.data() });
                            }
                        }
                        setPatients(patList);
                    }
                }
            } catch (err) {
                console.error('❌ Error fetching family data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail.trim() || patients.length === 0) return;

        setInviting(true);
        setMsg(null);

        try {
            // 1. Find the other caregiver by email
            const q = query(collection(db, 'caregivers'), where('email', '==', inviteEmail.trim().toLowerCase()));
            const snap = await getDocs(q);

            if (snap.empty) {
                setMsg({ type: 'error', text: '❌ No caregiver found with that email. Ask them to register first.' });
                return;
            }

            const coCaregiverId = snap.docs[0].id;
            const primaryPatientId = patients[0].id; // For now, handle the first connected patient

            // 2. Add co-caregiver to patient's authorizedCaregivers
            await updateDoc(doc(db, 'patients', primaryPatientId), {
                authorizedCaregivers: arrayUnion(coCaregiverId)
            });

            // 3. Add patient to co-caregiver's connectedPatients
            await updateDoc(doc(db, 'caregivers', coCaregiverId), {
                connectedPatients: arrayUnion(primaryPatientId)
            });

            setMsg({ type: 'success', text: `✅ ${inviteEmail} is now a co-caregiver for ${patients[0].name}!` });
            setInviteEmail('');
        } catch (err) {
            console.error(err);
            setMsg({ type: 'error', text: '❌ Failed to invite. Check permissions or try again.' });
        } finally {
            setInviting(false);
        }
    };

    if (loading) return <div className="settings-section">Loading family data...</div>;

    return (
        <div className="settings-section">
            <h2 className="section-title"><FaUserFriends /> Family Circle</h2>
            <p className="section-subtitle">Manage multiple caregivers and shared monitoring permissions.</p>

            {/* Family Code Card */}
            <div className="family-code-card" style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(0,230,230,0.1)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem'
            }}>
                <div style={{
                    background: 'rgba(0,230,230,0.1)',
                    color: '#00e6e6',
                    width: '50px', height: '50px',
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem'
                }}>
                    <FaIdCard />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>Your Family Code</h3>
                    <p style={{ margin: '0.2rem 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Share this with your patient during registration</p>
                    <div style={{
                        marginTop: '0.8rem',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        letterSpacing: '0.2em',
                        color: '#00e6e6'
                    }}>
                        {caregiverData?.familyCode || '------'}
                    </div>
                </div>
            </div>

            {/* Invite Co-Caregiver */}
            <div className="invite-block">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}><FaUserPlus /> Invite Co-Caregiver</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>
                    Add another family member or nurse to monitor <b>{patients[0]?.name || 'your patient'}</b>.
                </p>

                <form onSubmit={handleInvite} className="invite-form" style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="email"
                        placeholder="Co-caregiver's email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        style={{
                            flex: 1,
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '0.8rem 1rem',
                            borderRadius: '10px',
                            color: '#fff'
                        }}
                    />
                    <button
                        type="submit"
                        className="primary-btn"
                        disabled={inviting || patients.length === 0}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        {inviting ? 'Sending...' : 'Grant Access'}
                    </button>
                </form>
                {msg && <p className={`status-msg ${msg.type}`} style={{ marginTop: '1rem' }}>{msg.text}</p>}
            </div>

            {/* Circle Members (Simulated/Future) */}
            <div className="current-circle" style={{ marginTop: '2.5rem' }}>
                <h4 style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Caregivers in this Circle</h4>
                <div className="circle-member" style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="Me" style={{ width: '36px', borderRadius: '50%' }} />
                    <div>
                        <p style={{ margin: 0, fontWeight: 600 }}>{caregiverData?.name} (You)</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Primary Caregiver</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Family;
