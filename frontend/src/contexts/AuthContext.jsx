import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [dbRole, setDbRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the extended profile from public.users
  const fetchProfile = async (userId) => {
    try {
      // Add a 2.5s timeout to the profile fetch to prevent hangs
      const profilePromise = supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 2500)
      );

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]);
      
      if (!error && data) {
        setDbRole(data.role);
      }
    } catch (err) {
      console.warn("Profile fetch skipped or timed out, using metadata fallback.");
    }
  };

  useEffect(() => {
    // Timeout fallback
    const timeout = setTimeout(() => setLoading(false), 5000);

    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      const currUser = session?.user || null;
      setUser(currUser);
      
      if (currUser) {
        await fetchProfile(currUser.id);
      }
      
      setLoading(false);
      clearTimeout(timeout);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      const currUser = session?.user || null;
      setUser(currUser);
      
      if (currUser) {
        await fetchProfile(currUser.id);
      } else {
        setDbRole(null);
      }
      
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    role: dbRole || user?.user_metadata?.role || null,
    loading
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #333',
          borderTop: '3px solid #00BFA5',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
