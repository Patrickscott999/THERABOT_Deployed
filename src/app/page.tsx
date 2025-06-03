'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import './home.css';
import { Orbitron } from 'next/font/google';  // Importing stylish font

const titleFont = Orbitron({ 
  subsets: ['latin'],
  weight: '700',
  display: 'swap',
});

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
      
      <div className="max-w-md w-full text-center z-10 p-8 glass-container animate-fadeIn motion-reduce:animate-none">
        <h1 className={`text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text animated-title ${titleFont.className}`}>
          Welcome to TheraBot
        </h1>
        <p className="text-lg mb-8 text-white text-shadow">
          Your emotionally intelligent AI companion for support, mentorship, and coping tools.
        </p>
        <div className="space-y-4">
          <Link href="/login" className="block py-2 px-4 glass-button font-medium rounded-md transition-all duration-300 shadow-md">
            Get Started
          </Link>
          <Link href="/about" className="glass-link hover:underline transition-all duration-300">
            Learn more about TheraBot
          </Link>
        </div>
      </div>
    </main>
  );
}
