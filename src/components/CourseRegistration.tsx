import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCourse, Course } from '../context/CourseContext';
import { useCourseSelection } from '../context/CourseSelectionContext';
import { useUserProfile } from '../context/UserProfileContext';

const CourseRegistration = () => {
  const { user } = useAuth();
  const { availableCourses, loadAvailableCourses, isLoading } = useCourse();
  const { selectedCourses, toggleCourseSelection, registerSelectedCourses, isRegistering } = useCourseSelection();
  const { getInstructorId } = useUserProfile();
  const [step, setStep] = useState<'select' | 'register' | 'enrolled'>('select');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [totalEnrolledStudents, setTotalEnrolledStudents] = useState(0);
  const [syllabi, setSyllabi] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === 'instructor') {
      loadAvailableCourses();
    }
  }, [user, loadAvailableCourses]);

  const handleRegisterCourses = async () => {
    const instructorId = getInstructorId();
    if (!instructorId) {
      setMessage({ type: 'error', text: 'Instructor ID not found. Please refresh and try again.' });
      return;
    }

    const result = await registerSelectedCourses(instructorId);
    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Courses registered successfully!' });
      
      // Extract enrolled students and syllabi from the result
      if (result.data) {
        setEnrolledStudents(result.data.enrolledStudents || []);
        setTotalEnrolledStudents(result.data.totalEnrolledStudents || 0);
        setSyllabi(result.data.syllabi || []);
      }
      
      setStep('enrolled');
    } else {
      setMessage({ type: 'error', text: result.message || 'Failed to register courses.' });
    }
  };

  if (user?.role !== 'instructor') {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-vt-maroon mb-2">Course Registration</h1>
          <p className="text-gray-600">
            Select the courses you are teaching this semester. You can register multiple courses at once.
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

        {step === 'select' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Courses</h2>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vt-maroon mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading courses...</p>
                </div>
              ) : availableCourses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No courses found. Please check your Canvas integration.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {availableCourses.map((course) => (
                    <div
                      key={course.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedCourses.some(c => c.id === course.id)
                          ? 'border-vt-maroon bg-vt-maroon bg-opacity-5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleCourseSelection(course)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{course.title}</h3>
                          <p className="text-sm text-gray-600">{course.code} • {course.credits} credits</p>
                        </div>
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          selectedCourses.some(c => c.id === course.id)
                            ? 'border-vt-maroon bg-vt-maroon'
                            : 'border-gray-300'
                        }`}>
                          {selectedCourses.some(c => c.id === course.id) && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedCourses.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Selected Courses ({selectedCourses.length})</h3>
                <div className="space-y-2">
                  {selectedCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{course.code} - {course.title}</span>
                      <button
                        onClick={() => toggleCourseSelection(course)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleRegisterCourses}
                disabled={selectedCourses.length === 0 || isRegistering}
                className="bg-vt-maroon text-white px-6 py-2 rounded-lg hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRegistering ? 'Registering...' : `Register ${selectedCourses.length} Course${selectedCourses.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}

        {step === 'enrolled' && (
          <div>
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Registration Complete!</h2>
              <p className="text-gray-600 mb-6">
                You have successfully registered {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''}. 
                Students have been enrolled and syllabi have been fetched.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-600">Courses Registered</p>
                    <p className="text-2xl font-bold text-blue-900">{selectedCourses.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600">Students Enrolled</p>
                    <p className="text-2xl font-bold text-green-900">{totalEnrolledStudents}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-600">Syllabi Fetched</p>
                    <p className="text-2xl font-bold text-purple-900">{syllabi.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enrolled Students Preview */}
            {enrolledStudents.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrolled Students Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {enrolledStudents.slice(0, 9).map((student, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-vt-maroon rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {student.name?.charAt(0) || 'S'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {student.name || 'Unknown Student'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {student.email || 'No email'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {totalEnrolledStudents > 9 && (
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    And {totalEnrolledStudents - 9} more students...
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setStep('select')}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Register More Courses
              </button>
              <button
                onClick={() => setStep('select')}
                className="bg-vt-maroon text-white px-6 py-2 rounded-lg hover:bg-red-800 transition-colors"
              >
                Continue to Course Context
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseRegistration;
