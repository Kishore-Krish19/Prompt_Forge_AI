import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return <Navigate to="/login" replace />;

  try {
    const parts = token.split('.');
    if (parts.length < 2) return <Navigate to="/login" replace />;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const isAdmin = payload?.is_admin || payload?.role === 'admin' || false;
    if (!isAdmin) return <Navigate to="/optimizer" replace />;
    return <>{children}</>;
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
};

export default AdminRoute;
