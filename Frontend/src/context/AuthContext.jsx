import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { chatService } from '../services/chatService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.readPersistedUser());
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Keep multiple tabs in sync with login/logout.
  useEffect(() => {
    function onStorage(e) {
      if (e.key === 'minegov_auth_user') {
        chatService.clearLocalState();
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  async function login(credentials) {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      chatService.clearLocalState();
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
    chatService.wipeUserTemporaryChats();
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
