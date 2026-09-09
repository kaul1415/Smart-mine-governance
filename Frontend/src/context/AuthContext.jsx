import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.readPersistedUser());
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Keep multiple tabs and 401 token clearances in sync with login/logout.
  useEffect(() => {
    function onStorage(e) {
      if (e.key === 'minegov_auth_user') {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    }
    function onAuthCleared() {
      setUser(null);
    }
    window.addEventListener('storage', onStorage);
    window.addEventListener('minegov_auth_cleared', onAuthCleared);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('minegov_auth_cleared', onAuthCleared);
    };
  }, []);

  async function login(credentials) {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const session = await authService.login(credentials);
      authService.persistSession(session);
      setUser(session.user);
      return session.user;
    } catch (err) {
      setAuthError(err.message || 'Unable to sign in. Please try again.');
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  }

  function logout() {
    authService.clearSession();
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, isAuthenticating, authError, login, logout }),
    [user, isAuthenticating, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
