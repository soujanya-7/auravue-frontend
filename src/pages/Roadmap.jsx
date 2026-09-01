import React, { useRef, useEffect, useState } from "react";
import "../styles/Roadmap.css";
import sosIcon from "../assets/sos.png";
import pulseIcon from "../assets/pulse.png";
import fallIcon from "../assets/fall.png";
import cameraIcon from "../assets/camera.png";

const steps = [
  { icon: sosIcon, title: "Connect Device", desc: "Pairs seamlessly with the AuraVue app." },
  { icon: pulseIcon, title: "Monitor Health", desc: "Vitals are continuously monitored." },
  { icon: fallIcon, title: "Trigger Alerts", desc: "Alerts are triggered for abnormalities." },
  { icon: cameraIcon, title: "Emergency Response", desc: "Caregivers notified immediately." },
];

const Roadmap = () => {
  const roadmapRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.3 } // trigger when 30% visible
    );

    if (roadmapRef.current) observer.observe(roadmapRef.current);

    return () => {
      if (roadmapRef.current) observer.unobserve(roadmapRef.current);
    };
  }, []);

  return (
    <section className="roadmap-section" ref={roadmapRef}>
      <h2 className="roadmap-heading">How We Work</h2>
      <div className="roadmap-wrapper">
        <svg
          className={`road-svg ${inView ? "animate-road" : ""}`}
          viewBox="0 0 1200 200"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d="M0 100 C200 0, 400 200, 600 100 C800 0, 1000 200, 1200 100"
            fill="transparent"
            stroke="#4f7f62"
            strokeWidth="12"
            strokeLinecap="round"
          />
        </svg>

        {steps.map((step, index) => {
          const percentages = [0.05, 0.35, 0.65, 0.95];
          const yOffsets = [40, 160, 40, 160];
          return (
            <div
              key={index}
              className="roadmap-step"
              style={{
                left: `${percentages[index] * 100}%`,
                top: `${yOffsets[index]}px`,
              }}
            >
              <div className="step-circle">
                <img src={step.icon} alt={step.title} />
              </div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
              <div className={`connector-line ${index % 2 === 0 ? "up" : "down"}`}></div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Roadmap;
