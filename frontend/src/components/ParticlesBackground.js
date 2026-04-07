import React, { useEffect, useRef } from 'react';

const ParticlesBackground = () => {
  const particlesRef = useRef(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    // Create 50 particles
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';

      // Random properties
      const size = Math.random() * 5 + 2;
      const left = Math.random() * 100;
      const delay = Math.random() * 20;
      const duration = Math.random() * 10 + 15;

      // Random colors from our palette (brighter for light theme)
      const colors = [
        'rgba(99, 102, 241, 0.4)',
        'rgba(168, 85, 247, 0.4)',
        'rgba(6, 182, 212, 0.4)',
        'rgba(236, 72, 153, 0.4)',
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];

      particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        background: ${color};
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
      `;

      container.appendChild(particle);
    }

    // Cleanup
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return <div className="particles" ref={particlesRef} />;
};

export default ParticlesBackground;
