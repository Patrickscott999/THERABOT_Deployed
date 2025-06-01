'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';

export default function Home() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    // Initialize VANTA effect when component mounts
    if (!vantaEffect && vantaRef.current && typeof window !== 'undefined' && window.VANTA) {
      setVantaEffect(
        window.VANTA.HALO({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          backgroundColor: 0x0d1025,
          amplitudeFactor: 1.50,
          size: 1.50
        })
      );
    }

    // Clean up VANTA effect when component unmounts
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <main ref={vantaRef} className="flex min-h-screen flex-col items-center justify-center p-6 relative">
      {/* Add Scripts for VANTA.js */}
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js" strategy="beforeInteractive" />
      <Script 
        src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.halo.min.js" 
        strategy="afterInteractive"
        onLoad={() => {
          // This will be called after the script has loaded
          if (vantaRef.current && typeof window !== 'undefined' && window.VANTA && !vantaEffect) {
            setVantaEffect(
              window.VANTA.HALO({
                el: vantaRef.current,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
                backgroundColor: 0x0d1025,
                amplitudeFactor: 1.50,
                size: 1.50
              })
            );
          }
        }}
      />
      
      <div className="max-w-md w-full text-center z-10 p-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
          Welcome to TheraBot
        </h1>
        <p className="text-lg mb-8">
          Your emotionally intelligent AI companion for support, mentorship, and coping tools.
        </p>
        <div className="space-y-4">
          <Link href="/login" className="block py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-md hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-md">
            Get Started
          </Link>
          <Link href="/about" className="text-blue-500 hover:text-purple-600 hover:underline transition-all duration-300">
            Learn more about TheraBot
          </Link>
        </div>
      </div>
    </main>
  );
}
