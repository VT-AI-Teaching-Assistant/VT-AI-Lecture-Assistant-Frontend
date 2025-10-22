import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';

type ProtectedRouteProps = {
  children: React.ReactElement;
  allow?: UserRole[];
};

const ProtectedRoute = ({ children, allow }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { isCourseContextSet, isLoading: courseLoading } = useCourse();
  const location = useLocation();
  
  // Show loading while checking authentication or course context
  if (authLoading || courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vt-maroon mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role-based access
  if (allow && user && !allow.includes(user.role)) {
    // If role not allowed, redirect based on user role
    return <Navigate to={user.role === 'instructor' ? '/profile' : '/'} replace />;
  }
  
  // Allow profile page access always (needed for course registration/context)
  if (location.pathname === '/profile') {
    return children;
  }
  
  // For instructors: check course registration and context
  if (user?.role === 'instructor') {
    // If no courses registered, redirect to profile for course registration
    if (!user.hasRegisteredCourses) {
      return <Navigate to="/profile" replace state={{ message: 'Please register courses first' }} />;
    }
    
    // If courses registered but no context set, redirect to profile for context selection
    if (!isCourseContextSet) {
      return <Navigate to="/profile" replace state={{ message: 'Please select a course context' }} />;
    }
  }
  
  // For students: check course context
  if (user?.role === 'student') {
    // If no course context set, redirect to profile for context selection
    if (!isCourseContextSet) {
      return <Navigate to="/profile" replace state={{ message: 'Please select a course' }} />;
    }
  }
  
  return children;
};

export default ProtectedRoute;


