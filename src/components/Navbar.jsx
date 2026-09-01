import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "../styles/Navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user] = useAuthState(auth);
    const [userRole, setUserRole] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [darkMode, setDarkMode] = useState(true);

    const handleGetStarted = () => { navigate("/role"); setMenuOpen(false); };

    useEffect(() => {
        const fetchRole = async () => {
            if (!user) {
                setUserRole(null);
                return;
            }
            try {
                // Check both collections for the user's role
                const cgSnap = await getDoc(doc(db, "caregivers", user.uid));
                if (cgSnap.exists()) {
                    setUserRole("caregiver");
                } else {
                    const pSnap = await getDoc(doc(db, "patients", user.uid));
                    if (pSnap.exists()) {
                        setUserRole("patient");
                    }
                }
            } catch (err) {
                console.error("Error fetching user role in Navbar:", err);
            }
        };
        fetchRole();
    }, [user]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        document.body.classList.toggle("light-mode", !darkMode);
        document.body.classList.toggle("dark-mode", darkMode);
    }, [darkMode]);

    const isHome = location.pathname === "/";
    const isDashboard = location.pathname.startsWith("/dashboard") ||
        location.pathname.startsWith("/patient-dashboard") ||
        location.pathname.startsWith("/settings") ||
        location.pathname.startsWith("/connect");
    const isAuth = location.pathname === "/login" || location.pathname === "/register";

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
        setMenuOpen(false);
    };

    return (
        <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
            <div className="navbar-left">
                {(!isHome && !isAuth) && (
                    <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
                        <span className="arrow">‹</span>
                    </button>
                )}
                <h2 className="logo" onClick={() => navigate("/")}>
                    Aura<span>Vue</span>
                </h2>
            </div>

            <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
                {isHome ? (
                    <>
                        <li><a href="#features" onClick={() => setMenuOpen(false)}>Features</a></li>
                        <li><a href="#problem" onClick={() => setMenuOpen(false)}>Why AuraVue</a></li>
                        <li><a href="#how" onClick={() => setMenuOpen(false)}>How It Works</a></li>
                        <li><a href="#about" onClick={() => setMenuOpen(false)}>About</a></li>
                    </>
                ) : isDashboard && user ? (
                    <>
                        <li>
                            <Link
                                to={userRole === "patient" ? "/patient-dashboard" : "/dashboard"}
                                className={(location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/patient-dashboard")) ? "nav-active" : ""}
                                onClick={() => setMenuOpen(false)}
                            >
                                📊 Dashboard
                            </Link>
                        </li>
                        {userRole === "caregiver" && (
                            <li>
                                <Link
                                    to="/insights"
                                    className={location.pathname === "/insights" ? "nav-active" : ""}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    📈 Insights
                                </Link>
                            </li>
                        )}
                        {userRole === "caregiver" && (
                            <li>
                                <Link
                                    to="/settings/profile"
                                    className={location.pathname.startsWith("/settings") ? "nav-active" : ""}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    ⚙️ Settings
                                </Link>
                            </li>
                        )}
                    </>
                ) : (
                    <li>
                        <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); setMenuOpen(false); }}>
                            Home
                        </a>
                    </li>
                )}
            </ul>

            <div className="navbar-right">
                {/* Show logout for authenticated dashboard users */}
                {isDashboard && user ? (
                    <button className="btn-nav-started" onClick={handleLogout}>
                        Sign Out
                    </button>
                ) : (
                    <button className="btn-nav-started" onClick={handleGetStarted}>
                        Get Started
                    </button>
                )}
                <button
                    className="theme-toggle"
                    onClick={() => setDarkMode(!darkMode)}
                    aria-label="Toggle theme"
                >
                    {darkMode ? "☀️" : "🌙"}
                </button>
                <div
                    className={`hamburger ${menuOpen ? "active" : ""}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
