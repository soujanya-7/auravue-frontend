import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FaPhone, FaExclamationTriangle, FaMedkit, FaHeartbeat } from 'react-icons/fa';

const EmergencyLink = () => {
    const { patientId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmergencyInfo = async () => {
            try {
                const infoSnap = await getDoc(doc(db, 'patients', patientId, 'public_profile', 'info'));
                if (infoSnap.exists()) {
                    setData(infoSnap.data());
                }
            } catch (err) {
                console.error('❌ Failed to fetch emergency info:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEmergencyInfo();
    }, [patientId]);

    if (loading) return (
        <div style={{ background: '#050a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <p>Loading Emergency Profile...</p>
        </div>
    );

    if (!data) return (
        <div style={{ background: '#050a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: '2rem', textAlign: 'center' }}>
            <div>
                <FaExclamationTriangle style={{ fontSize: '3rem', color: '#ff3b3b', marginBottom: '1rem' }} />
                <h2>Profile Not Found</h2>
                <p style={{ opacity: 0.6 }}>This emergency link may be invalid or expired.</p>
            </div>
        </div>
    );

    return (
        <div style={{
            background: 'linear-gradient(180deg, #700000 0%, #050a0f 300px, #050a0f 100%)',
            minHeight: '100vh',
            color: '#fff',
            padding: '2rem 1rem',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            <div style={{ maxWidth: '480px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        background: '#ff3b3b',
                        padding: '0.5rem 1rem',
                        borderRadius: '30px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '1rem'
                    }}>
                        <FaExclamationTriangle /> Critical Medical Info
                    </div>
                    <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>{data.name}</h1>
                    <p style={{ opacity: 0.7 }}>Patient Emergency Life-Link</p>
                </div>

                {/* Vital Info Card */}
                <div style={{
                    background: 'rgba(255,59,59,0.1)',
                    border: '1px solid rgba(255,59,59,0.2)',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem'
                }}>
                    <div>
                        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.5, marginBottom: '0.2rem' }}>Blood Type</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ff3b3b', margin: 0 }}>{data.bloodType || 'Unknown'}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.5, marginBottom: '0.2rem' }}>Condition</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{data.condition || 'None Listed'}</p>
                    </div>
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gap: '1rem' }}>

                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.2rem' }}>
                        <h3 style={{ margin: '0 0 0.8rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff3b3b' }}>
                            <FaMedkit /> Allergies
                        </h3>
                        <p style={{ margin: 0, lineHeight: 1.5 }}>{data.allergies || 'No known allergies'}</p>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.2rem' }}>
                        <h3 style={{ margin: '0 0 0.8rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00e6e6' }}>
                            <FaHeartbeat /> Medications
                        </h3>
                        <p style={{ margin: 0, lineHeight: 1.5 }}>{data.medications || 'None listed'}</p>
                    </div>

                    {/* Emergency Contacts */}
                    <div style={{ marginTop: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Emergency Contacts</h3>
                        {data.contacts?.map((c, i) => (
                            <a
                                key={i}
                                href={`tel:${c.phone}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: 'linear-gradient(135deg, #00e6e6, #00a8cc)',
                                    color: '#050a0f',
                                    padding: '1.2rem',
                                    borderRadius: '16px',
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                    marginBottom: '0.8rem'
                                }}
                            >
                                <span>Call {c.relation}: {c.name}</span>
                                <FaPhone />
                            </a>
                        ))}
                    </div>

                </div>

                {/* Footer */}
                <p style={{ textAlign: 'center', opacity: 0.4, fontSize: '0.8rem', marginTop: '3rem' }}>
                    Provided by <b>AuraVue Health</b> • Secure responder access
                </p>

            </div>
        </div>
    );
};

export default EmergencyLink;
