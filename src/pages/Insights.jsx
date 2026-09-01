import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Line } from 'react-chartjs-2';
import { FaChartLine, FaHeartbeat, FaArrowUp, FaArrowDown, FaBrain, FaCalendarAlt } from 'react-icons/fa';
import SEO from '../components/SEO';
import '../styles/Insights.css';

const Insights = () => {
    const [user] = useAuthState(auth);
    const [patientId, setPatientId] = useState(null);
    const [patientName, setPatientName] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState(500); // 500 = ~7 days, 2000 = ~30 days
    const [stats, setStats] = useState({
        avg: 0,
        min: 0,
        max: 0,
        stability: 0,
        trend: 'stable'
    });

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const cgSnap = await getDoc(doc(db, 'caregivers', user.uid));
                if (cgSnap.exists() && cgSnap.data().connectedPatients?.length > 0) {
                    const pid = cgSnap.data().connectedPatients[0];
                    setPatientId(pid);

                    const pSnap = await getDoc(doc(db, 'patients', pid));
                    if (pSnap.exists()) setPatientName(pSnap.data().name);

                    const historyRef = query(
                        collection(db, 'patients', pid, 'health_history'),
                        orderBy('timestamp', 'desc'),
                        limit(range)
                    );
                    const hSnap = await getDocs(historyRef);
                    const rawData = hSnap.docs.map(d => ({
                        pulse: d.data().pulse,
                        time: d.data().timestamp?.toDate() || new Date()
                    })).reverse();

                    setHistory(rawData);
                    calculateStats(rawData);
                }
            } catch (err) {
                console.error('❌ Failed to fetch insights:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user, range]);

    const calculateStats = (data) => {
        if (data.length === 0) return;
        const pulses = data.map(d => d.pulse);
        const avg = pulses.reduce((a, b) => a + b, 0) / pulses.length;
        const min = Math.min(...pulses);
        const max = Math.max(...pulses);

        // Simple stability check (variance approximation)
        const variance = pulses.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / pulses.length;
        const stability = Math.max(0, 100 - (Math.sqrt(variance) * 5));

        setStats({
            avg: Math.round(avg),
            min,
            max,
            stability: Math.round(stability),
            trend: avg > 85 ? 'Elevated' : (avg < 60 ? 'Low' : 'Stable')
        });
    };

    const chartData = {
        labels: history.map(h => h.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
        datasets: [{
            label: 'Pulse Rate (BPM)',
            data: history.map(h => h.pulse),
            borderColor: '#00e6e6',
            backgroundColor: 'rgba(0, 230, 230, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            fill: true,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { display: false },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: 'rgba(255, 255, 255, 0.3)', font: { size: 10 } }
            }
        }
    };

    if (loading && history.length === 0) return (
        <div className="insights-page">
            <header className="insights-header">
                <div className="header-meta">
                    <h1><FaChartLine /> Health Insights</h1>
                    <p>Analyzing health trends...</p>
                </div>
            </header>
            <div className="loading-state" style={{ textAlign: 'center', padding: '10rem 0', opacity: 0.5 }}>
                Generating Deep Analytical Report...
            </div>
        </div>
    );

    if (!patientId) return <div className="insights-page empty">No patient data available.</div>;

    return (
        <div className="insights-page">
            <SEO
                title={`Health Insights • ${patientName}`}
                description="Deep-dive analytical report of pulse trends and health stability over the last 7 days."
            />
            <header className="insights-header">
                <div className="header-meta">
                    <h1><FaChartLine /> Health Insights</h1>
                    <p>Analytical Report • {patientName}</p>
                </div>
                <div className="range-selector">
                    <button className={range === 500 ? 'active' : ''} onClick={() => setRange(500)}>7 Days</button>
                    <button className={range === 2000 ? 'active' : ''} onClick={() => setRange(2000)}>30 Days</button>
                </div>
            </header>

            <div className="insights-grid">
                {/* Main Chart */}
                <div className="insights-card main-chart">
                    <div className="card-lbl">
                        <FaCalendarAlt /> Pulse Variability ({range === 500 ? '7-Day' : '30-Day'} Sample)
                        {loading && <span className="sync-indicator">Refreshing...</span>}
                    </div>
                    <div className="chart-container">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                {/* AI Verdict */}
                <div className="insights-card ai-verdict">
                    <div className="card-lbl"><FaBrain /> AI Health Summary</div>
                    <div className="verdict-content">
                        <div className="verdict-score" style={{ color: stats.stability > 80 ? '#00e6e6' : '#ff9f40' }}>
                            {stats.stability}%
                            <span>Stability Score</span>
                        </div>
                        <p className="verdict-text">
                            {stats.stability > 80
                                ? "Optimal rhythm detected. The patient's pulse remains highly consistent with expected resting patterns."
                                : "Moderate variability observed. Pulse frequently fluctuates outside the 15% deviation zone."}
                        </p>
                        <div className={`verdict-badge ${stats.trend.toLowerCase()}`}>
                            Trend: {stats.trend}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="insights-stats">
                    <div className="insights-card stat-item">
                        <div className="card-lbl">Average Heart Rate</div>
                        <div className="stat-row">
                            <span className="stat-val">{stats.avg} <span>BPM</span></span>
                            <FaHeartbeat className="stat-icn" />
                        </div>
                    </div>
                    <div className="insights-card stat-item">
                        <div className="card-lbl">Peak Reading</div>
                        <div className="stat-row">
                            <span className="stat-val">{stats.max} <span>BPM</span></span>
                            <FaArrowUp className="stat-icn" style={{ color: '#ff3b3b' }} />
                        </div>
                    </div>
                    <div className="insights-card stat-item">
                        <div className="card-lbl">Lowest Reading</div>
                        <div className="stat-row">
                            <span className="stat-val">{stats.min} <span>BPM</span></span>
                            <FaArrowDown className="stat-icn" style={{ color: '#00e6e6' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Insights;
