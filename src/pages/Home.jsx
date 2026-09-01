import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import SEO from "../components/SEO";
import "../styles/Home.css";
import useCountUp from "../hooks/useCountUp";
import Roadmap from "./Roadmap";

import sosIcon from "../assets/sos.png";
import pulseIcon from "../assets/pulse.png";
import fallIcon from "../assets/fall.png";
import cameraIcon from "../assets/photo-camera.png";
import neckbandHero from "../assets/neckband-hero.png";

function Home() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = React.useState(null);
  const imageRef = React.useRef(null);

  const stat1 = useCountUp(37, 1500, 'M+');
  const stat2 = useCountUp(95, 1500, '%');
  const stat3 = useCountUp(3, 1000, 's');
  const stat4 = useCountUp(24, 1200, '/7');

  const handleMouseMove = (e) => {
    const el = imageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 20;
    const rotateX = ((centerY - y) / centerY) * 20;
    el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  };

  const handleMouseLeave = () => {
    const el = imageRef.current;
    if (!el) return;
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleGetStarted = () => {
    navigate("/role");
  };

  useEffect(() => {
    const handleScroll = () => {
      // Reveal sections
      document.querySelectorAll(".reveal").forEach((el) => {
        const top = el.getBoundingClientRect().top;
        if (top < window.innerHeight - 100) {
          el.classList.add("visible");
        }
      });

      // Parallax on particles
      const particles = document.querySelector('.hero-particles');
      if (particles) {
        particles.style.transform = `translateY(${window.scrollY * 0.3}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="auravue-home">
      <SEO
        title="Smart Health & AI-Powered Elderly Care"
        description="AuraVue provides AI-powered health monitoring, fall detection, and automated SOS alerts for elderly individuals living independently."
      />

      {/* 🚀 Full-Screen Hero */}
      <section className="hero">
        {/* Floating particles */}
        <div className="hero-particles">
          <div className="particle" style={{ animationDelay: '0s', left: '10%', top: '20%' }}></div>
          <div className="particle" style={{ animationDelay: '2s', left: '30%', top: '60%' }}></div>
          <div className="particle" style={{ animationDelay: '4s', left: '70%', top: '30%' }}></div>
          <div className="particle" style={{ animationDelay: '1s', left: '85%', top: '70%' }}></div>
          <div className="particle" style={{ animationDelay: '3s', left: '50%', top: '80%' }}></div>
          <div className="particle" style={{ animationDelay: '5s', left: '20%', top: '45%' }}></div>
        </div>

        <div className="hero-text">
          <h1>Smart Health.<br />Safer Living.</h1>
          <p className="hero-desc">
            AuraVue is an intelligent wearable neckband that continuously monitors vitals,
            detects falls, and triggers automated SOS alerts — giving families peace of mind.
          </p>
          <div className="hero-cta-glass">
            <div className="hero-actions">
              <button className="btn-primary" onClick={handleGetStarted}>
                Choose Role to Start
              </button>
              <a href="#how" className="btn-secondary">
                See How It Works ↓
              </a>
            </div>
          </div>

          {/* Embedded Stats */}
          <div className="stats-grid-minimal hero-stats">
              <div className="stat-item-min">
                <h3 ref={stat1.ref}>{stat1.count}{stat1.suffix}</h3>
                <p>Elderly living alone globally</p>
              </div>
              <div className="stat-item-min">
                <h3 ref={stat2.ref}>{stat2.count}{stat2.suffix}</h3>
                <p>Precision AI prediction rate</p>
              </div>
              <div className="stat-item-min">
                <h3 ref={stat3.ref}>&lt;{stat3.count}{stat3.suffix}</h3>
                <p>Alert response latency</p>
              </div>
              <div className="stat-item-min">
                <h3 ref={stat4.ref}>{stat4.count}{stat4.suffix}</h3>
                <p>Continuous Monitoring</p>
              </div>
            </div>
          </div>

        <div className="hero-visual-showcase" ref={imageRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
          <div className="hero-glow"></div>

          {/* Pulse waveform behind device */}
          <svg className="pulse-waveform" viewBox="0 0 400 100" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="rgba(0, 230, 230, 0.15)"
              strokeWidth="2"
              points="0,50 40,50 60,50 80,20 100,80 120,30 140,60 160,50 200,50 240,50 260,20 280,80 300,30 320,60 340,50 400,50"
            />
          </svg>
          
          {/* Integrated Orbit System */}
          <div className="orbit-system hero-orbit">
            <div className="central-hub">
              <img src={neckbandHero} alt="AuraVue Device" />
            </div>
            <div className="orbit-path">
              <div className="orbit-item">
                <img src={pulseIcon} alt="Pulse" />
              </div>
              <div className="orbit-item">
                <img src={fallIcon} alt="Fall Detection" />
              </div>
              <div className="orbit-item">
                <img src={sosIcon} alt="SOS" />
              </div>
              <div className="orbit-item">
                <img src={cameraIcon} alt="Emergency Camera" />
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-indicator">
          <span></span>
        </div>
      </section>

      {/* 🌊 Wave Divider */}
      <div className="wave-divider">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,80 C360,120 720,20 1080,80 C1260,110 1380,60 1440,80 L1440,120 L0,120 Z" fill="rgba(0,230,230,0.03)" />
          <path d="M0,90 C360,50 720,110 1080,70 C1260,50 1380,90 1440,70 L1440,120 L0,120 Z" fill="rgba(0,230,230,0.02)" />
        </svg>
      </div>

      {/* 💻 Tech Stack Badges */}
      <section className="tech-badges">
        <div className="tech-badges-track">
          <span className="tech-badge">🧠 Powered by AI</span>
          <span className="tech-dot">•</span>
          <span className="tech-badge">📡 IoT Connected</span>
          <span className="tech-dot">•</span>
          <span className="tech-badge">☁️ Cloud Synced</span>
          <span className="tech-dot">•</span>
          <span className="tech-badge">🔒 End-to-End Encrypted</span>
          <span className="tech-dot">•</span>
          <span className="tech-badge">📱 Cross-Platform</span>
        </div>
      </section>



      {/* ⚙️ Interactive Roadmap / How It Works */}
      <div className="reveal">
        <Roadmap />
      </div>

      {/* ❓ FAQ Section */}
      <section className="faq reveal">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-container">
          {[
            {
              q: "Who is AuraVue designed for?",
              a: "AuraVue is specifically designed for elderly individuals living independently, as well as family members, caregivers, and healthcare providers who want real-time visibility into their loved one's health and safety."
            },
            {
              q: "How does the AI fall detection & vital monitoring work?",
              a: "AuraVue continuously analyzes biometric pulse waveforms and 3-axis accelerometer motion patterns. Our onboard AI model detects falls and cardiac anomalies in under 3 seconds, triggering immediate automated notifications."
            },
            {
              q: "How is AuraVue different from a standard smartwatch?",
              a: "Unlike consumer smartwatches, AuraVue features automated emergency broadcasts without manual intervention, public paramedic emergency access links, multi-caregiver family circle synchronization, and continuous HRV telemetry."
            },
            {
              q: "Is it comfortable for daily wear and continuous monitoring?",
              a: "Yes! AuraVue is an ultra-lightweight, ergonomic neckband crafted from hypoallergenic medical silicone. It is designed for 24/7 comfortable wear with all-day battery life and non-intrusive monitoring."
            },
            {
              q: "What happens during an emergency SOS alert?",
              a: "When an anomaly or manual SOS is triggered, AuraVue instantly dispatches Twilio SMS notifications, pushes browser/mobile FCM alerts to caregivers, and generates a secure emergency access link with live GPS coordinates for first responders."
            }
          ].map((faq, index) => (
            <div
              className={`faq-item ${openFaq === index ? "open" : ""}`}
              key={index}
            >
              <div className="faq-question" onClick={() => toggleFaq(index)}>
                <h3>{faq.q}</h3>
                <span className="faq-toggle">{openFaq === index ? "−" : "+"}</span>
              </div>
              <div className="faq-answer">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 💙 About / CTA Section: Futuristic Obsidian Glass Showcase */}
      <section id="about" className="cta reveal">
        <div className="cta-glass-card">
          <div className="cta-glow-orb" />
          
          <div className="cta-badge-tag">
            <span className="cta-pulse-dot" /> Next-Gen AI Telemetry
          </div>

          <h2 className="cta-title">
            Protecting Lives with <span className="cta-cyan-text">Intelligent Care</span>
          </h2>
          
          <p className="cta-subtitle">
            AuraVue pairs real-time biometric telemetry with autonomous emergency protocols — ensuring elderly independence while giving caregivers continuous peace of mind.
          </p>

          <div className="cta-buttons-cluster">
            <button className="btn-primary cta-btn-glow" onClick={handleGetStarted}>
              Get Started with AuraVue →
            </button>
            <button
              className="btn-secondary cta-btn-glass"
              onClick={() => navigate('/role')}
            >
              Select Portal Role
            </button>
          </div>

          <div className="cta-trust-grid">
            <div className="trust-grid-card">
              <div className="trust-grid-icon">🔒</div>
              <div className="trust-grid-info">
                <h4>HIPAA Compliant</h4>
                <p>256-bit encrypted health data</p>
              </div>
            </div>

            <div className="trust-grid-card">
              <div className="trust-grid-icon">🏥</div>
              <div className="trust-grid-info">
                <h4>Medical Telemetry</h4>
                <p>Continuous HRV & fall sensors</p>
              </div>
            </div>

            <div className="trust-grid-card">
              <div className="trust-grid-icon">⚡</div>
              <div className="trust-grid-info">
                <h4>&lt;3s Alert Dispatch</h4>
                <p>Instant SMS & push routing</p>
              </div>
            </div>

            <div className="trust-grid-card">
              <div className="trust-grid-icon">🌍</div>
              <div className="trust-grid-info">
                <h4>Live GPS Geofence</h4>
                <p>Real-time location safety ring</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌌 Unique High-End Footer */}
      <footer className="auravue-unique-footer">
        <div className="footer-glow-divider" />

        <div className="footer-grid">
          {/* Brand & Mission */}
          <div className="footer-brand">
            <h3 className="footer-logo">
              Aura<span>Vue</span>
            </h3>
            <p>
              Next-generation AI health monitoring ecosystem ensuring elderly independence, real-time vital telemetry, and instant caregiver emergency response.
            </p>
          </div>

          {/* Column 1: Core Technology */}
          <div className="footer-col">
            <h4>Technology</h4>
            <a href="#features">AI Vital Monitor</a>
            <a href="#features">Fall Detection IMU</a>
            <a href="#how">Smart Neckband Telemetry</a>
            <a href="#problem">Cardiovascular Stability</a>
            <a href="#about">Family Circle Sync</a>
          </div>

          {/* Column 2: Quick Portals */}
          <div className="footer-col">
            <h4>Portals</h4>
            <Link to="/role">Select Portal Role</Link>
            <Link to="/login?role=caregiver">Caregiver Command Center</Link>
            <Link to="/login?role=patient">Patient Health Hub</Link>
            <Link to="/connect">Device Bluetooth Pairing</Link>
            <Link to="/register">Create Family Account</Link>
          </div>

          {/* Column 3: Emergency & Assistance Card */}
          <div className="footer-col footer-emergency-card">
            <h4>24/7 Care & Support</h4>
            <div className="footer-contact-box">
              <div className="contact-row">
                <span className="contact-icon">📞</span>
                <div>
                  <span className="contact-label">24/7 Care Helpline</span>
                  <a href="tel:+918610531594" className="contact-val">+91 86105 31594</a>
                </div>
              </div>
              <div className="contact-row">
                <span className="contact-icon">📧</span>
                <div>
                  <span className="contact-label">Emergency Desk</span>
                  <a href="mailto:support@auravue.health" className="contact-val">support@auravue.health</a>
                </div>
              </div>
              <div className="contact-row">
                <span className="contact-icon">🛡️</span>
                <div>
                  <span className="contact-label">Security Protocol</span>
                  <span className="contact-val" style={{ color: 'rgba(255,255,255,0.7)' }}>256-Bit Encrypted Data</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© 2026 AuraVue Health Inc. All Rights Reserved. Engineered for elderly safety & peace of mind.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/cookies">Cookie Policy</Link>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="back-to-top-btn"
              style={{
                background: 'none',
                border: 'none',
                color: '#00e6e6',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 600,
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;

