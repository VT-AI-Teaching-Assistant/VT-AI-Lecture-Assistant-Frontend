import React, { useEffect, useState } from 'react';
import { useCourse } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/ApiService';

type Student = {
  student_id: number;
  name: string;
  email: string;
  canvas_student_id?: number;
  created_at: string;
  updated_at: string;
};

type Enrollment = {
  enrollment_id: number;
  course_id: number;
  student_id: number;
  created_at: string;
};

const Students = () => {
  const { selectedCourse } = useCourse();
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCourse && user?.role === 'instructor') {
      fetchCourseStudents();
    }
  }, [selectedCourse, user]);

  const fetchCourseStudents = async () => {
    if (!selectedCourse?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const localCourseId = selectedCourse.course_id;
      console.log(`Fetching students for local course ID: ${localCourseId} (selectedCourse.id: ${selectedCourse.id})`);
      const response = await apiService.get<{ success: boolean; data: { students: Student[]; enrollments: Enrollment[] }; message?: string }>(`/courses/${localCourseId}/students`);

      console.log(`Response:`, response);
      
      if (response.success && response.data) {
        console.log('Students API response:', response);
        setStudents(response.data.students || []);
        setEnrollments(response.data.enrollments || []);
      } else {
        console.error(`API Error:`, response);
        throw new Error(`Failed to fetch students: ${response.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err instanceof Error ? err.message : 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // Backend already filters by course; use returned students directly
  const enrolledStudents = students;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-vt-maroon to-vt-orange text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold">Course Students</h1>
        <p className="mt-2 opacity-90">
          {selectedCourse 
            ? `Manage enrolled students for ${selectedCourse.code} - ${selectedCourse.title}`
            : 'Manage enrolled students'
          }
        </p>
        {selectedCourse && (
          <div className="mt-3 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm inline-block">
            Current Course: {selectedCourse.code}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-vt-maroon">{enrolledStudents.length}</p>
            </div>
            <svg className="h-12 w-12 text-vt-maroon opacity-20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Students</p>
              <p className="text-3xl font-bold text-green-600">{enrolledStudents.length}</p>
            </div>
            <svg className="h-12 w-12 text-green-600 opacity-20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <path d="m9 11 3 3L22 4"></path>
            </svg>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Canvas Sync</p>
              <p className="text-3xl font-bold text-blue-600">
                {enrolledStudents.filter(s => s.canvas_student_id).length}
              </p>
            </div>
            <svg className="h-12 w-12 text-blue-600 opacity-20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M3 21v-5h5"></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Enrolled Students</h2>
          <p className="text-gray-600 mt-1">
            {selectedCourse ? `${selectedCourse.code} - ${selectedCourse.title}` : 'Course Students'}
          </p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {loading && (
            <div className="p-6 text-gray-600">Loading students…</div>
          )}
          {error && (
            <div className="p-6 text-red-600">{error}</div>
          )}
          {!loading && !error && enrolledStudents.length === 0 && (
            <div className="p-6 text-gray-600">No students enrolled in this course.</div>
          )}
          {!loading && !error && enrolledStudents.map((student) => (
            <div key={student.student_id} className="p-6 transition-all duration-200 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-vt-maroon rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-medium">
                      {student.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {student.name}
                    </h3>
                    <p className="text-gray-600">{student.email}</p>
                    {student.canvas_student_id && (
                      <p className="text-sm text-blue-600 mt-1">
                        Canvas ID: {student.canvas_student_id}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <path d="m9 11 3 3L22 4"></path>
                    </svg>
                    <span>Enrolled</span>
                  </div>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                    </svg>
                    <span>Profile</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Students;
