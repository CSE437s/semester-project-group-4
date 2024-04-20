import React, { useEffect, useRef } from 'react';

const HaloComponent = () => {
  const vantaRef = useRef(null);

  useEffect(() => {
    const threeScript = document.createElement('script');
    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
    threeScript.async = true;
    threeScript.onload = () => {
      const vantaScript = document.createElement('script');
      vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.halo.min.js';
      vantaScript.async = true;
      vantaScript.onload = () => {
        vantaRef.current = window.VANTA.HALO({
          el: "#vanta-background",
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200
        });
      };
      document.body.appendChild(vantaScript);
    };
    document.body.appendChild(threeScript);

    return () => {
      if (vantaRef.current) {
        vantaRef.current.destroy();
      }
    };
  }, []);

  return (
    <div id="vanta-background" style={{ width: '100%', height: '100vh' }} />
  );
};

export default HaloComponent;
