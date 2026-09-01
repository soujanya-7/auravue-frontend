import React, { useRef, useEffect, useState } from "react";
import "../styles/Roadmap.css";
import sosIcon from "../assets/sos.png";
import pulseIcon from "../assets/pulse.png";
import fallIcon from "../assets/fall.png";
import cameraIcon from "../assets/camera.png";

const steps = [
  {
    step: "01",
    icon: sosIcon,
    title: "Wear & Connect",
    desc: "Seamlessly pairs the smart neckband monitor with the caregiver cloud hub."
  },
  {
    step: "02",
    icon: pulseIcon,
    title: "Continuous AI Tracking",
    desc: "100Hz real-time telemetry streams heart rate, HRV, body temp, and SpO2."
  },
  {
    step: "03",
    icon: fallIcon,
    title: "Instant Anomaly Detection",
    desc: "6-axis IMU and edge AI models detect falls and cardiac irregularities in <3s."
  },
  {
    step: "04",
    icon: cameraIcon,
    title: "Caregiver Emergency Dispatch",
    desc: "Automated SOS triggers SMS, GPS location broadcast, and voice channel."
  },
];

const Roadmap = () => {
  const roadmapRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = roadmapRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.2 }
    );

    if (node) observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, []);

  return (
    <section className="roadmap-section" ref={roadmapRef} id="how">
      <div className="roadmap-header">
        <h2 className="roadmap-heading">How AuraVue Works</h2>
        <p className="roadmap-subtitle">
          From wearable edge sensors to emergency response in four intelligent steps.
        </p>
      </div>

      <div className={`roadmap-grid ${inView ? "in-view" : ""}`}>
        {steps.map((step, index) => (
          <div key={index} className="roadmap-card-v2">
            <div className="roadmap-step-badge">{step.step}</div>
            <div className="roadmap-icon-wrapper">
              <img src={step.icon} alt={step.title} className="roadmap-icon-img" />
            </div>
            <h3 className="roadmap-card-title">{step.title}</h3>
            <p className="roadmap-card-desc">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Roadmap;
