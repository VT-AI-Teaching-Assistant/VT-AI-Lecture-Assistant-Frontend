import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '../services/ApiService';

export type Course = {
  id: string;
  course_id: number;
  canvas_id?: number; // Canvas course ID for API calls
  code: string;
  title: string;
  instructorId?: string;
};

export type CourseContextValue = {
  selectedCourse: Course | null;
  availableCourses: Course[]; // Canvas courses available for registration
  registeredCourses: Course[]; // Courses already registered in the system
  isCourseContextSet: boolean;
  setSelectedCourse: (course: Course | null) => Promise<void>;
  loadAvailableCourses: () => Promise<void>;
  loadRegisteredCourses: () => Promise<void>;
  clearCourseContext: () => Promise<void>;
  isLoading: boolean;
};

const CourseContext = createContext<CourseContextValue | undefined>(undefined);

export const CourseProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedCourse, setSelectedCourseState] = useState<Course | null>(null);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [registeredCourses, setRegisteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Load course context from backend on mount (when user is authenticated)
  useEffect(() => {
    const loadCourseContext = async () => {
      if (!isAuthenticated || !user) return;
      
      setIsLoading(true);
      try {
        // Fetch last selected course from backend
        const response = await apiService.get<{ success: boolean; data: { courseId: number; courseName: string } | null }>('/courses/context');
        
        if (response.success && response.data) {
          // Set selected course from backend
          setSelectedCourseState({
            id: response.data.courseId.toString(),
            course_id: response.data.courseId,
            code: '', // Will be populated when loading available courses
            title: response.data.courseName,
          });
        }
      } catch (error) {
        console.error('Error loading course context:', error);
        // Not a critical error, user can select course manually
      } finally {
        setIsLoading(false);
      }
    };

    loadCourseContext();
  }, [isAuthenticated, user]);

  const setSelectedCourse = useCallback(async (course: Course | null) => {
    if (!course) {
      setSelectedCourseState(null);
      return;
    }

    try {
      console.log('CourseContext - Setting course context:', course);
      console.log('CourseContext - Sending courseId:', course.course_id);
      
      // Save to backend
      const response = await apiService.post('/courses/context', {
        courseId: course.course_id
      });
      
      console.log('CourseContext - Backend response:', response);
      
      // Update local state
      setSelectedCourseState(course);
      console.log('CourseContext - Course context set successfully');
    } catch (error: any) {
      console.error('CourseContext - Error setting course context:', error);
      console.error('CourseContext - Error response:', error.response?.data);
      throw error;
    }
  }, []);

  const loadAvailableCourses = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch user profile with available courses
      const response = await apiService.get<{ success: boolean; data: any }>('/user/profile');

      if (response.success && response.data) {
        const data = response.data;
        
        console.log('CourseContext - Raw response data:', data);
        
        // Canvas courses available for registration (not yet registered)
        const availableCanvasCourses = data.canvasEnrollments || [];
        console.log('CourseContext - availableCanvasCourses:', availableCanvasCourses);
        
        const formattedAvailableCourses: Course[] = availableCanvasCourses.map((c: any) => ({
          id: c.course_id.toString(),
          course_id: c.course_id,
          canvas_id: c.course_id,
          code: c.course_code || '',
          title: c.course_name || '',
          instructorId: user.entityId.toString()
        }));
        
        console.log('CourseContext - formattedAvailableCourses:', formattedAvailableCourses);
        setAvailableCourses(formattedAvailableCourses);
        
        // Load registered courses separately
        await loadRegisteredCourses();
      }
    } catch (error) {
      console.error('Error loading available courses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const loadRegisteredCourses = useCallback(async () => {
    if (!user) return;
    
    try {
      // Fetch user profile with registered courses
      const response = await apiService.get<{ success: boolean; data: any }>('/user/profile');

      if (response.success && response.data) {
        const data = response.data;
        
        // For instructors: use registeredCourses (courses they teach)
        // For students: use enrolledCourses (courses they're enrolled in)
        const coursesData = user.role === 'student' 
          ? (data.enrolledCourses || []) 
          : (data.registeredCourses || []);
        
        console.log('CourseContext - Courses for', user.role + ':', coursesData);
        
        const formattedCourses: Course[] = coursesData.map((c: any) => ({
          id: c.localCourseId?.toString() || c.courseId.toString(),
          course_id: c.localCourseId || c.courseId, // Use local DB ID
          canvas_id: parseInt(c.canvasId), // Canvas course ID for API calls
          code: c.courseCode || '',
          title: c.courseName || '',
          instructorId: user.role === 'instructor' ? user.entityId.toString() : undefined
        }));
        
        console.log('CourseContext - Formatted courses:', formattedCourses);
        setRegisteredCourses(formattedCourses);
        
        // If we have a selected course ID but no details, populate from registered courses
        if (selectedCourse && !selectedCourse.code) {
          const fullCourse = formattedCourses.find(c => c.course_id === selectedCourse.course_id);
          if (fullCourse) {
            setSelectedCourseState(fullCourse);
          }
        }
      }
    } catch (error) {
      console.error('Error loading registered courses:', error);
    }
  }, [user, selectedCourse]);

  const clearCourseContext = useCallback(async () => {
    setSelectedCourseState(null);
    // Backend will handle clearing context if needed
  }, []);

  // Load available courses on mount
  useEffect(() => {
    if (user) {
      console.log('CourseContext - Loading available courses on mount');
      loadAvailableCourses();
    }
  }, [user, loadAvailableCourses]);

  const isCourseContextSet = Boolean(selectedCourse);

  const value = useMemo<CourseContextValue>(
    () => ({
      selectedCourse,
      availableCourses,
      registeredCourses,
      isCourseContextSet,
      setSelectedCourse,
      loadAvailableCourses,
      loadRegisteredCourses,
      clearCourseContext,
      isLoading,
    }),
    [selectedCourse, availableCourses, registeredCourses, isCourseContextSet, setSelectedCourse, loadAvailableCourses, loadRegisteredCourses, clearCourseContext, isLoading]
  );

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
};

export const useCourse = (): CourseContextValue => {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourse must be used within CourseProvider');
  return ctx;
};
