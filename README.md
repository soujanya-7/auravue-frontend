# 🌌 AuraVue — AI-Powered Elderly Health Monitoring

AuraVue is an intelligent, high-end health monitoring platform designed to provide safety and independence for elderly individuals living alone. By combining IoT sensor data with advanced AI prediction models, AuraVue detects vital anomalies and falls in real-time, ensuring immediate caregiver response.

[![Production Status](https://img.shields.io/badge/Status-Production--Ready-brightgreen)](https://github.com/soujanya-7/auravue-frontend)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Key Features

- **🧠 AI Vital Monitoring**: Continuous analysis of pulse and heart rate variability (HRV) to predict potential health crises before they occur.
- **🚨 Instant SOS System**: A high-priority alert system that triggers automated notifications to caregivers, including GPS location and live camera feeds.
- **🛡️ Fall Detection**: Leverages accelerometer data and AI to identify falls with high precision and low latency (<3s).
- **💊 Medication Management**: Cloud-synced reminder system ensuring strict adherence to medical schedules.
- **👨‍👩‍👧‍👦 Family Circle**: Multi-caregiver access allows an entire family to stay connected and informed about their loved one's status.
- **📈 Health Insights**: Comprehensive weekly analytics and trend reports for medical review and long-term health tracking.
- **🔐 Privacy First**: End-to-end encryption and HIPAA-compliant data handling practices.

---

## 🛠️ Technology Stack

- **Frontend**: React.js with a modern Glassmorphic UI/UX.
- **State Management**: React Hooks & Context API.
- **Backend/Database**: Firebase (Firestore, Authentication, Cloud Messaging).
- **Visualizations**: Chart.js for health analytics.
- **Maps**: React-Leaflet for real-time GPS tracking.
- **Icons**: React Icons (Fa, Md, Io).

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A Firebase project configured.

### Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/soujanya-7/auravue-frontend.git
    cd auravue-frontend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env` file in the root directory and add your Firebase configuration:
    ```env
    REACT_APP_FIREBASE_API_KEY=your_api_key
    REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
    REACT_APP_FIREBASE_PROJECT_ID=your_project_id
    ... (add other Firebase keys)
    ```

4.  **Run Locally**:
    ```bash
    npm start
    ```

---

## 📦 Production Deployment

To create a production-optimized build:

```bash
npm run build
```

This will generate a `build/` folder ready for hosting on Firebase Hosting, Vercel, or Netlify.

---

## 👥 Contributors

- **Soujanya S** — Project Lead & Developer

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Built with ❤️ for elderly safety.
