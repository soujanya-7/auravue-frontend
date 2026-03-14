import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import SEO from "../components/SEO";
import "../styles/Home.css";
import useCountUp from "../hooks/useCountUp";

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
          <div className="trust-badge-row">
            <span className="live-pill"><span className="live-dot"></span> 24/7 Monitoring</span>
            <span className="trust-pill">HIPAA Compliant</span>
          </div>
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
            <p className="hero-micro-copy">No credit card required • Setup in 5 minutes</p>
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
          <div className="hero-device-container">
            <img src={neckbandHero} alt="AuraVue Smart Neckband" className="hero-main-img" />
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

      {/* 🌌 Visual Hub Section (Redesigned Header + Features) */}
      <section className="hub-section reveal">
        <div className="hub-content">
          <h2>Intelligent Detection.<br /><span>Instant Response.</span></h2>
          <p className="subtitle">
            AuraVue's integrated sensors work in perfect harmony to detect vital anomalies and falls, providing a secure safety net for your loved ones.
          </p>

          <div className="stats-grid-minimal">
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
          </div>
        </div>

        <div className="hub-visual">
          <div className="orbit-system">
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
      </section>

      {/* ⚙️ How It Works Section */}
      <section id="how" className="how-it-works reveal">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3>Wear</h3>
            <p>The elderly wears the lightweight AuraVue neckband — comfortable enough for 24/7 use with all-day battery life.</p>
          </div>
          <div className="step-card">
            <div className="step-number">02</div>
            <h3>Monitor</h3>
            <p>AI continuously analyzes pulse patterns, movement data, and environmental context to build a health baseline.</p>
          </div>
          <div className="step-card">
            <div className="step-number">03</div>
            <h3>Detect</h3>
            <p>Abnormal readings trigger instant alerts — the camera activates and GPS location is sent to registered caregivers.</p>
          </div>
          <div className="step-card">
            <div className="step-number">04</div>
            <h3>Respond</h3>
            <p>Caregivers receive real-time dashboards with vitals, location, and camera feed. All data is logged securely for medical review.</p>
          </div>
        </div>
      </section>

      {/* ❓ FAQ Section */}
      <section className="faq reveal">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-container">
          {[
            {
              q: "Who is AuraVue designed for?",
              a: "AuraVue is specifically designed for elderly individuals living independently, and their family members or caregivers who want real-time visibility into their loved one's health and safety."
            },
            {
              q: "How is AuraVue different from a smartwatch?",
              a: "Unlike fitness-focused smartwatches, AuraVue uses AI-powered prediction to detect cardiac anomalies before they happen, includes automated SOS with no manual input, and provides a real-time caregiver dashboard — features no consumer smartwatch offers."
            },
            {
              q: "Is it comfortable for daily wear?",
              a: "Yes! AuraVue is a lightweight neckband designed for 24/7 comfort with medical-grade sensors positioned at the neck for the most accurate pulse readings."
            },
            {
              q: "How quickly are emergency alerts sent?",
              a: "Emergency SOS alerts are triggered within 3 seconds of detecting an anomaly, including precise GPS coordinates and camera activation for emergency responders."
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

      {/* 💙 About / CTA Section */}
      <section id="about" className="cta reveal">
        <h2>Protecting Lives with<br />Intelligent Technology</h2>
        <p>
          AuraVue combines AI-powered health monitoring with compassionate care,
          ensuring elderly individuals are safe, connected, and supervised at all times —
          reducing mortality and improving quality of life for millions worldwide.
        </p>
        <button className="btn-primary" onClick={handleGetStarted}>
          Start Monitoring Today
        </button>
        <div className="trust-badges">
          <div className="trust-badge">
            <span className="trust-icon">🔒</span>
            <span>HIPAA Compliant</span>
          </div>
          <div className="trust-badge">
            <span className="trust-icon">🏥</span>
            <span>Medical-Grade Sensors</span>
          </div>
          <div className="trust-badge">
            <span className="trust-icon">⚡</span>
            <span>Real-Time Alerts</span>
          </div>
          <div className="trust-badge">
            <span className="trust-icon">🌍</span>
            <span>GPS Tracking</span>
          </div>
        </div>
      </section>

      {/* 🖤 Footer */}
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>AuraVue</h3>
            <p>AI-powered health monitoring system designed to protect elderly individuals living independently, ensuring safety through intelligent prediction and real-time caregiver connectivity.</p>

          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <a href="#features">Key Features</a>
            <a href="#how">How It Works</a>
            <a href="#problem">Why AuraVue</a>
            <a href="#about">About Us</a>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <a href="#">Documentation</a>
            <a href="#">API Reference</a>
            <a href="#">Caregiver Guide</a>
            <a href="#">Release Notes</a>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <p className="footer-contact-item">📧 support@auravue.health</p>
            <p className="footer-contact-item">📞 +91 86105 31594</p>
            <p className="footer-contact-item">📍 India</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 AuraVue. All Rights Reserved. Built with ❤️ for elderly safety.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
