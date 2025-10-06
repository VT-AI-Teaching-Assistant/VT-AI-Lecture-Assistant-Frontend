import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';

type ProtectedRouteProps = {
  children: React.ReactElement;
  allow?: UserRole[];
};

const ProtectedRoute = ({ children, allow }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const { isCourseContextSet } = useCourse();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allow && user && !allow.includes(user.role)) {
    // If role not allowed, redirect based on user role
    return <Navigate to={user.role === 'instructor' ? '/profile' : '/'} replace />;
  }
  
  // For instructors, redirect to profile page on first login (when no course context is set)
  if (user?.role === 'instructor' && !isCourseContextSet && window.location.pathname === '/') {
    return <Navigate to="/profile" replace />;
  }
  
  // For students, redirect to profile if no course context is set and trying to access other pages
  if (user?.role === 'student' && !isCourseContextSet && window.location.pathname !== '/profile') {
    return <Navigate to="/profile" replace />;
  }
  
  return children;
};

export default ProtectedRoute;


