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
          minHeight: 30,
          minWidth: 30,
          color: 0x0000ff, // Change the color to a less intense value
          // backgroundColor: 0x000000, // Change the background color to a less intense value
          amplitudeFactor: 0.9, // Reduce the amplitude factor to make the effect less pronounced
          speed: 0.5 // Reduce the speed to make the effect less dynamic
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
