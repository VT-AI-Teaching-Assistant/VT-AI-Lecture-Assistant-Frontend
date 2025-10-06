import React, { useEffect, useState } from 'react';
import { UserProfile, Course } from '../models';
import { PresenterFactory } from '../presenters';
import { useAsyncState, ErrorHandler } from '../utils/errorHandling';
import { useAuth } from '../context/AuthContext';
import { useCourseSelection } from '../context/CourseSelectionContext';
import { useUserProfile } from '../context/UserProfileContext';
import { useCourse } from '../context/CourseContext';
import CourseRegistration from '../components/CourseRegistration';
import CourseContextSelection from '../components/CourseContextSelection';

const Profile = () => {
  // Get user role from auth context to determine which Canvas token to use
  const { user } = useAuth();
  const { 
    selectedCourses, 
    isCourseSelected, 
    toggleCourseSelection, 
    registerSelectedCourses, 
    isRegistering 
  } = useCourseSelection();
  const { profile, instructorData, setProfile, setInstructorData, getInstructorId } = useUserProfile();
  const { isCourseContextSet } = useCourse();
  const presenter = PresenterFactory.getUserProfilePresenter();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'register' | 'context'>('profile');
  
  const profileState = useAsyncState<UserProfile>();
  const coursesState = useAsyncState<Course[]>();

  const handleRegisterCourses = async () => {
    // Get instructor ID from saved profile data
    const instructorId = getInstructorId();
    
    console.log('Profile: Attempting to register courses');
    console.log('Profile: Current instructor data:', instructorData);
    console.log('Profile: Instructor ID from context:', instructorId);
    console.log('Profile: User role:', user?.role);
    
    if (!instructorId) {
      console.error('No instructor ID found - user must be an instructor and profile must be loaded');
      console.log('Profile: Checking localStorage directly...');
      const localStorageData = localStorage.getItem('vt-ai-instructor-data');
      console.log('Profile: localStorage instructor data:', localStorageData);
      return;
    }
    
    const result = await registerSelectedCourses(instructorId);
    if (result.success) {
      console.log('Courses registered successfully');
      // You could add a success notification here
    } else {
      console.error('Failed to register courses:', result.message);
      // You could add an error notification here
    }
  };

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const userRole = user?.role || 'student'; // Default to student if no user
        console.log('Profile: Starting to load profile from Canvas API for role:', userRole);
        profileState.setLoading();
        const profile = await presenter.loadProfile('canvas-user', userRole); // Pass role to get correct Canvas token
        console.log('Profile: Received profile data:', profile);
        if (profile) {
          profileState.setSuccess(profile);
          setProfile(profile); // Save profile to context
          
          // Use courses from profile data instead of separate API call
          coursesState.setSuccess(profile.enrolledCourses || []);
          console.log('Profile: Successfully set profile and courses data');
          
          // Check if instructor data was saved to localStorage
          const savedInstructorData = localStorage.getItem('vt-ai-instructor-data');
          console.log('Profile: Instructor data saved to localStorage:', savedInstructorData);
        } else {
          console.log('Profile: No profile data received');
          profileState.setError('Failed to load profile');
        }
      } catch (error) {
        console.error('Profile: Error loading profile:', error);
        profileState.setError(ErrorHandler.handle(error));
      }
    };

    loadProfileData();
  }, [user?.role, setProfile]); // Re-run when user role changes

  // Load instructor data from localStorage when component mounts
  useEffect(() => {
    console.log('Profile: useEffect for loading instructor data triggered');
    const instructorDataRaw = localStorage.getItem('vt-ai-instructor-data');
    console.log('Profile: Raw instructor data from localStorage:', instructorDataRaw);
    
    if (instructorDataRaw) {
      try {
        const instructorData = JSON.parse(instructorDataRaw);
        setInstructorData(instructorData);
        console.log('Profile: Successfully loaded instructor data from localStorage:', instructorData);
      } catch (error) {
        console.error('Profile: Error parsing instructor data from localStorage:', error);
        localStorage.removeItem('vt-ai-instructor-data');
      }
    } else {
      console.log('Profile: No instructor data found in localStorage');
    }
  }, [setInstructorData]);

  // Fallback data for development/demo - role-aware
  const fallbackProfile: UserProfile = {
    id: "1",
    userId: "canvas-user",
    userCode: user?.role === 'instructor' ? 'VT2024002' : 'VT2024001',
    name: user?.role === 'instructor' ? 'Dr. Kashyap' : 'Sarthak Mohan Raut',
    email: user?.role === 'instructor' ? 'kashyap@vt.edu' : 'sarthak@vt.edu',
    major: 'Computer Science',
    year: user?.role === 'instructor' ? 'Professor' : 'Graduate Student',
    gpa: user?.role === 'instructor' ? 'N/A' : '3.87',
    phone: '(540) 555-0123',
    totalCredits: user?.role === 'instructor' ? 0 : 98,
    currentSemesterCredits: user?.role === 'instructor' ? 0 : 12,
    completedAssignments: user?.role === 'instructor' ? 0 : 47,
    dueSoon: user?.role === 'instructor' ? 0 : 5,
    enrolledCourses: []
  };

  const fallbackCourses: Course[] = [
    {
      id: "1",
      code: "CS 3114",
      title: "Data Structures & Algorithms",
      credits: 3,
      instructorId: "instructor1",
      semester: "Spring",
      year: 2024
    },
    {
      id: "2",
      code: "CS 3704", 
      title: "Intermediate Software Design",
      credits: 3,
      instructorId: "instructor2",
      semester: "Spring",
      year: 2024
    },
    {
      id: "3",
      code: "CS 4104",
      title: "Computer Architecture", 
      credits: 3,
      instructorId: "instructor3",
      semester: "Spring",
      year: 2024
    },
    {
      id: "4",
      code: "MATH 2214",
      title: "Introduction to Differential Equations",
      credits: 3,
      instructorId: "instructor4",
      semester: "Spring",
      year: 2024
    }
  ];

  const userData = profileState.data || fallbackProfile;
  const currentCourses = coursesState.data || fallbackCourses;

  if (profileState.isLoading) {
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

  if (profileState.error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-vt-maroon to-vt-orange text-white rounded-lg p-6">
          <h1 className="text-3xl font-bold">User Profile</h1>
          <p className="mt-2 opacity-90">Your academic information and progress</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-red-800">Error loading profile</h3>
              <p className="text-red-600 mt-1">{profileState.error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-vt-maroon to-vt-orange text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold">User Profile</h1>
        <p className="mt-2 opacity-90">Your academic information and progress</p>
      </div>

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
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Information Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start space-x-6">
                    <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-600">
                        {userData.name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{userData.name || 'User'}</h2>
                      <p className="text-lg text-gray-600 mb-1">User ID: {userData.userCode}</p>
                      <p className="text-lg text-vt-maroon font-semibold mb-4">{userData.major} • {userData.year}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                          </svg>
                          <span className="text-sm">{userData.email || 'student@vt.edu'}</span>
                        </div>
                        {userData.phone && (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                            <span className="text-sm">{userData.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        GPA: {userData.gpa}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5 text-vt-maroon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                        </svg>
                        <span className="font-semibold text-gray-900">Total Credits</span>
                      </div>
                      <span className="text-2xl font-bold text-vt-maroon">{userData.totalCredits}</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M8 2v4"></path>
                          <path d="M16 2v4"></path>
                          <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                          <path d="M3 10h18"></path>
                        </svg>
                        <span className="font-semibold text-gray-900">This Semester</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">{userData.currentSemesterCredits}</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <circle cx="12" cy="8" r="6"></circle>
                          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
                        </svg>
                        <span className="font-semibold text-gray-900">Completed</span>
                      </div>
                      <span className="text-2xl font-bold text-green-600">{userData.completedAssignments}</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span className="font-semibold text-gray-900">Due Soon</span>
                      </div>
                      <span className="text-2xl font-bold text-orange-600">{userData.dueSoon}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Courses */}
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Current Courses</h3>
                      <p className="text-gray-600 mt-1">Spring 2024 Semester</p>
                    </div>
                    {selectedCourses.length > 0 && (
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected
                        </span>
                        <button
                          onClick={handleRegisterCourses}
                          disabled={isRegistering}
                          className="bg-vt-maroon text-white px-4 py-2 rounded-lg hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
                </div>
                <div className="p-6">
                  {coursesState.isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vt-maroon"></div>
                    </div>
                  ) : coursesState.error ? (
                    <div className="text-center text-red-600 py-8">
                      <p>Error loading courses: {coursesState.error}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentCourses.map((course: Course) => {
                        const isSelected = isCourseSelected(course.id);
                        return (
                          <div 
                            key={course.id} 
                            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                              isSelected 
                                ? 'border-vt-maroon bg-red-50 shadow-md' 
                                : 'border-gray-200 hover:border-vt-maroon hover:shadow-sm'
                            }`}
                            onClick={() => toggleCourseSelection(course)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleCourseSelection(course)}
                                    className="h-4 w-4 text-vt-maroon border-gray-300 rounded focus:ring-vt-maroon"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <h4 className="font-semibold text-gray-900 text-lg">{course.code}</h4>
                                </div>
                                <p className="text-gray-600 mt-1 ml-6">{course.title}</p>
                                <p className="text-sm text-gray-500 mt-1 ml-6">{course.semester} {course.year}</p>
                              </div>
                              <span className="text-sm font-medium text-vt-maroon bg-red-50 px-2 py-1 rounded">
                                {course.credits} Credits
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'register' && user?.role === 'instructor' && (
            <CourseRegistration />
          )}

          {activeTab === 'context' && (
            <CourseContextSelection />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
