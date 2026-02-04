import { createContext, useContext, useMemo, useState } from "react";
import type { AuthUser, UserRole, Region } from "../types.ts";
import { loginRequest } from "../api/client.ts";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
};

type AuthContextValue = AuthState & {
  login: (payload: {
    email: string;
    role: UserRole;
    region?: Region | null;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "culturePlansAuth";

const loadStoredAuth = (): AuthState => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { token: null, user: null };
  }
  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(() => loadStoredAuth());

  const login = async (payload: {
    email: string;
    role: UserRole;
    region?: Region | null;
  }) => {
    const response = await loginRequest(payload);
    const nextAuth = { token: response.token, user: response.user };
    setAuth(nextAuth);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
  };

  const logout = () => {
    setAuth({ token: null, user: null });
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({ ...auth, login, logout }),
    [auth.token, auth.user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
