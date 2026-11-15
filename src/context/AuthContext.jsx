import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('arh_auth_token'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Clear auth error
  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Re-hydrate session on mount
  useEffect(() => {
    let isMounted = true;

    async function verifyExistingSession() {
      const storedToken = localStorage.getItem('arh_auth_token');
      if (!storedToken) {
        if (isMounted) {
          setCurrentUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await authApi.getCurrentUser();
        if (isMounted && response?.success && response?.user) {
          setCurrentUser(response.user);
        } else {
          // Token invalid or user deactivated
          localStorage.removeItem('arh_auth_token');
          if (isMounted) {
            setToken(null);
            setCurrentUser(null);
          }
        }
      } catch (err) {
        console.warn('Session verification notice:', err.message);
        localStorage.removeItem('arh_auth_token');
        if (isMounted) {
          setToken(null);
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    verifyExistingSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Student Login
  const loginStudent = async (email, password, rememberMe = false) => {
    setAuthError(null);
    try {
      const response = await authApi.loginStudent(email, password, rememberMe);
      if (response?.success && response?.token && response?.user) {
        localStorage.setItem('arh_auth_token', response.token);
        setToken(response.token);
        setCurrentUser(response.user);
        return { success: true, user: response.user };
      }
      throw new Error(response.message || 'Login failed');
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  // 2. Student Registration
  const registerStudent = async (formData) => {
    setAuthError(null);
    try {
      const response = await authApi.registerStudent(formData);
      if (response?.success && response?.token && response?.user) {
        localStorage.setItem('arh_auth_token', response.token);
        setToken(response.token);
        setCurrentUser(response.user);
        return { success: true, user: response.user };
      }
      throw new Error(response.message || 'Registration failed');
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  // 3. Faculty Login
  const loginFaculty = async (email, password, rememberMe = false) => {
    setAuthError(null);
    try {
      const response = await authApi.loginFaculty(email, password, rememberMe);
      if (response?.success && response?.token && response?.user) {
        localStorage.setItem('arh_auth_token', response.token);
        setToken(response.token);
        setCurrentUser(response.user);
        return { success: true, user: response.user };
      }
      throw new Error(response.message || 'Faculty login failed');
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  // 4. Forgot Password
  const forgotPassword = async (email) => {
    setAuthError(null);
    try {
      const response = await authApi.forgotPassword(email);
      return { success: true, message: response.message };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  // 5. Logout
  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('arh_auth_token');
      setToken(null);
      setCurrentUser(null);
      setAuthError(null);
    }
  };

  const value = {
    currentUser,
    token,
    loading,
    authError,
    isAuthenticated: !!currentUser,
    isStudent: currentUser?.role === 'student',
    isFaculty: currentUser?.role === 'faculty',
    loginStudent,
    registerStudent,
    loginFaculty,
    forgotPassword,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
