import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';

type ProtectedRouteProps = {
  children: React.ReactElement;
  allow?: UserRole[];
};

const ProtectedRoute = ({ children, allow }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (allow && user && !allow.includes(user.role)) {
    // If role not allowed, send to home (student portal remains unchanged)
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;


