import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import { apiService } from '../services/ApiService';
import { useLocation } from 'react-router-dom';

type CanvasEnrollment = {
  id: string;
  course_id: number;
  course_name: string;
  enrollment_state: string;
  role: string;
};

type RegisteredCourse = {
  courseId: number;
  courseName: string;
  courseCode: string;
  localCourseId: number;
  canvasId: string;
};

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const { selectedCourse, setSelectedCourse, availableCourses, loadAvailableCourses, isLoading: courseLoading } = useCourse();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'register' | 'context'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Profile data
  const [canvasEnrollments, setCanvasEnrollments] = useState<CanvasEnrollment[]>([]);
  const [registeredCourses, setRegisteredCourses] = useState<RegisteredCourse[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<RegisteredCourse[]>([]); // For students
  const [profileData, setProfileData] = useState<any>(null);
  
  // Course registration state
  const [selectedCanvasCourses, setSelectedCanvasCourses] = useState<Set<number>>(new Set());
  const [isRegistering, setIsRegistering] = useState(false);

  // Show message from navigation state (e.g., from ProtectedRoute)
  useEffect(() => {
    if (location.state?.message) {
      setError(location.state.message);
      // Clear message after showing
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Load profile data on mount
  useEffect(() => {
    loadProfileData();
    // Note: loadAvailableCourses() is called from CourseContext, no need to call it here
  }, []);

  // Auto-switch to appropriate tab based on user state
  useEffect(() => {
    if (user?.role === 'instructor' && !user.hasRegisteredCourses) {
      // Instructor needs to register courses first
      setActiveTab('register');
    } else if (user?.role === 'student') {
      // Students always go to context tab (skip registration)
      setActiveTab('context');
    } else if (user && !selectedCourse) {
      setActiveTab('context');
    }
  }, [user, selectedCourse]);

  const loadProfileData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.get<{ success: boolean; data: any }>('/user/profile');
      
      if (response.success && response.data) {
        setProfileData(response.data);
        setCanvasEnrollments(response.data.canvasEnrollments || []);
        setRegisteredCourses(response.data.registeredCourses || []);
        setEnrolledCourses(response.data.enrolledCourses || []); // For students
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCourseSelection = (courseId: number) => {
    const newSelection = new Set(selectedCanvasCourses);
    if (newSelection.has(courseId)) {
      newSelection.delete(courseId);
    } else {
      newSelection.add(courseId);
    }
    setSelectedCanvasCourses(newSelection);
  };

  const handleRegisterCourses = async () => {
    if (selectedCanvasCourses.size === 0) {
      setError('Please select at least one course to register');
      return;
    }

    setIsRegistering(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await apiService.post<{ success: boolean; data: any; message?: string }>('/courses/register', {
        courseIds: Array.from(selectedCanvasCourses).map(id => id.toString())
      });
      
      if (response.success) {
        setSuccess(`Successfully registered ${response.data.registeredCourses?.length || 0} course(s)`);
        setSelectedCanvasCourses(new Set());
        
        // Refresh user data and profile
        await refreshUser();
        await loadProfileData();
        await loadAvailableCourses();
        
        // Switch to context tab
        setTimeout(() => setActiveTab('context'), 2000);
      } else {
        setError(response.message || 'Failed to register courses');
      }
    } catch (err: any) {
      console.error('Error registering courses:', err);
      setError(err.response?.data?.message || 'Failed to register courses');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSelectCourseContext = async (course: RegisteredCourse) => {
    try {
      setError(null);
      console.log('Setting course context for course:', course);
      
      await setSelectedCourse({
        id: course.localCourseId.toString(),
        course_id: course.localCourseId,
        code: course.courseCode,
        title: course.courseName,
        instructorId: user?.role === 'instructor' ? user?.entityId.toString() : undefined
      });
      
      console.log('Course context set successfully');
      setSuccess(`Course context set to: ${course.courseName}`);
    } catch (err: any) {
      console.error('Error setting course context:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to set course context');
    }
  };

  // Filter out already registered courses from Canvas enrollments
  const registeredCourseIds = new Set(registeredCourses.map(c => parseInt(c.canvasId)));
  const availableForRegistration = canvasEnrollments.filter(
    e => !registeredCourseIds.has(e.course_id)
  );

  if (isLoading && !profileData) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-vt-maroon to-vt-orange text-white rounded-lg p-6">
          <h1 className="text-3xl font-bold">User Profile</h1>
          <p className="mt-2 opacity-90">Your academic information and progress</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vt-maroon"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-vt-maroon to-vt-orange text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold">User Profile</h1>
        <p className="mt-2 opacity-90">Manage your courses and settings</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-.834-1.964-.834-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-vt-maroon text-vt-maroon'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile Information
            </button>
            {user?.role === 'instructor' && (
              <button
                onClick={() => setActiveTab('register')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'register'
                    ? 'border-vt-maroon text-vt-maroon'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Course Registration
                {!user.hasRegisteredCourses && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    Action Required
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setActiveTab('context')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'context'
                  ? 'border-vt-maroon text-vt-maroon'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Course Context
              {!selectedCourse && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  Required
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Information Tab */}
          {activeTab === 'profile' && profileData && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start space-x-6">
                  <div className="w-20 h-20 bg-vt-maroon rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{user?.name || 'User'}</h2>
                    <p className="text-gray-600 mb-1">ID: {profileData.userCode || user?.id}</p>
                    <p className="text-vt-maroon font-semibold mb-4 capitalize">{user?.role}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                        </svg>
                        <span className="text-sm">{user?.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Available Courses</span>
                    <span className="text-2xl font-bold text-vt-maroon">{canvasEnrollments.length}</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      {user?.role === 'instructor' ? 'Registered' : 'Enrolled'}
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {user?.role === 'instructor' ? registeredCourses.length : enrolledCourses.length}
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Active Context</span>
                    <span className="text-2xl font-bold text-blue-600">{selectedCourse ? '1' : '0'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Course Registration Tab (Instructor Only) */}
          {activeTab === 'register' && user?.role === 'instructor' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Register Courses</h3>
                <p className="text-gray-600 text-sm">
                  Select courses from your Canvas enrollments to register them in the system. 
                  Once registered, you can upload transcripts and manage course materials.
                </p>
              </div>

              {/* Already Registered Courses */}
              {registeredCourses.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Registered Courses</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {registeredCourses.map(course => (
                      <div key={course.courseId} className="border border-green-200 bg-green-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <h5 className="font-semibold text-gray-900">{course.courseCode}</h5>
                            </div>
                            <p className="text-gray-600 mt-1">{course.courseName}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available for Registration */}
              {availableForRegistration.length > 0 ? (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Available for Registration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableForRegistration.map(enrollment => (
                      <div
                        key={enrollment.course_id}
                        onClick={() => handleToggleCourseSelection(enrollment.course_id)}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedCanvasCourses.has(enrollment.course_id)
                            ? 'border-vt-maroon bg-red-50'
                            : 'border-gray-200 hover:border-vt-maroon'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedCanvasCourses.has(enrollment.course_id)}
                            onChange={() => handleToggleCourseSelection(enrollment.course_id)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 h-4 w-4 text-vt-maroon border-gray-300 rounded focus:ring-vt-maroon"
                          />
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">{enrollment.course_name}</h5>
                            <p className="text-sm text-gray-500 mt-1">Canvas ID: {enrollment.course_id}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedCanvasCourses.size > 0 && (
                    <div className="flex items-center justify-between pt-4">
                      <span className="text-sm text-gray-600">
                        {selectedCanvasCourses.size} course{selectedCanvasCourses.size !== 1 ? 's' : ''} selected
                      </span>
                      <button
                        onClick={handleRegisterCourses}
                        disabled={isRegistering}
                        className="bg-vt-maroon text-white px-6 py-2 rounded-lg hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isRegistering ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Registering...</span>
                          </>
                        ) : (
                          <span>Register Selected Courses</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    {registeredCourses.length > 0 
                      ? 'All your Canvas courses have been registered!' 
                      : 'No courses available for registration'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Course Context Tab */}
          {activeTab === 'context' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Course Context</h3>
                <p className="text-gray-600 text-sm">
                  Choose a course to set as your active context. This will be used for transcript uploads and other course-specific actions.
                </p>
              </div>

              {selectedCourse && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Current Context:</p>
                      <p className="font-semibold text-gray-900">{selectedCourse.title}</p>
                    </div>
                  </div>
                </div>
              )}

              {courseLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vt-maroon"></div>
                </div>
              ) : (user?.role === 'instructor' && registeredCourses.length > 0) || (user?.role === 'student' && enrolledCourses.length > 0) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Show registeredCourses for instructors, enrolledCourses for students */}
                  {(user?.role === 'instructor' ? registeredCourses : enrolledCourses).map(course => (
                    <div
                      key={course.courseId}
                      onClick={() => handleSelectCourseContext(course)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedCourse?.course_id === course.localCourseId
                          ? 'border-vt-maroon bg-red-50 ring-2 ring-vt-maroon'
                          : 'border-gray-200 hover:border-vt-maroon hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{course.courseCode}</h5>
                          <p className="text-gray-600 mt-1">{course.courseName}</p>
                          {selectedCourse?.course_id === course.localCourseId && (
                            <p className="text-sm text-vt-maroon mt-2 font-medium">✓ Active Context</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    {user?.role === 'instructor' 
                      ? 'Please register courses first in the Course Registration tab' 
                      : 'No enrolled courses found. Please contact your instructor.'}
                  </p>
                  {/* TODO: In the future, when student registration is implemented, 
                      add a button here to allow students to register for courses */}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
