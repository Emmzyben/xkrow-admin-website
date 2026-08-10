import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const EXPIRATION_TIME = 1 * 60 * 60 * 1000; // 1 hour in milliseconds

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('adminToken');
    const loginTime = localStorage.getItem('adminLoginTime');

    if (storedToken && loginTime) {
      const isExpired = new Date().getTime() - parseInt(loginTime, 10) > EXPIRATION_TIME;
      if (isExpired) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminLoginTime');
        return null;
      }
      return storedToken;
    }
    return storedToken || null;
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('adminToken', token);
      if (!localStorage.getItem('adminLoginTime')) {
        localStorage.setItem('adminLoginTime', new Date().getTime().toString());
      }
      // In a real app, decode token or fetch user profile here
      setUser({ role: 'admin' });
    } else {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminLoginTime');
      setUser(null);
    }
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('adminLoginTime', new Date().getTime().toString());
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('adminLoginTime');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
