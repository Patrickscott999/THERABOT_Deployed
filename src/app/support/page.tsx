'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function SupportPage() {
  const router = useRouter();
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
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };
  
  const coffeeIconVariants = {
    hover: { 
      rotate: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.6 }
    }
  };
  
  return (
    <>
      {/* Add Scripts for VANTA.js */}
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js" strategy="beforeInteractive" />
      <Script 
        src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.halo.min.js" 
        strategy="afterInteractive"
        onLoad={() => {
          // Re-initialize vanta if needed
          if (!vantaEffect && vantaRef.current && window.VANTA) {
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
      <div ref={vantaRef} className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Background overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/30 to-slate-900/60 z-0"></div>
      {/* Header */}
      <motion.header 
        className="bg-transparent backdrop-blur-md bg-white/70 sticky top-0 z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/chat" className="flex items-center space-x-3 group">
            <motion.div 
              className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              T
            </motion.div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TheraBot</span>
          </Link>

          <motion.button 
            onClick={() => router.push('/chat')}
            className="px-5 py-2 rounded-full border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 shadow-sm"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Chat
          </motion.button>
        </div>
      </motion.header>
      
      {/* Main Content */}
      <motion.main className="flex-grow p-6 md:p-12 relative z-10">
        <motion.div className="p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-md mb-8 hover:shadow-lg transition-shadow"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="relative overflow-hidden">
            {/* Decorative background gradient */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-t-2xl" />

            {/* Avatar bubble - similar to chat message design */}
            <motion.div 
              className="absolute top-6 left-6 w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <span>T</span>
            </motion.div>
            
            <div className="p-8 pt-24 md:p-12 md:pt-24">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                  Support TheraBot
                </h1>
                
                <motion.p 
                  className="text-lg leading-relaxed text-gray-700"
                  variants={itemVariants}
                >
                  TheraBot was created with a deep belief that everyone deserves access to emotional support and empowerment, 
                  whenever they need it. Your journey toward emotional well-being matters deeply to us.
                </motion.p>
                
                <motion.div 
                  className="bg-blue-50/90 backdrop-blur-sm border-l-4 border-blue-500 p-6 rounded-r-lg mb-8"
                  variants={itemVariants}
                >
                  <div className="flex-shrink-0 text-blue-500 text-xl">💙</div>
                  <p className="italic text-blue-800">
                    "Every step you take toward emotional wellness deserves to be supported, and your courage in this journey inspires us every day."
                  </p>
                </motion.div>
                
                <motion.p 
                  className="text-lg leading-relaxed text-gray-700"
                  variants={itemVariants}
                >
                  Every cup of coffee you buy helps us continue developing this companion that listens without judgment, 
                  responds with authentic care, and believes in your potential even when you're struggling to see it yourself. 
                  Your support nurtures this space where vulnerability becomes strength and where every conversation is a step toward healing.
                </motion.p>
                
                <motion.div 
                  className="my-12 flex justify-center"
                  variants={itemVariants}
                >
                  <motion.a 
                    href="https://coff.ee/PatrickScott" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block px-8 py-5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium text-lg shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.4)"
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div 
                      className="flex items-center gap-3"
                      variants={coffeeIconVariants}
                      whileHover="hover"
                    >
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 8H19C20.0609 8 21.0783 8.42143 21.8284 9.17157C22.5786 9.92172 23 10.9391 23 12C23 13.0609 22.5786 14.0783 21.8284 14.8284C21.0783 15.5786 20.0609 16 19 16H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 8H18V17C18 18.0609 17.5786 19.0783 16.8284 19.8284C16.0783 20.5786 15.0609 21 14 21H6C4.93913 21 3.92172 20.5786 3.17157 19.8284C2.42143 19.0783 2 18.0609 2 17V8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 1V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 1V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 1V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Buy Me a Coffee
                    </motion.div>
                  </motion.a>
                </motion.div>
                
                <motion.h2 
                  className="text-2xl font-semibold mt-10 mb-4 text-gray-800"
                  variants={itemVariants}
                >
                  What Your Support Makes Possible
                </motion.h2>
                
                <motion.ul 
                  className="space-y-4 my-6"
                  variants={containerVariants}
                >
                  {[
                    "Continued development of TheraBot's empathetic intelligence",
                    "Creation of new features to better support emotional wellbeing",
                    "Keeping the core experience accessible to everyone who needs it"
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-start gap-4 p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-sm border border-gray-100"
                      variants={itemVariants}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </motion.li>
                  ))}
                </motion.ul>
                
                <motion.p 
                  className="mt-12 text-xl font-medium text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  variants={itemVariants}
                >
                  Thank you for being part of this journey.
                </motion.p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.main>
      
      {/* Footer */}
      <motion.footer className="bg-slate-100/80 backdrop-blur-sm p-6 text-center text-gray-600 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} TheraBot. All rights reserved.</p>
          <p className="mt-2 text-blue-500 text-sm font-medium">A compassionate AI companion for your emotional wellbeing journey.</p>
        </div>
      </motion.footer>
    </div>
    </>
  );
}
