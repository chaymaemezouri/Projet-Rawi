import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { TOKEN_KEY } from "../api/client";
import { fetchMe } from "../api/resources";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  loading: boolean;
  setSession: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener("rawi:unauthorized", onUnauthorized);
    return () => window.removeEventListener("rawi:unauthorized", onUnauthorized);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      setSession: (token, nextUser) => {
        localStorage.setItem(TOKEN_KEY, token);
        setUser(nextUser);
      },
      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
