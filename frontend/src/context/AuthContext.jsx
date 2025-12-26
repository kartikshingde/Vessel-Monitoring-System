import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

// Create context (shared state across app)
export const AuthContext = createContext();

// Provider component wraps entire app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (on app load)
  useEffect(() => {
    checkAuth();
  }, []);

  //  Function to check authentication status
  const checkAuth = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user); // Set user if cookie is valid
    } catch (error) {
      setUser(null); // No valid cookie, user not logged in
    } finally {
      setLoading(false); // Done checking
    }
  };

  //  Login function
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.user); // Update context state
    return data; // Return for component to handle redirect
  };

  //  Register function
  const register = async (name, email, password, role) => {
    const { data } = await api.post('/auth/register', { name, email, password, role });
    setUser(data.user);
    return data;
  };

  //  Logout function
  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null); // Clear user from context
  };

  //  Provide these values to all children components
  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
