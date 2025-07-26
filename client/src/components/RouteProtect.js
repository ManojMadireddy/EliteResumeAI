// client/src/components/RouteProtect.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Import Supabase client

export const RouteProtect = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/'); // Redirect to login if no user
      } else {
        setUser(user);
      }
      setLoading(false);
    };

    // Listen for auth state changes for real-time protection
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/');
      } else {
        setUser(session.user);
      }
    });

    checkUser(); // Initial check

    return () => {
      authListener.subscription.unsubscribe(); // Cleanup
    };
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (!user) {
    return null; // Will be redirected by useEffect
  }

  return children;
};