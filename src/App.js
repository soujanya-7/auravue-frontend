import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Shared Components (always loaded - small)
import Navbar from "./components/Navbar";
import PrivateRoute from "./pages/PrivateRoute";

// Lazy-loaded pages for performance
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PatientDashboard = lazy(() => import("./pages/PatientDashboard"));
const PatientConnect = lazy(() => import("./pages/PatientConnect"));
const RoleSelection = lazy(() => import("./pages/RoleSelection"));
const Insights = lazy(() => import("./pages/Insights"));

// Settings (lazy)
const Settings = lazy(() => import("./pages/Settings/index"));
const Profile = lazy(() => import("./pages/Settings/Profile"));
const Notifications = lazy(() => import("./pages/Settings/Notifications"));
const Reminders = lazy(() => import("./pages/Settings/Reminders"));
const Security = lazy(() => import("./pages/Settings/Security"));
const Family = lazy(() => import("./pages/Settings/Family"));
const EmergencyLink = lazy(() => import("./pages/EmergencyLink"));
const EmergencySettings = lazy(() => import("./pages/Settings/Emergency"));

// Legal (lazy)
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));

// Minimal loading fallback
const LoadingSpinner = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', background: '#050a0f'
  }}>
    <div style={{
      width: '48px', height: '48px', border: '3px solid rgba(0, 230, 230, 0.2)',
      borderTopColor: '#00e6e6', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  return (
    <Router>
      <Navbar />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Home />} />

          {/* Public Routes */}
          <Route path="/role" element={<RoleSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/emergency/:patientId" element={<EmergencyLink />} />

          {/* Legal Pages */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/cookies" element={<CookiePolicy />} />

          {/* Caregiver Dashboard */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute expectedRole="caregiver">
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <PrivateRoute expectedRole="caregiver">
                <Insights />
              </PrivateRoute>
            }
          />

          {/* Settings */}
          <Route
            path="/settings"
            element={
              <PrivateRoute expectedRole="caregiver">
                <Settings />
              </PrivateRoute>
            }
          >
            <Route path="profile" element={<Profile />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="reminders" element={<Reminders />} />
            <Route path="security" element={<Security />} />
            <Route path="family" element={<Family />} />
            <Route path="emergency" element={<EmergencySettings />} />
          </Route>

          {/* Patient Dashboard */}
          <Route
            path="/patient-dashboard"
            element={
              <PrivateRoute expectedRole="patient">
                <PatientDashboard />
              </PrivateRoute>
            }
          />

          {/* Patient Connect */}
          <Route
            path="/connect"
            element={
              <PrivateRoute expectedRole="patient">
                <PatientConnect />
              </PrivateRoute>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
