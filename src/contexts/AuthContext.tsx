import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../types';

// Supabase credentials
const SUPABASE_URL = 'https://rbjivulozgubrenzwcjx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiaml2dWxvemd1YnJlbnp3Y2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjM2MzYsImV4cCI6MjA4ODkzOTYzNn0.5-CPtlAuIUxzBgLLVl0AOKepGOfVmunGwMy3e9lWsRw';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cozeo_isAdmin');
      return saved === 'true';
    }
    return false;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await Promise.all([
          fetchProfile(session.user.id, session.access_token),
          checkAdminRole(session.user.id)
        ]);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          await fetchProfile(session.user.id, session.access_token);
        } catch (err) {
          // fetchProfile error
        }
        try {
          await checkAdminRole(session.user.id);
        } catch (err) {
          // checkAdminRole error
        }
      } else {
        setProfile(null);
        setIsAdmin(false);
        localStorage.removeItem('cozeo_isAdmin');
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function createProfile(userId: string, userData: { email: string; name?: string }) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token || SUPABASE_ANON_KEY;
      
      const url = `${SUPABASE_URL}/rest/v1/profiles`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          id: userId,
          email: userData.email,
          name: userData.name || ''
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Profile created successfully
    } catch (err) {
      // Error creating profile
    }
  }

  async function fetchProfile(userId: string, accessToken?: string) {
    try {
      const authToken = accessToken || SUPABASE_ANON_KEY;
      
      const url = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data && data[0]) {
        setProfile(data[0] as Profile);
      } else {
        // No profile data found, create profile
        if (user?.email) {
          await createProfile(userId, { email: user.email, name: user.user_metadata?.name });
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${authToken}`
            }
          });
          const retryData = await retryResponse.json();
          if (retryData && retryData[0]) {
            setProfile(retryData[0] as Profile);
          }
        }
      }
    } catch (err) {
      // Error fetching profile
    }
  }

  async function checkAdminRole(userId: string) {
    try {
      // Use direct fetch instead of Supabase client
      const url = `https://rbjivulozgubrenzwcjx.supabase.co/rest/v1/user_roles?user_id=eq.${userId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiaml2dWxvemd1YnJlbnp3Y2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjM2MzYsImV4cCI6MjA4ODkzOTYzNn0.5-CPtlAuIUxzBgLLVl0AOKepGOfVmunGwMy3e9lWsRw',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiaml2dWxvemd1YnJlbnp3Y2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjM2MzYsImV4cCI6MjA4ODkzOTYzNn0.5-CPtlAuIUxzBgLLVl0AOKepGOfVmunGwMy3e9lWsRw'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if any role is 'admin'
      const isAdminUser = data?.some((r: any) => r.role === 'admin') ?? false;
      
      setIsAdmin(isAdminUser);
      localStorage.setItem('cozeo_isAdmin', String(isAdminUser));
    } catch (err) {
      // Error checking admin role
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signUp(email: string, password: string, name: string) {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { name }
      }
    });
    return { error };
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    return { error };
  }

  async function signOut() {
    // Clear local state immediately (non-blocking)
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    
    // Fire supabase signOut without awaiting (don't block on network)
    supabase.auth.signOut().then(({ error }) => {
      // SignOut completed
    }).catch(err => {
      // SignOut exception (non-blocking)
    });
    
    // Return immediately - don't wait for network
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user) return { error: new Error('Not authenticated') };
    
    try {
      // Get current session for proper auth token
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token || SUPABASE_ANON_KEY;
      
      // Use direct fetch with proper auth token
      const url = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Fetch updated profile with the token
      await fetchProfile(user.id, authToken);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      isAdmin, 
      isLoading, 
      signIn, 
      signUp, 
      signInWithGoogle,
      signOut,
      resetPassword,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
