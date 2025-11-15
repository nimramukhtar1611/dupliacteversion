"use client";
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on page load
    const token = localStorage.getItem('token');
    const adminData = localStorage.getItem('admindata');
    
    if (token && adminData) {
      try {
        setIsAuthenticated(true);
        setUser(JSON.parse(adminData));
      } catch (error) {
        console.error('Error parsing admin data:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('admindata');
      }
    }
    setLoading(false);
  }, []);

  const login = (token, adminData) => {
    const safeAdminData = adminData || {};
    
    localStorage.setItem('token', token);
    localStorage.setItem('admindata', JSON.stringify(safeAdminData));
    setIsAuthenticated(true);
    setUser(safeAdminData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admindata');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      loading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};