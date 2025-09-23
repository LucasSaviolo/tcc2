import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, redirect } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Criancas from './pages/Criancas';
import Creches from './pages/Creches';
import Responsaveis from './pages/Responsaveis';
import Criterios from './pages/Criterios';
import FilaEsperaPage from './pages/FilaEspera';
import AlocacoesPage from './pages/Alocacoes';
import Relatorios from './pages/Relatorios';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Authentication loader
const authLoader = () => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return redirect('/login');
  }
  return null;
};

// Login loader
const loginLoader = () => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    return redirect('/');
  }
  return null;
};

// Router configuration
const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
    loader: loginLoader,
  },
  {
    path: '/',
    element: <AppLayout />,
    loader: authLoader,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'criancas',
        element: <Criancas />,
      },
      {
        path: 'creches',
        element: <Creches />,
      },
      {
        path: 'responsaveis',
        element: <Responsaveis />,
      },
      {
        path: 'criterios',
        element: <Criterios />,
      },
      {
        path: 'fila',
        element: <FilaEsperaPage />,
      },
      {
        path: 'alocacoes',
        element: <AlocacoesPage />,
      },
      {
        path: 'relatorios',
        element: <Relatorios />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10b981',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

