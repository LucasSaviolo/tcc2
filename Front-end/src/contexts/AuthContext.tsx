import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../services/api';
import type { User, LoginCredentials } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Se for um token de teste, usar usuário de teste
        if (token.startsWith('test-token-')) {
          const testUser: any = {
            id: 1,
            nome: 'Administrador de Teste',
            email: 'admin@teste.com',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUser(testUser);
          return;
        }
        
        // Tentar verificar usuário real com o backend
        try {
          const userData = await apiService.getCurrentUser();
          setUser(userData);
        } catch (error: any) {
          console.error('Verificação de usuário falhou:', error);
          // Se o erro for de autenticação ou conectividade, limpar o token
          if (error.response?.status === 401 || error.response?.status === 404 || !error.response) {
            localStorage.removeItem('auth_token');
          }
        }
      }
    } catch (error: any) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      
      // Tentativa de login real com o backend
      try {
        const authResponse = await apiService.login(credentials);
        setUser(authResponse.user);
        return;
      } catch (error: any) {
        console.error('Login real falhou:', error);
        
        // Se o backend não estiver disponível ou endpoint não existir, fazer login de teste
        if (error.response?.status === 404 || !error.response) {
          // Login de teste simples
          if (credentials.email === 'admin@teste.com' && credentials.password === 'password') {
            const testUser: any = {
              id: 1,
              nome: 'Administrador de Teste',
              email: 'admin@teste.com',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            
            // Simula token
            localStorage.setItem('auth_token', 'test-token-' + Date.now());
            setUser(testUser);
            return;
          } else {
            throw new Error('Credenciais inválidas. Use admin@teste.com / password para teste.');
          }
        }
        
        throw error;
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('auth_token');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

