import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url, type = "website" }) => {
    const siteTitle = "AuraVue — AI-Powered Elderly Care";
    const fullTitle = title ? `${title} | AuraVue` : siteTitle;
    const siteDescription = "Intelligent health monitoring for elderly individuals. Pulse tracking, fall detection, and automated SOS alerts.";
    const siteKeywords = "elderly care, health monitoring, AI healthcare, fall detection, smart wearable, caregiver dashboard";
    const siteImage = "https://auravue-c8b99.web.app/og-image.png"; // Future: use absolute path
    const siteUrl = "https://auravue-c8b99.web.app/";

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{fullTitle}</title>
            <meta name='description' content={description || siteDescription} />
            <meta name='keywords' content={keywords || siteKeywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || siteDescription} />
            <meta property="og:image" content={image || siteImage} />
            <meta property="og:url" content={url || siteUrl} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description || siteDescription} />
            <meta name="twitter:image" content={image || siteImage} />

            {/* Canonical Link */}
            <link rel="canonical" href={url || siteUrl} />
        </Helmet>
    );
};

export default SEO;
