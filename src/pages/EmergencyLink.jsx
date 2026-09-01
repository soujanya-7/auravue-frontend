import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FaPhone, FaExclamationTriangle, FaMedkit, FaHeartbeat, FaPrint } from 'react-icons/fa';
import SEO from '../components/SEO';
import '../styles/EmergencyLink.css';

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

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="emergency-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Loading Emergency Profile...</p>
        </div>
    );

    if (!data) return (
        <div className="emergency-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div>
                <FaExclamationTriangle style={{ fontSize: '3rem', color: '#ff3b3b', marginBottom: '1rem' }} />
                <h2>Profile Not Found</h2>
                <p style={{ opacity: 0.6 }}>This emergency link may be invalid or expired.</p>
            </div>
        </div>
    );

    return (
        <div className="emergency-page">
            <SEO
                title={`CRITICAL: Emergency Medical Profile • ${data.name}`}
                description={`Immediate medical information for ${data.name}. Blood Type: ${data.bloodType}, Condition: ${data.condition}.`}
            />
            <div className="emergency-container">

                {/* Header */}
                <div className="emergency-header">
                    <div className="critical-badge">
                        <FaExclamationTriangle /> Critical Medical Info
                    </div>
                    <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem' }}>{data.name}</h1>
                    <p style={{ opacity: 0.7 }}>Patient Emergency Life-Link</p>
                </div>

                {/* Vital Info Card */}
                <div className="vital-card">
                    <div>
                        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.5, marginBottom: '0.2rem' }}>Blood Type</p>
                        <p style={{ fontSize: '2rem', fontWeight: 800, color: '#ff3b3b', margin: 0 }}>{data.bloodType || 'Unknown'}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.5, marginBottom: '0.2rem' }}>Condition</p>
                        <p style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>{data.condition || 'None Listed'}</p>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="details-grid">

                    <div className="detail-box">
                        <h3 style={{ margin: '0 0 0.8rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff3b3b' }}>
                            <FaMedkit /> Allergies
                        </h3>
                        <p style={{ margin: 0, lineHeight: 1.5 }}>{data.allergies || 'No known allergies'}</p>
                    </div>

                    <div className="detail-box">
                        <h3 style={{ margin: '0 0 0.8rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00e6e6' }}>
                            <FaHeartbeat /> Medications
                        </h3>
                        <p style={{ margin: 0, lineHeight: 1.5 }}>{data.medications || 'None listed'}</p>
                    </div>

                    {/* Emergency Contacts */}
                    <div style={{ marginTop: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Emergency Contacts</h3>
                        {data.contacts?.map((c, i) => (
                            <a key={i} href={`tel:${c.phone}`} className="contact-link">
                                <span>Call {c.relation}: {c.name}</span>
                                <FaPhone />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <button className="print-btn" onClick={handlePrint}>
                    <FaPrint /> Print Medical Profile / Save PDF
                </button>

                {/* Footer */}
                <p style={{ textAlign: 'center', opacity: 0.4, fontSize: '0.8rem', marginTop: '3rem' }}>
                    Provided by <b>AuraVue Health</b> • Secure responder access
                </p>

            </div>
        </div>
    );
};

export default EmergencyLink;
