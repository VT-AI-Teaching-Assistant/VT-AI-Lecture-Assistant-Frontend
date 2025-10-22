import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Course } from './CourseContext';
import { apiService } from '../services/ApiService';

type CourseSelectionContextValue = {
  selectedCourses: Course[];
  isCourseSelected: (courseId: string) => boolean;
  toggleCourseSelection: (course: Course) => void;
  selectCourses: (courses: Course[]) => void;
  clearSelection: () => void;
  registerSelectedCourses: (instructorId?: number) => Promise<{ success: boolean; message?: string; data?: any }>;
  isRegistering: boolean;
};

const CourseSelectionContext = createContext<CourseSelectionContextValue | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'vt-ai-selected-courses';

export const CourseSelectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);

  // Load selected courses from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Course[];
        setSelectedCourses(parsed);
      } catch {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, []);

  // Save selected courses to localStorage whenever selection changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(selectedCourses));
  }, [selectedCourses]);

  const isCourseSelected = useCallback((courseId: string) => {
    return selectedCourses.some(course => course.id === courseId);
  }, [selectedCourses]);

  const toggleCourseSelection = useCallback((course: Course) => {
    setSelectedCourses(prev => {
      const isSelected = prev.some(c => c.id === course.id);
      if (isSelected) {
        return prev.filter(c => c.id !== course.id);
      } else {
        return [...prev, course];
      }
    });
  }, []);

  const selectCourses = useCallback((courses: Course[]) => {
    setSelectedCourses(courses);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCourses([]);
  }, []);

  const registerSelectedCourses = useCallback(async (instructorId?: number): Promise<{ success: boolean; message?: string; data?: any }> => {
    if (selectedCourses.length === 0) {
      return { success: false, message: 'No courses selected' };
    }

    setIsRegistering(true);
    try {
      console.log('Registering selected courses:', selectedCourses);
      
      // Send course IDs to backend (instructor ID is extracted from JWT token)
      const courseIds = selectedCourses.map(course => course.id);
      
      const response = await apiService.post<{ success: boolean; data: any; message?: string }>('/courses/register', {
        courseIds
      });

      console.log('Course registration result:', response);
      
      if (response.success) {
        // Clear selected courses after successful registration
        clearSelection();
        
        return { 
          success: true, 
          message: response.message || 'Courses registered successfully',
          data: response.data
        };
      } else {
        return { success: false, message: response.message || 'Registration failed' };
      }
    } catch (error: any) {
      console.error('Error registering courses:', error);
      return { success: false, message: error.response?.data?.message || error.message || 'Failed to register courses' };
    } finally {
      setIsRegistering(false);
    }
  }, [selectedCourses, clearSelection]);

  const value = useMemo<CourseSelectionContextValue>(
    () => ({
      selectedCourses,
      isCourseSelected,
      toggleCourseSelection,
      selectCourses,
      clearSelection,
      registerSelectedCourses,
      isRegistering
    }),
    [selectedCourses, isCourseSelected, toggleCourseSelection, selectCourses, clearSelection, registerSelectedCourses, isRegistering]
  );

  return <CourseSelectionContext.Provider value={value}>{children}</CourseSelectionContext.Provider>;
};

export const useCourseSelection = (): CourseSelectionContextValue => {
  const ctx = useContext(CourseSelectionContext);
  if (!ctx) throw new Error('useCourseSelection must be used within CourseSelectionProvider');
  return ctx;
};
