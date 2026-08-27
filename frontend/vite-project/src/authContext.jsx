import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from './api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (userId) {
      setCurrentUser(userId);
    }
    
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await authAPI.getMe();
      const userData = response.data?.user || response.data;
      setUser(userData);
      if (userData?._id) {
        localStorage.setItem('userId', userData._id);
        setCurrentUser(userData._id);
      }
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      const userId = response.data.userId || response.data.user?._id;
      if (userId) {
        localStorage.setItem('userId', userId);
        setCurrentUser(userId);
      }
      await loadUser();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      const userId = response.data.userId || response.data.user?._id;
      if (userId) {
        localStorage.setItem('userId', userId);
        setCurrentUser(userId);
      }
      await loadUser();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Signup failed' };
    }
  };

  const logout = () => {
    authAPI.logout();
    localStorage.removeItem('userId');
    setUser(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      loading, 
      login, 
      signup, 
      logout, 
      loadUser,
      currentUser,
      setCurrentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
