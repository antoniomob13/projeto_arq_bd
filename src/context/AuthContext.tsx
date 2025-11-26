import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { loginCliente, type LoginResponse } from '../api/clientes';

const STORAGE_KEY = 'laber.auth.user';

export type AuthenticatedUser = {
  _id: string;
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapLoginResponseToUser(response: LoginResponse): AuthenticatedUser {
  // sistema_id pode ser string ou objeto populado
  let sistemaId: string | null = null;
  if (response.sistema_id) {
    sistemaId = typeof response.sistema_id === 'string' 
      ? response.sistema_id 
      : response.sistema_id._id;
  }
  
  return {
    _id: response._id,
    email: response.email,
    name: response.nome,
    role: response.tipo === 'admin' ? 'Administrador LABER' : 'Beneficiário',
    tipo: response.tipo,
    sistema_id: sistemaId,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (!storedUser) {
      return null;
    }
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  const login = async (email: string, password: string) => {
    const response = await loginCliente({ email, senha: password });
    const authUser = mapLoginResponseToUser(response);
    setUser(authUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
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
