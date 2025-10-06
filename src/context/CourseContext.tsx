import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

export type Course = {
  id: string;
  code: string;
  title: string;
  credits: number;
  instructorId: string;
  semester: string;
  year: number;
};

export type CourseContextValue = {
  selectedCourse: Course | null;
  availableCourses: Course[];
  isCourseContextSet: boolean;
  setSelectedCourse: (course: Course | null) => void;
  loadAvailableCourses: () => Promise<void>;
  clearCourseContext: () => void;
  isLoading: boolean;
};

const CourseContext = createContext<CourseContextValue | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'vt-ai-selected-course';

export const CourseProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedCourse, setSelectedCourseState] = useState<Course | null>(null);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load selected course from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Course;
        setSelectedCourseState(parsed);
      } catch {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, []);

  // Save selected course to localStorage whenever it changes
  useEffect(() => {
    if (selectedCourse) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(selectedCourse));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [selectedCourse]);

  const setSelectedCourse = useCallback((course: Course | null) => {
    setSelectedCourseState(course);
  }, []);

  const loadAvailableCourses = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // For instructors, fetch their teaching courses
      // For students, fetch their enrolled courses
      const role = user.role;
      const response = await fetch(`http://localhost:3167/api/user/profile?role=${role}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.enrolledCourses) {
          setAvailableCourses(data.data.enrolledCourses);
        }
      }
    } catch (error) {
      console.error('Error loading available courses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const clearCourseContext = useCallback(() => {
    setSelectedCourseState(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  const isCourseContextSet = Boolean(selectedCourse);

  const value = useMemo<CourseContextValue>(
    () => ({
      selectedCourse,
      availableCourses,
      isCourseContextSet,
      setSelectedCourse,
      loadAvailableCourses,
      clearCourseContext,
      isLoading,
    }),
    [selectedCourse, availableCourses, isCourseContextSet, setSelectedCourse, loadAvailableCourses, clearCourseContext, isLoading]
  );

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
};

export const useCourse = (): CourseContextValue => {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourse must be used within CourseProvider');
  return ctx;
};
