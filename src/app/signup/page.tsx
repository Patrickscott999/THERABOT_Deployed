'use client';

import React, { useState, useEffect, useRef } from 'react';
import '../home.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { Orbitron } from 'next/font/google';
import { supabase } from '@/lib/supabase/client';
import { signInWithGoogle } from '@/lib/supabase/auth-helpers';

const titleFont = Orbitron({ 
  subsets: ['latin'],
  weight: '700',
  display: 'swap',
});

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
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

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Using our helper function for Google OAuth
      const { error } = await signInWithGoogle();
      
      if (error) {
        throw error;
      }
      
      // signInWithGoogle handles the redirect automatically
      // User will be redirected to Google's auth page
      
    } catch (error: any) {
      console.error('Error signing up with Google:', error);
      setError(error.message || 'An error occurred during Google sign-up');
      setLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    // Check for password complexity
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    
    if (!(hasUppercase && hasLowercase && hasNumbers && hasSpecialChar)) {
      setError('Password must include at least one uppercase letter, one lowercase letter, one number, and one special character');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Use Supabase auth to sign up with email and password
      // Enable email confirmation by setting emailRedirectTo
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            signup_date: new Date().toISOString(),
          },
          // Set email confirmation options
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.user) {
        // Create a user profile in the user_profiles table
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            { 
              id: data.user.id, 
              display_name: fullName,
              username: email.split('@')[0], // Simple username generation
            }
          ]);
          
        if (profileError) {
          console.error('Error creating user profile:', profileError);
          // Continue even if profile creation fails - admin can fix later
        }
        
        // Show email confirmation message
        if (data.session === null) {
          // If session is null, it means email confirmation is required
          setEmailSent(true);
          console.log('Verification email sent to:', email);
        } else {
          // If email confirmation is not required, redirect to chat
          console.log('Signup successful for:', email);
          router.push('/chat');
        }
      }
    } catch (err: any) {
      // Show meaningful error message to the user
      setError(err.message || 'Failed to create account. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={vantaRef} className="flex min-h-screen flex-col items-center justify-center p-6 relative">
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
      
      <div className="w-full max-w-md p-8 glass-container z-10 animate-fadeIn motion-reduce:animate-none">
        <h1 className={`text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 animated-title tracking-wider ${titleFont.className}`}>Create an Account</h1>
        
        {emailSent ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 animate-fadeIn">
            <h3 className="font-semibold text-lg mb-2">Verification Email Sent!</h3>
            <p className="mb-2">We've sent a verification email to <span className="font-semibold">{email}</span>.</p>
            <p className="mb-4">Please check your inbox and click the verification link to complete your registration.</p>
            <p className="text-sm">Didn't receive the email? Check your spam folder or <button 
              onClick={() => {
                setLoading(true);
                supabase.auth.resend({
                  type: 'signup',
                  email: email,
                  options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                  }
                }).then(({error}) => {
                  if (error) {
                    setError(error.message);
                  } else {
                    setError(null);
                    alert('Verification email resent!');
                  }
                  setLoading(false);
                });
              }} 
              className="text-blue-600 underline hover:text-blue-800 focus:outline-none"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'resend the verification'}
            </button>
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-white mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-white/30 bg-white/20 text-white placeholder-white/70 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              required
              placeholder="Jane Doe"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-white/30 bg-white/20 text-white placeholder-white/70 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              required
              placeholder="jane@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-white/30 bg-white/20 text-white placeholder-white/70 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              required
              placeholder="••••••••"
            />
            <p className="text-xs text-white/80 mt-1">
              Must be at least 8 characters long with uppercase, lowercase, number, and special character
            </p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-white/30 bg-white/20 text-white placeholder-white/70 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              required
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-gradient-to-r from-blue-400 to-purple-500 text-white font-medium rounded-md hover:from-blue-500 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-blue-500/20 transform hover:-translate-y-0.5 mt-6"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        </>
        )}
        
        <div className="mt-6 text-center">
          <p className="text-white/80 mb-4">Or continue with</p>
          
          <div className="flex justify-center space-x-4">
            <button 
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 border border-white/30 bg-white/20 text-white rounded-md hover:bg-white/30 transition-all duration-300 gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
              Continue with Google
            </button>
          </div>
          
          <p className="mt-6 text-white/80">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-300 hover:text-blue-200 hover:underline transition-colors duration-300">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
