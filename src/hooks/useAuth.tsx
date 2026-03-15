import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AppRole = "admin" | "dpo" | "developer" | "viewer";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: { id: string; org_id: string; full_name: string } | null;
  role: AppRole | null;
  roles: string[]; // kept for backward compat
  signOut: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  profile: null,
  role: null,
  roles: [],
  signOut: async () => {},
  hasRole: () => false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [role, setRole] = useState<AppRole | null>(null);

  const fetchUserData = async (userId: string) => {
    const [{ data: profileData }, { data: roleData }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, org_id, full_name")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);
    console.log("[useAuth] profile:", profileData, "role:", roleData);
    setProfile(profileData);
    setRole((roleData?.role as AppRole) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserData(session.user.id);
        } else {
          setProfile(null);
          setRole(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const roles = role ? [role] : [];
  const hasRoleFn = (r: string) => role === r;

  return (
    <AuthContext.Provider value={{ user, session, loading, profile, role, roles, signOut, hasRole: hasRoleFn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
