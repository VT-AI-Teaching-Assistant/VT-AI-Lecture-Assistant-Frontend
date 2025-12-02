import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useCourse } from '../context/CourseContext';
import { analyticsApiService, QaLogEntry } from '../api/analytics';
import { formatMarkdown } from '../utils/markdownFormatter';
import { ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';

const StudentQuestionsDetail = () => {
  const { studentId: studentIdParam } = useParams<{ studentId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { selectedCourse } = useCourse();
  
  const [studentId, setStudentId] = useState<number | null>(null);
  const [studentName, setStudentName] = useState<string>('');
  const [allStudents, setAllStudents] = useState<Array<{ studentId: number; studentName: string }>>([]);
  const [questions, setQuestions] = useState<QaLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<QaLogEntry | null>(null);

  // Load all students for the dropdown
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedCourse?.course_id) return;
      
      try {
        // Set default date range for loading students
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        const analytics = await analyticsApiService.getQaAnalytics(
          selectedCourse.course_id,
          thirtyDaysAgo.toISOString().split('T')[0],
          today.toISOString().split('T')[0]
        );
        const students = analytics.questionsByStudent.map(s => ({
          studentId: s.studentId,
          studentName: s.studentName
        }));
        setAllStudents(students);
        
        // If we have a studentId but no name yet, set it from the list
        const currentStudentId = studentId;
        if (currentStudentId) {
          const student = students.find(s => s.studentId === currentStudentId);
          if (student) {
            setStudentName(prev => prev || student.studentName);
          }
        }
      } catch (err) {
        console.error('Error loading students:', err);
      }
    };
    
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse]);

  // Initialize student from URL param or search param
  useEffect(() => {
    const idFromParam = studentIdParam ? parseInt(studentIdParam, 10) : null;
    const idFromSearch = searchParams.get('studentId') ? parseInt(searchParams.get('studentId')!, 10) : null;
    const nameFromSearch = searchParams.get('studentName') || '';
    
    const initialStudentId = idFromParam || idFromSearch;
    
    if (initialStudentId) {
      setStudentId(initialStudentId);
      if (nameFromSearch) {
        setStudentName(nameFromSearch);
      }
    }
  }, [studentIdParam, searchParams]);

  // Load questions when student changes
  useEffect(() => {
    const loadQuestions = async () => {
      if (!studentId || !selectedCourse?.course_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await analyticsApiService.getStudentQuestions(studentId);
        setQuestions(data);
        
        // Update student name if we have it from the list
        const student = allStudents.find(s => s.studentId === studentId);
        if (student && !studentName) {
          setStudentName(student.studentName);
        }
      } catch (err: any) {
        console.error('Error loading student questions:', err);
        setError(err.message || 'Failed to load student questions');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [studentId, selectedCourse]);

  const handleStudentChange = (newStudentId: number) => {
    setStudentId(newStudentId);
    const student = allStudents.find(s => s.studentId === newStudentId);
    if (student) {
      setStudentName(student.studentName);
    }
    // Update URL without page reload
    navigate(`/analytics/student/${newStudentId}?studentName=${encodeURIComponent(student?.studentName || '')}`, { replace: true });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRefresh = async () => {
    if (!studentId || !selectedCourse?.course_id) return;
    
    setLoading(true);
    setError(null);
    try {
      // Reload both students list and questions
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const [analytics, questions] = await Promise.all([
        analyticsApiService.getQaAnalytics(
          selectedCourse.course_id,
          thirtyDaysAgo.toISOString().split('T')[0],
          today.toISOString().split('T')[0]
        ),
        analyticsApiService.getStudentQuestions(studentId)
      ]);
      
      const students = analytics.questionsByStudent.map(s => ({
        studentId: s.studentId,
        studentName: s.studentName
      }));
      setAllStudents(students);
      setQuestions(questions);
      
      // Update student name
      const student = students.find(s => s.studentId === studentId);
      if (student) {
        setStudentName(student.studentName);
      }
    } catch (err: any) {
      console.error('Error refreshing:', err);
      setError(err.message || 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please select a course to view student questions</p>
        </div>
      </div>
    );
  }

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vt-maroon mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/analytics')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Questions</h1>
              <p className="text-gray-600 mt-1">Course: {selectedCourse.title || selectedCourse.code}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-vt-maroon text-white rounded-lg hover:bg-vt-maroon/90 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Student Dropdown */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
          <select
            value={studentId || ''}
            onChange={(e) => handleStudentChange(parseInt(e.target.value, 10))}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vt-maroon focus:border-transparent"
          >
            <option value="">-- Select a student --</option>
            {allStudents.map((student) => (
              <option key={student.studentId} value={student.studentId}>
                {student.studentName}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Questions Table */}
        {studentId && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {studentName ? `Questions for ${studentName}` : 'Questions'}
              </h2>
            </div>
            {questions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Question
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Latency (ms)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Model Used
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {questions.map((question, index) => (
                      <tr key={question.logId || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {question.logId || index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-lg">
                          <div className="line-clamp-2" title={question.question}>
                            {question.question}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(question.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {question.latencyMs ? `${question.latencyMs}ms` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {question.modelUsed || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedResponse(question)}
                            className="px-4 py-2 bg-vt-maroon text-white rounded-lg hover:bg-vt-maroon/90 transition-colors"
                          >
                            View Response
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">No questions found for this student</p>
              </div>
            )}
          </div>
        )}

        {!studentId && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">Please select a student to view their questions</p>
          </div>
        )}
      </div>

      {/* Response Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI Response</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {formatDate(selectedResponse.createdAt)}
                  {selectedResponse.modelUsed && ` • ${selectedResponse.modelUsed}`}
                  {selectedResponse.latencyMs && ` • ${selectedResponse.latencyMs}ms`}
                </p>
              </div>
              <button
                onClick={() => setSelectedResponse(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Question Section */}
            <div className="px-6 pt-6 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Question:</h3>
              <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200 mb-4">
                {selectedResponse.question}
              </p>
            </div>

            {/* Response Section with Markdown */}
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Response:</h3>
              <div className="prose max-w-none markdown-content bg-blue-50 p-4 rounded-lg border border-blue-200">
                {formatMarkdown(selectedResponse.answer)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentQuestionsDetail;

