import React from "react";
import "../styles/Legal.css";

const sections = [
    {
        title: "1. Acceptance of Terms",
        content: `By accessing or using AuraVue products and services, you agree to be bound by these 
    Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not 
    use our services.`,
    },
    {
        title: "2. Description of Service",
        content: `AuraVue provides an AI-powered health monitoring platform comprising a wearable 
    neckband device and companion software application. The service includes real-time pulse 
    monitoring, fall detection, emergency SOS alerts, and caregiver dashboards.`,
    },
    {
        title: "3. Medical Disclaimer",
        content: `AuraVue is a health monitoring tool and is NOT a medical device for diagnosis or 
    treatment. The information provided by AuraVue should not be used as a substitute for 
    professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified 
    healthcare provider with any questions you may have regarding a medical condition.`,
    },
    {
        title: "4. Account Responsibilities",
        content: `You are responsible for maintaining the confidentiality of your account credentials 
    and for all activities that occur under your account. You agree to notify us immediately of 
    any unauthorized use of your account at support@auravue.health.`,
    },
    {
        title: "5. Emergency Services",
        content: `While AuraVue provides automated SOS alerts, these are supplemental to — not a 
    replacement for — standard emergency services. AuraVue cannot guarantee alert delivery in 
    all circumstances (e.g., no network coverage). Users should always have a plan to contact 
    emergency services directly.`,
    },
    {
        title: "6. Prohibited Uses",
        content: `You agree not to misuse AuraVue services. Prohibited activities include: attempting 
    to reverse-engineer the device or software, using the service for unlawful purposes, transmitting 
    false emergency alerts, or interfering with other users' access to the service.`,
    },
    {
        title: "7. Limitation of Liability",
        content: `To the maximum extent permitted by law, AuraVue shall not be liable for any indirect, 
    incidental, special, or consequential damages arising from your use of the service, including 
    unsuccessful emergency alert delivery or data loss.`,
    },
    {
        title: "8. Modifications",
        content: `We reserve the right to modify these Terms at any time. We will provide notice of 
    material changes through the app or by email. Continued use after changes constitutes acceptance 
    of the revised Terms.`,
    },
    {
        title: "9. Governing Law",
        content: `These Terms are governed by and construed in accordance with the laws of India. 
    Any disputes shall be resolved in the courts of India.`,
    },
    {
        title: "10. Contact",
        content: `For any questions regarding these Terms, please contact us at: 
    📧 support@auravue.health`,
    },
];

export default function TermsOfService() {
    return (
        <div className="legal-page">
            <div className="legal-container">
                <div className="legal-header">
                    <span className="legal-badge">Legal</span>
                    <h1>Terms of Service</h1>
                    <p className="legal-effective">Effective Date: March 1, 2026</p>
                    <p className="legal-intro">
                        Please read these Terms of Service carefully before using AuraVue products and services.
                        These terms govern your use of our platform, device, and associated software.
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
