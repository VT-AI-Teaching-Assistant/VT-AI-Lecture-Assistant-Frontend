import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Course } from '../models';

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

    if (!instructorId) {
      return { success: false, message: 'Instructor ID is required' };
    }

    setIsRegistering(true);
    try {
      console.log('Registering selected courses:', selectedCourses, 'for instructor:', instructorId);
      
      // Send course IDs and instructor ID to backend for registration and course details fetching
      const courseIds = selectedCourses.map(course => course.id);
      
      const response = await fetch('http://localhost:3167/api/courses/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseIds, instructor_id: instructorId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Course registration result:', result);
      
      return { 
        success: true, 
        message: result.message || 'Courses registered successfully',
        data: result.data
      };
    } catch (error) {
      console.error('Error registering courses:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Failed to register courses' };
    } finally {
      setIsRegistering(false);
    }
  }, [selectedCourses]);

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
