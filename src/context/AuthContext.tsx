import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'laber.auth.email';

type AllowedUserProfile = {
  password: string;
  name: string;
  role: string;
  tipo: 'admin' | 'cliente';
  sistema_id: string | null;
};

const allowedUsers: Record<string, AllowedUserProfile> = {
  'cliente@ufopa.br': {
    password: '123',
    name: 'Maria Ribeirinha',
    role: 'Beneficiário',
    tipo: 'cliente',
    sistema_id: 'sys1',
  },
  'admin@ufopa.br': {
    password: '123',
    name: 'Dr. Carlos Pesquisador',
    role: 'Administrador LABER',
    tipo: 'admin',
    sistema_id: null,
  },
};

export type AuthenticatedUser = {
  email: string;
  name: string;
  role: string;
  tipo: 'admin' | 'cliente';
  sistema_id: string | null;
};

export type AuthContextValue = {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCliente: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(() => {
    const storedEmail = localStorage.getItem(STORAGE_KEY);
    if (!storedEmail) {
      return null;
    }
    const profile = allowedUsers[storedEmail];
    if (!profile) {
      return null;
    }
    return { email: storedEmail, name: profile.name, role: profile.role, tipo: profile.tipo, sistema_id: profile.sistema_id };
  });

  const login = (email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    const profile = allowedUsers[normalized];
    if (!profile || profile.password !== password.trim()) {
      throw new Error('Credenciais inválidas.');
    }
    setUser({ email: normalized, name: profile.name, role: profile.role, tipo: profile.tipo, sistema_id: profile.sistema_id });
    localStorage.setItem(STORAGE_KEY, normalized);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.tipo === 'admin',
      isCliente: user?.tipo === 'cliente',
      login,
      logout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
