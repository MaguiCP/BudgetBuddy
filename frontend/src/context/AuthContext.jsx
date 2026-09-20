import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      return;
    }

    localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    try {
      const payload = JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      const expiresInMs = payload.exp * 1000 - Date.now();

      if (expiresInMs <= 0) {
        setToken('');
        return undefined;
      }

      const timeoutId = window.setTimeout(() => setToken(''), expiresInMs);
      return () => window.clearTimeout(timeoutId);
    } catch {
      setToken('');
      return undefined;
    }
  }, [token]);

  const value = useMemo(() => ({ token, setToken }), [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }

  return context;
};

export default AuthContext;
