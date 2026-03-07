import React from "react";
import "../styles/Legal.css";

const sections = [
    {
        title: "1. Information We Collect",
        content: `We collect information you provide directly to us when you create an account, 
    register a device, or contact us for support. This may include name, email address, 
    phone number, and health-related data captured by the AuraVue device (pulse readings, 
    fall events, GPS location during emergencies).`,
    },
    {
        title: "2. How We Use Your Information",
        content: `We use the information we collect to operate and improve AuraVue services, 
    send emergency alerts to registered caregivers, provide real-time health monitoring, 
    respond to support requests, and comply with legal obligations. We do not sell your 
    personal or health data to third parties.`,
    },
    {
        title: "3. Health Data & HIPAA",
        content: `AuraVue takes the privacy of health data extremely seriously. All health-related 
    data is encrypted in transit (TLS 1.3) and at rest (AES-256). We follow HIPAA guidelines 
    for the handling and storage of protected health information (PHI). Data is only shared 
    with caregivers and emergency services as authorised by the account holder.`,
    },
    {
        title: "4. Data Sharing",
        content: `We do not share personal information with third parties except: (a) with your 
    explicit consent; (b) to provide emergency response services; (c) to comply with applicable 
    laws, regulations, or legal process; or (d) to protect the rights, property, or safety 
    of AuraVue or others.`,
    },
    {
        title: "5. Data Retention",
        content: `We retain your data for as long as your account is active or as needed to provide 
    services. Health monitoring logs are retained for 12 months by default. You may request 
    deletion of your data at any time by contacting support@auravue.health.`,
    },
    {
        title: "6. Your Rights",
        content: `You have the right to access, correct, or delete your personal information. 
    You may also request data portability or restrict certain processing activities. 
    To exercise these rights, contact us at support@auravue.health.`,
    },
    {
        title: "7. Security",
        content: `We implement industry-standard security measures including end-to-end encryption, 
    secure cloud infrastructure, and regular security audits to protect your data from 
    unauthorized access, alteration, or disclosure.`,
    },
    {
        title: "8. Changes to This Policy",
        content: `We may update this Privacy Policy from time to time. We will notify you of 
    significant changes via email or an in-app notification. Your continued use of AuraVue 
    after any changes constitutes acceptance of the updated policy.`,
    },
    {
        title: "9. Contact Us",
        content: `If you have any questions about this Privacy Policy, please contact us at: 
    📧 support@auravue.health | 📍 India`,
    },
];

export default function PrivacyPolicy() {
    return (
        <div className="legal-page">
            <div className="legal-container">
                <div className="legal-header">
                    <span className="legal-badge">Legal</span>
                    <h1>Privacy Policy</h1>
                    <p className="legal-effective">Effective Date: March 1, 2026</p>
                    <p className="legal-intro">
                        At AuraVue, your privacy is our priority. This Privacy Policy explains how we collect,
                        use, and protect the information you share with us when using our products and services.
                    </p>
                </div>
                <div className="legal-body">
                    {sections.map((section, i) => (
                        <div className="legal-section" key={i}>
                            <h2>{section.title}</h2>
                            <p>{section.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
