import React, { useState } from 'react';
import {
  ChartBarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useCourse } from '../context/CourseContext';

type Score = { points: number; total: number; percentage: number } | null;

type GradeRow = {
  id: number;
  assignment: string;
  category: 'Assignment' | 'Project' | 'Exam' | 'Quiz' | 'Lab' | string;
  dueDate: string;
  score: Score;
  status: 'pending' | 'submitted' | 'graded' | string;
  feedback: string;
};

const Grades = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const { selectedCourse } = useCourse();

  const gradesData: GradeRow[] = [
    {
      id: 1,
      assignment: "Hash Table Implementation",
      category: "Assignment",
      dueDate: "Mar 14, 2024",
      score: null,
      status: "pending",
      feedback: "No feedback available"
    },
    {
      id: 2,
      assignment: "Binary Tree Project",
      category: "Project",
      dueDate: "Feb 29, 2024",
      score: null,
      status: "submitted",
      feedback: "No feedback available"
    },
    {
      id: 3,
      assignment: "Midterm Exam",
      category: "Exam",
      dueDate: "Feb 14, 2024",
      score: { points: 85, total: 100, percentage: 85.0 },
      status: "graded",
      feedback: "Good overall performance. Focus on tree algorithm optimizations for final."
    },
    {
      id: 4,
      assignment: "Stack & Queue Assignment",
      category: "Assignment",
      dueDate: "Jan 31, 2024",
      score: { points: 92, total: 100, percentage: 92.0 },
      status: "graded",
      feedback: "Well-structured code. Consider edge cases for empty stack operations."
    },
    {
      id: 5,
      assignment: "Big O Analysis Quiz",
      category: "Quiz",
      dueDate: "Jan 24, 2024",
      score: { points: 88, total: 100, percentage: 88.0 },
      status: "graded",
      feedback: "Strong understanding of time complexity. Review space complexity concepts."
    },
    {
      id: 6,
      assignment: "Array Implementation Lab",
      category: "Lab",
      dueDate: "Jan 19, 2024",
      score: { points: 95, total: 100, percentage: 95.0 },
      status: "graded",
      feedback: "Excellent implementation! Good use of defensive programming practices."
    }
  ];

  const filteredGrades = gradesData.filter((grade) => {
    const matchesFilter = selectedFilter === 'All' || grade.category === selectedFilter;
    const matchesSearch = grade.assignment.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status: GradeRow['status']) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="m15 9-6 6"></path>
            <path d="m9 9 6 6"></path>
          </svg>
        );
      case 'submitted':
        return (
          <svg className="h-4 w-4 text-yellow-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        );
      case 'graded':
        return (
          <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <path d="m9 11 3 3L22 4"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  const getScoreColor = (score: Exclude<Score, null>): string => {
    if (score.percentage >= 90) return 'text-green-600';
    if (score.percentage >= 80) return 'text-blue-600';
    if (score.percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-vt-maroon to-vt-orange text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold">Grade Center</h1>
        <p className="mt-2 opacity-90">
          {selectedCourse 
            ? `Track your academic progress and performance for ${selectedCourse.code} - ${selectedCourse.title}`
            : 'Track your academic progress and performance'
          }
        </p>
        {selectedCourse && (
          <div className="mt-3 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm inline-block">
            Current Course: {selectedCourse.code}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Average</p>
              <p className="text-3xl font-bold text-vt-maroon">90.0%</p>
            </div>
            <svg className="h-12 w-12 text-vt-maroon opacity-20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
              <polyline points="16 7 22 7 22 13"></polyline>
            </svg>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500">360/400 points</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">4</p>
            </div>
            <svg className="h-12 w-12 text-green-600 opacity-20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="6"></circle>
              <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
            </svg>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-600">1</p>
            </div>
            <svg className="h-12 w-12 text-yellow-600 opacity-20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-3xl font-bold text-blue-600">1</p>
            </div>
            <svg className="h-12 w-12 text-blue-600 opacity-20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M8 2v4"></path>
              <path d="M16 2v4"></path>
              <rect width="18" height="18" x="3" y="4" rx="2"></rect>
              <path d="M3 10h18"></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="text-vt-maroon h-6 w-6" />
              <h2 className="text-xl font-bold text-gray-900">Assignment Grades</h2>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vt-maroon focus:border-transparent"
                />
              </div>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                <select 
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vt-maroon focus:border-transparent"
                >
                  <option value="All">All Categories</option>
                  <option value="Assignment">Assignments</option>
                  <option value="Quiz">Quizzes</option>
                  <option value="Exam">Exams</option>
                  <option value="Project">Projects</option>
                </select>
              </div>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vt-maroon focus:border-transparent">
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="score">Sort by Score</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feedback
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGrades.map((grade) => (
                <tr key={grade.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{grade.assignment}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {grade.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {grade.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {grade.score ? (
                      <div className="text-sm">
                        <span className={`font-bold ${getScoreColor(grade.score)}`}>
                          {grade.score.points}/{grade.score.total}
                        </span>
                        <span className="text-gray-500 ml-1">({grade.score.percentage}%)</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(grade.status)}
                      <span className="text-sm text-gray-600 capitalize">{grade.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {grade.feedback}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Grades;
