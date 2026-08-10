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
  const [user, setUser] = useState(() => {
    const savedName = localStorage.getItem('adminName');
    return savedName ? { role: 'admin', name: savedName } : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('adminToken', token);
      if (!localStorage.getItem('adminLoginTime')) {
        localStorage.setItem('adminLoginTime', new Date().getTime().toString());
      }
      const savedName = localStorage.getItem('adminName') || 'Admin';
      setUser({ role: 'admin', name: savedName });
    } else {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminLoginTime');
      localStorage.removeItem('adminName');
      setUser(null);
    }
  }, [token]);

  const login = (newToken, name) => {
    setToken(newToken);
    localStorage.setItem('adminLoginTime', new Date().getTime().toString());
    if (name) {
      localStorage.setItem('adminName', name);
      setUser({ role: 'admin', name });
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('adminLoginTime');
    localStorage.removeItem('adminName');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
