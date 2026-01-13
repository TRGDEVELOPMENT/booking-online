import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  company_id: string;
  branch_id: string | null;
}

interface UserRole {
  role: 'sale' | 'cashier' | 'sale_supervisor' | 'sale_manager' | 'it';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener BEFORE getting session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch profile and roles
          setTimeout(async () => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();

            const { data: rolesData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id);

            setProfile(profileData);
            setRoles(rolesData || []);
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
        }

        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch profile and roles
        Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle(),
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
        ]).then(([profileRes, rolesRes]) => {
          setProfile(profileRes.data);
          setRoles(rolesRes.data || []);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const hasRole = (role: UserRole['role']) => {
    return roles.some(r => r.role === role);
  };

  return {
    user,
    session,
    profile,
    roles,
    loading,
    signOut,
    hasRole,
  };
}
