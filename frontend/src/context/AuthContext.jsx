import { createContext, useContext, useState, useCallback } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('stsms_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const persistUser = (userData) => {
    setUser(userData);
    localStorage.setItem('stsms_user', JSON.stringify(userData));
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      persistUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', formData);
      persistUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stsms_user');
  };

  const refreshTouristProfile = useCallback(async () => {
    if (user?.role !== 'tourist') return null;
    const { data } = await API.get('/tourists/me');
    persistUser({ ...user, touristProfile: { _id: data._id, touristId: data.touristId, safetyStatus: data.safetyStatus, safetyScore: data.safetyScore } });
    return data;
  }, [user]);

  const isAuthority = user?.role === 'authority' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';
  const isTourist = user?.role === 'tourist';

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthority, isAdmin, isTourist, refreshTouristProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
