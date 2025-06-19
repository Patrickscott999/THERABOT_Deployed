'use client';

import { useState, useEffect, useRef } from 'react';
import './login.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { Orbitron } from 'next/font/google';  // Importing stylish font
import { supabase } from '@/lib/supabase/client'; // Import Supabase client
import { signInWithGoogle } from '@/lib/supabase/auth-helpers';

const titleFont = Orbitron({ 
  subsets: ['latin'],
  weight: '700',
  display: 'swap',
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleLogin = async () => {
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
      console.error('Error signing in with Google:', error);
      setError(error.message || 'An error occurred during Google sign-in');
      setLoading(false);
    }
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }
    
    try {
      // Use Supabase auth to sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.user) {
        // Successful authentication
        console.log('Login successful for:', email);
        router.push('/chat');
      }
    } catch (err: any) {
      // Show meaningful error message to the user
      setError(err.message || 'Invalid email or password. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className={`text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 animated-title tracking-wider ${titleFont.className}`}>Login to TheraBot</h1>
        <p className="text-center text-white mb-6 text-shadow">Welcome back to your emotional support companion</p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
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
              placeholder="youremail@example.com"
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
          </div>
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-gradient-to-r from-blue-400 to-purple-500 text-white font-medium rounded-md hover:from-blue-500 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-blue-500/20 transform hover:-translate-y-0.5"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-white/80 mb-4">Or continue with</p>
          
          <div className="flex justify-center space-x-4">
            <button 
              type="button"
              onClick={handleGoogleLogin}
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
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-300 hover:text-blue-200 hover:underline transition-colors duration-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
