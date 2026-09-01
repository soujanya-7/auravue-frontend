import React from "react";
import "../styles/Legal.css";

const sections = [
    {
        title: "1. What Are Cookies?",
        content: `Cookies are small text files placed on your device by a website when you visit it. 
    They are widely used to make websites work, improve efficiency, and provide information to 
    the owners of the site.`,
    },
    {
        title: "2. How AuraVue Uses Cookies",
        content: `AuraVue uses cookies and similar tracking technologies to: keep you signed in 
    to your account, remember your preferences (e.g., dark/light mode), understand how you 
    use our platform so we can improve it, and ensure the security of your session.`,
    },
    {
        title: "3. Types of Cookies We Use",
        content: `Essential Cookies: Required for the platform to function. These cannot be disabled. 
    Examples include session authentication tokens and security cookies. 
    Preference Cookies: Remember your settings such as theme preference. 
    Analytics Cookies: Help us understand how visitors interact with our platform using aggregated, 
    anonymised data. We use this to improve performance and user experience.`,
    },
    {
        title: "4. Third-Party Cookies",
        content: `We may use third-party services (such as Firebase Analytics) that set their own 
    cookies. These third parties have their own privacy policies and we do not control their 
    cookie practices.`,
    },
    {
        title: "5. Managing Cookies",
        content: `You can control and/or delete cookies through your browser settings. You can delete 
    all cookies that are already on your device and you can set most browsers to prevent them from 
    being placed. However, if you do this, some features of AuraVue may not function correctly.`,
    },
    {
        title: "6. Changes to This Policy",
        content: `We may update this Cookie Policy periodically. We encourage you to review this page 
    regularly to stay informed about our use of cookies.`,
    },
    {
        title: "7. Contact Us",
        content: `If you have questions about our use of cookies, please contact us at: 
    📧 support@auravue.health`,
    },
];

export default function CookiePolicy() {
    return (
        <div className="legal-page">
            <div className="legal-container">
                <div className="legal-header">
                    <span className="legal-badge">Legal</span>
                    <h1>Cookie Policy</h1>
                    <p className="legal-effective">Effective Date: March 1, 2026</p>
                    <p className="legal-intro">
                        This Cookie Policy explains how AuraVue uses cookies and similar technologies when
                        you visit our platform and use our services.
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
