import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCourse, Course } from '../context/CourseContext';
import { useUserProfile } from '../context/UserProfileContext';

const CourseContextSelection = () => {
  const { user } = useAuth();
  const { selectedCourse, registeredCourses, setSelectedCourse, loadRegisteredCourses, isLoading } = useCourse();
  const { getInstructorId } = useUserProfile();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadRegisteredCourses();
  }, [loadRegisteredCourses]);

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setMessage({ type: 'success', text: `Course context set to ${course.code} - ${course.title}` });
  };

  const handleClearContext = () => {
    setSelectedCourse(null);
    setMessage({ type: 'success', text: 'Course context cleared' });
  };

  if (!user) {
    return null;
  }

  const isInstructor = user.role === 'instructor';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-vt-maroon mb-2">
            {isInstructor ? 'Set Course Context' : 'Select Course Context'}
          </h1>
          <p className="text-gray-600">
            {isInstructor 
              ? 'Choose which course you want to work with. This will be the context for all your activities.'
              : 'Select the course you want to view and interact with.'
            }
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {selectedCourse && (
          <div className="mb-6 bg-vt-maroon bg-opacity-5 border border-vt-maroon rounded-lg p-4">
            <h3 className="font-semibold text-vt-maroon mb-2">Current Course Context</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{selectedCourse.title}</p>
                <p className="text-sm text-gray-600">{selectedCourse.code}</p>
              </div>
              <button
                onClick={handleClearContext}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Change Course
              </button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {isInstructor ? 'Your Teaching Courses' : 'Your Enrolled Courses'}
          </h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vt-maroon mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading courses...</p>
            </div>
          ) : registeredCourses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>
                {isInstructor 
                  ? 'No teaching courses found. Please register courses first.'
                  : 'No enrolled courses found. Please check your enrollment.'
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {registeredCourses.map((course) => (
                <div
                  key={course.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedCourse?.id === course.id
                      ? 'border-vt-maroon bg-vt-maroon bg-opacity-5'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleCourseSelect(course)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-600">{course.code}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedCourse?.id === course.id
                        ? 'border-vt-maroon bg-vt-maroon'
                        : 'border-gray-300'
                    }`}>
                      {selectedCourse?.id === course.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedCourse && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <p className="text-green-800 font-medium">
                Course context is set! You can now access all course-related features.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseContextSelection;
