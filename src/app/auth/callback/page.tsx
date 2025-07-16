'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { handleAuthCallback, getUserProfile } from '@/lib/supabase/auth-helpers';
import Script from 'next/script';
import { Orbitron, Inter } from 'next/font/google';
import { motion } from 'framer-motion';

const titleFont = Orbitron({
  subsets: ['latin'],
  weight: '700',
  display: 'swap',
});

const bodyFont = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

export default function AuthCallbackPage() {
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [userName, setUserName] = useState<string>('');
  const [error, setError] = useState<string>('');

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

  useEffect(() => {
    // Try to handle the auth callback using our helper function
    const processAuthCallback = async () => {
      try {
        // Use the helper to handle the auth callback
        const { session, error } = await handleAuthCallback(window.location.href);
        
        if (error) {
          console.error('Error logging in:', error);
          setError(error.message);
          setVerificationStatus('error');
          return;
        }
        
        if (!session) {
          setError('Could not retrieve session');
          setVerificationStatus('error');
          return;
        }
        
        
        // Get user info
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // For Google OAuth users, we can use their name from the Google profile if available
          let displayName = '';
          
          // Check if we have user metadata with a name (common with OAuth providers)
          if (user.user_metadata && user.user_metadata.full_name) {
            displayName = user.user_metadata.full_name;
          } else if (user.user_metadata && user.user_metadata.name) {
            displayName = user.user_metadata.name;
          } 
          
          // If no name in metadata, try the user profile
          if (!displayName) {
            // Get user profile from our helper function (handles missing table)
            const profile = await getUserProfile(user.id);
            if (profile?.display_name) {
              displayName = profile.display_name;
            }
          }
          
          // Fallback to email if no name found
          if (!displayName && user.email) {
            displayName = user.email.split('@')[0];
          }
          
          // Final fallback
          if (!displayName) {
            displayName = 'there';
          }
          
          setUserName(displayName);
          
          setVerificationStatus('success');
          
          // Redirect after showing welcome message
          setTimeout(() => {
            // Always use router.push for better Next.js navigation
            router.push('/chat');
          }, 3000); // Reduced timeout for better UX
        }
      } catch (err) {
        console.error('Error during verification:', err);
        setError('Failed to verify your email. Please try again.');
        setVerificationStatus('error');
      }
    };

    processAuthCallback();
  }, [router]);

  return (
    <div ref={vantaRef} className={`flex min-h-screen flex-col items-center justify-center p-6 ${bodyFont.className}`}>
      {/* Add Scripts for VANTA.js */}
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js" strategy="beforeInteractive" />
      <Script 
        src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.halo.min.js" 
        strategy="afterInteractive" 
      />
      
      <div className="relative z-10 w-full max-w-lg p-8 glass-container backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-2xl">
        {verificationStatus === 'verifying' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className={`text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-400 ${titleFont.className}`}>
              Verifying your email
            </h1>
            <div className="flex justify-center my-8">
              <div className="h-12 w-12 rounded-full border-4 border-blue-400 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-white/80 text-lg">Just a moment while we confirm your email address...</p>
          </motion.div>
        )}
        
        {verificationStatus === 'success' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-gradient-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center">
                <motion.svg
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="w-10 h-10 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <motion.path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="3" 
                    d="M5 13l4 4L19 7" 
                  />
                </motion.svg>
              </div>
            </div>
            
            <h1 className={`text-3xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 ${titleFont.className}`}>
              Welcome to TheraBot, {userName}!
            </h1>
            
            <div className="py-6 px-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 mb-6">
              <p className="text-white text-lg mb-4">Your email has been successfully verified. 🎉</p>
              <p className="text-white/90">We're excited to have you join our community of emotional growth and well-being.</p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-6 text-center"
            >
              <p className="text-white/80 mb-2">Redirecting you to your personal chat space...</p>
              <div className="h-1 bg-gray-700 rounded overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-500" 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 4.5 }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {verificationStatus === 'error' && (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            
            <h1 className={`text-3xl font-bold mb-6 text-center text-red-400 ${titleFont.className}`}>
              Verification Failed
            </h1>
            
            <p className="text-white/90 mb-6">{error || 'Failed to verify your email. Please try again.'}</p>
            
            <button 
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md text-white font-medium hover:shadow-lg transition-all duration-300"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
