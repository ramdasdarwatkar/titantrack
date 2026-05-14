import { useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { AuthContext, type AuthContextType } from "@/context/AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state with explicit types
  const [state, setState] = useState<AuthContextType>({
    session: null,
    user: null,
    isInitialized: false,
  });

  useEffect(() => {
    // 1. Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        session,
        user: session?.user ?? null,
        isInitialized: true,
      });
    });

    // 2. Listen for Auth Changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        session,
        user: session?.user ?? null,
        isInitialized: true,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};
