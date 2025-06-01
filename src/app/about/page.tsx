'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';

export default function About() {
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
    <div ref={vantaRef} className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
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
      
      <div className="max-w-3xl mx-auto z-10 relative">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">About TheraBot</h1>
          <p className="text-xl text-white">Your Emotionally Intelligent AI Companion</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-lg p-8 mb-8 transition-all duration-300 hover:shadow-2xl">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">What is TheraBot?</h2>
          <p className="text-gray-700 mb-4">
            TheraBot is an AI-powered chatbot designed to provide emotional support, mentorship advice, 
            and coping tools through emotionally intelligent conversations.
          </p>
          <p className="text-gray-700 mb-4">
            Using advanced natural language processing, TheraBot can recognize emotions in your messages 
            and respond with empathy, understanding, and helpful guidance.
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-lg p-8 mb-8 transition-all duration-300 hover:shadow-2xl">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">Core Features</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Emotional check-ins for daily support</li>
            <li>Personalized chatbot identity using your name</li>
            <li>Mentorship advice on demand</li>
            <li>Coping tools including affirmations, breathing exercises, and reflection prompts</li>
            <li>Private and secure conversations</li>
          </ul>
        </div>

        <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-lg p-8 mb-8 transition-all duration-300 hover:shadow-2xl">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">Emotional Intelligence</h2>
          <p className="text-gray-700 mb-4">
            TheraBot is built on principles of emotional intelligence, meaning it can:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Recognize and validate your emotions</li>
            <li>Respond with appropriate empathy and understanding</li>
            <li>Offer guidance without judgment</li>
            <li>Provide personalized support based on your needs</li>
          </ul>
        </div>

        <div className="text-center">
          <Link href="/login" className="inline-block py-2 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-md hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-md">
            Get Started with TheraBot
          </Link>
          <p className="mt-6 text-sm text-white/80 bg-black/20 backdrop-blur-sm p-4 rounded-lg max-w-xl mx-auto">
            <span className="font-semibold">Important:</span> TheraBot is not a replacement for professional mental health services.
            If you're experiencing a crisis, please seek help from a qualified professional.
          </p>
        </div>
      </div>
    </div>
  );
}
