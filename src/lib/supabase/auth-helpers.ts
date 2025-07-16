import { supabase } from './client';

/**
 * Helper function to handle Google OAuth sign-in with proper PKCE flow
 * @returns Promise that resolves when sign-in process starts
 */
export async function signInWithGoogle() {
  // Determine the correct redirect URL based on environment
  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      const { protocol, hostname, port } = window.location;
      
      // If we're on Netlify production
      if (hostname === 'therabob.netlify.app') {
        return 'https://therabob.netlify.app/auth/callback';
      }
      
      // For local development
      const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
      return `${baseUrl}/auth/callback`;
    }
    
    // Fallback for server-side rendering
    return process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      : 'http://localhost:3000/auth/callback';
  };

  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getRedirectUrl(),
      // These query parameters ensure we get refresh tokens and force consent screen
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      // Skip browser redirect if you want to handle it manually
      // In most cases, this should be false (default)
      skipBrowserRedirect: false,
    },
  });
}

/**
 * Helper function to exchange code for session
 * Returns the session data or null if error
 */
type AuthCallbackResult = {
  session: any | null;
  error: { message: string } | null;
};

export async function handleAuthCallback(url: string): Promise<AuthCallbackResult> {
  try {
    // First check if we already have a session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData?.session) {
      return { session: sessionData.session, error: null };
    }

    // Log the URL for debugging
    console.log('Handling auth callback with URL:', url);

    // Allow for manual testing during development by falling back to the current URL
    // when no URL is provided (or it's invalid)
    const callbackUrl = url || window.location.href;
    
    // If no session, try to exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(callbackUrl);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      return { session: null, error: { message: error.message || 'Authentication error occurred' } };
    }
    
    return { session: data.session, error: null };
  } catch (error) {
    console.error('Unexpected error during auth callback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unexpected authentication error';
    return { session: null, error: { message: errorMessage } };
  }
}

/**
 * Get user profile information including display name
 * If the user_profiles table doesn't exist yet, returns null gracefully
 */
export async function getUserProfile(userId: string) {
  try {
    // First check if user exists to avoid creating an empty profile
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return null;
    }
    
    // Attempt to get the profile - this may fail if table doesn't exist
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('display_name')
        .eq('id', userId)
        .single();
        
      if (error) {
        // If this is a db error like table not found, just return null
        if (error.code === '42P01' || error.code === '406') { // 42P01 is PostgreSQL's "table does not exist"
          console.warn('user_profiles table may not exist yet');
          return null;
        }
        throw error;
      }
      
      return profile;
    } catch (profileError) {
      // This is a graceful fallback when the table doesn't exist
      console.warn('Could not fetch user profile, returning null:', profileError);
      return null;
    }
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}
