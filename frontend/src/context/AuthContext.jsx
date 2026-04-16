import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
 
const AuthContext = createContext(null);
 
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
 
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
 
  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data);
      return response.data.data;
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      return null;
    }
  }, []);
 
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUser]);
 
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user: userData, accessToken, refreshToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    // Set user directly from login response — no second fetch needed
    setUser(userData);
    return response.data;
  };
 
  const register = async (email, password, username) => {
    const response = await api.post('/auth/register', { email, password, username });
    const { user: userData, accessToken, refreshToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(userData);
    return response.data;
  };
 
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };
 
  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };
 
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};