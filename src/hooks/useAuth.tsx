import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: { id: string; org_id: string; full_name: string; preferred_lang?: string } | null;
  roles: string[];
  signOut: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, loading: true, profile: null,
  roles: [], signOut: async () => {}, hasRole: () => false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(async () => {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("id, org_id, full_name")
              .eq("id", session.user.id)
              .single();
            // Try to fetch preferred_lang separately (column may not exist yet)
            let preferred_lang: string | undefined;
            try {
              const { data: langData } = await supabase
                .from("profiles")
                .select("preferred_lang" as any)
                .eq("id", session.user.id)
                .single();
              preferred_lang = (langData as any)?.preferred_lang;
            } catch { /* column may not exist yet */ }
            setProfile(profileData ? { ...profileData, preferred_lang } : null);
            const { data: rolesData } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id);
            setRoles(rolesData?.map((r) => r.role) ?? []);
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
        }
        setLoading(false);
      }
    );
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => { await supabase.auth.signOut(); };
  const hasRole = (role: string) => roles.includes(role);

  return (
    <AuthContext.Provider value={{ user, session, loading, profile, roles, signOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
