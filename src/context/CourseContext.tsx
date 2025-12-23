import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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

  // Track if initial load has been done for current user to prevent duplicate calls
  const initialLoadDoneRef = useRef<string | null>(null);
  // Store pending course ID to populate details after loading courses
  const pendingCourseIdRef = useRef<number | null>(null);
  // Track if currently loading to prevent concurrent requests
  const isLoadingRef = useRef(false);

  const setSelectedCourse = useCallback(async (course: Course | null) => {
    if (!course) {
      setSelectedCourseState(null);
      return;
    }

    try {
      console.log('CourseContext - Setting course context:', course);

      // Save to backend
      await apiService.post('/courses/context', {
        courseId: course.course_id
      });

      // Update local state
      setSelectedCourseState(course);
      console.log('CourseContext - Course context set successfully');
    } catch (error: any) {
      console.error('CourseContext - Error setting course context:', error);
      throw error;
    }
  }, []);

  // Load all course data from a single API call
  // Note: This function is stable (no dependencies that change) to avoid infinite loops
  const loadAvailableCourses = useCallback(async () => {
    if (!user) return;

    // Prevent concurrent requests
    if (isLoadingRef.current) {
      console.log('CourseContext - Skipping duplicate load request');
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      // Fetch user profile with ALL course data in a single call
      const response = await apiService.get<{ success: boolean; data: any }>('/user/profile');

      if (response.success && response.data) {
        const data = response.data;

        console.log('CourseContext - Profile data loaded successfully');

        // Canvas courses available for registration (not yet registered)
        const availableCanvasCourses = data.canvasEnrollments || [];
        const formattedAvailableCourses: Course[] = availableCanvasCourses.map((c: any) => ({
          id: c.course_id.toString(),
          course_id: c.course_id,
          canvas_id: c.course_id,
          code: c.course_code || '',
          title: c.course_name || '',
          instructorId: user.entityId.toString()
        }));
        setAvailableCourses(formattedAvailableCourses);

        // For instructors: use registeredCourses (courses they teach)
        // For students: use enrolledCourses (courses they're enrolled in)
        const coursesData = user.role === 'student'
          ? (data.enrolledCourses || [])
          : (data.registeredCourses || []);

        const formattedCourses: Course[] = coursesData.map((c: any) => ({
          id: c.localCourseId?.toString() || c.courseId.toString(),
          course_id: c.localCourseId || c.courseId, // Use local DB ID
          canvas_id: parseInt(c.canvasId), // Canvas course ID for API calls
          code: c.courseCode || '',
          title: c.courseName || '',
          instructorId: user.role === 'instructor' ? user.entityId.toString() : undefined
        }));

        setRegisteredCourses(formattedCourses);

        // If we have a pending course ID to populate, find and set the full course details
        if (pendingCourseIdRef.current) {
          const fullCourse = formattedCourses.find(c => c.course_id === pendingCourseIdRef.current);
          if (fullCourse) {
            setSelectedCourseState(fullCourse);
            console.log('CourseContext - Populated selected course details:', fullCourse.title);
          }
          pendingCourseIdRef.current = null;
        }
      }
    } catch (error) {
      console.error('CourseContext - Error loading courses:', error);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [user]); // Only depends on user - removed selectedCourse to prevent circular dependencies

  // Alias for backward compatibility - now just calls the unified loader
  const loadRegisteredCourses = useCallback(async () => {
    await loadAvailableCourses();
  }, [loadAvailableCourses]);

  const clearCourseContext = useCallback(async () => {
    setSelectedCourseState(null);
    pendingCourseIdRef.current = null;
  }, []);

  // Single combined effect for initialization - handles both course context and profile loading
  useEffect(() => {
    const initializeCourseData = async () => {
      // Skip if not authenticated or no user
      if (!isAuthenticated || !user) {
        return;
      }

      // Skip if already loaded for this user (prevents duplicate calls)
      if (initialLoadDoneRef.current === user.id) {
        return;
      }

      console.log('CourseContext - Initializing for user:', user.id);
      initialLoadDoneRef.current = user.id;

      setIsLoading(true);

      try {
        // Step 1: Load saved course context from backend
        const contextResponse = await apiService.get<{
          success: boolean;
          data: { courseId: number | null; courseName: string | null } | null
        }>('/courses/context');

        if (contextResponse.success && contextResponse.data && contextResponse.data.courseId) {
          // Store the course ID - we'll populate full details after loading courses
          pendingCourseIdRef.current = contextResponse.data.courseId;

          // Set partial course info for now (title only)
          setSelectedCourseState({
            id: contextResponse.data.courseId.toString(),
            course_id: contextResponse.data.courseId,
            code: '',
            title: contextResponse.data.courseName || '',
          });
        } else {
          console.log('CourseContext - No saved course context found');
          setSelectedCourseState(null);
        }

        // Step 2: Load profile with courses (this will populate full course details)
        await loadAvailableCourses();

      } catch (error) {
        console.error('CourseContext - Error during initialization:', error);
        // Reset loading state on error
        setIsLoading(false);
      }
    };

    initializeCourseData();
  }, [isAuthenticated, user, loadAvailableCourses]);

  // Reset refs when user changes or logs out
  useEffect(() => {
    if (!user) {
      initialLoadDoneRef.current = null;
      pendingCourseIdRef.current = null;
      setSelectedCourseState(null);
      setAvailableCourses([]);
      setRegisteredCourses([]);
    }
  }, [user]);

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
