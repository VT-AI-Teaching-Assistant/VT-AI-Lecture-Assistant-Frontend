import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourse } from '../context/CourseContext';
import { analyticsApiService, AnalyticsResponse } from '../api/analytics';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Analytics = () => {
  const { selectedCourse } = useCourse();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!selectedCourse?.course_id) {
        setError('Please select a course first');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await analyticsApiService.getQaAnalytics(
          selectedCourse.course_id,
          startDate || undefined,
          endDate || undefined
        );
        setAnalytics(data);
      } catch (err: any) {
        console.error('Error loading analytics:', err);
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    if (selectedCourse?.course_id && startDate && endDate) {
      loadAnalytics();
    }
  }, [selectedCourse, startDate, endDate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleViewStudentQuestions = (studentId: number, studentName: string) => {
    navigate(`/analytics/student/${studentId}?studentName=${encodeURIComponent(studentName)}`);
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!analytics?.questionsPerDay || analytics.questionsPerDay.length === 0) return [];
    return analytics.questionsPerDay.map(item => ({
      date: formatDateShort(item.date),
      fullDate: item.date,
      count: item.count || 0
    }));
  }, [analytics]);

  const studentChartData = useMemo(() => {
    if (!analytics?.questionsByStudent || analytics.questionsByStudent.length === 0) return [];
    return analytics.questionsByStudent
      .slice(0, 10) // Top 10 students
      .map(item => ({
        name: item.studentName && item.studentName.length > 20 
          ? item.studentName.substring(0, 20) + '...' 
          : item.studentName || 'Unknown',
        fullName: item.studentName || 'Unknown',
        count: item.questionCount || 0,
        studentId: item.studentId
      }))
      .reverse(); // Reverse to show highest at top
  }, [analytics]);

  const modelChartData = useMemo(() => {
    if (!analytics?.modelUsageStats || analytics.modelUsageStats.length === 0) return [];
    return analytics.modelUsageStats.map(item => ({
      name: item.modelUsed || 'Unknown',
      value: item.count || 0,
      avgLatency: item.avgLatency ? Math.round(item.avgLatency) : null
    }));
  }, [analytics]);

  // Color palette for charts
  const COLORS = ['#861F41', '#E5751F', '#630031', '#FF6600', '#54585A', '#8B4513', '#CD853F', '#A0522D'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vt-maroon mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!selectedCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please select a course to view analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Usage Analytics</h1>
          <p className="text-gray-600">Course: {selectedCourse.title || selectedCourse.code}</p>
        </div>

        {/* Date Range Picker */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h2>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vt-maroon focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vt-maroon focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Questions</h3>
            <p className="text-4xl font-bold text-vt-maroon">{analytics?.totalQuestions || 0}</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active Students</h3>
            <p className="text-4xl font-bold text-vt-maroon">{analytics?.questionsByStudent?.length || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Students who asked questions</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Date Range</h3>
            <p className="text-2xl font-bold text-vt-maroon">
              {analytics?.questionsPerDay?.length || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Days with activity</p>
          </div>
        </div>

        {/* Daily Question Trends - Line/Area Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Question Trends</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#861F41" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#861F41" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  style={{ fontSize: '12px' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [value, 'Questions']}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#861F41" 
                  fillOpacity={1} 
                  fill="url(#colorCount)"
                  name="Questions"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-gray-500">No questions found for the selected date range</p>
            </div>
          )}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Student Engagement - Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Student Engagement</h2>
            {studentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={studentChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis type="number" stroke="#666" style={{ fontSize: '12px' }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#666" 
                    style={{ fontSize: '12px' }}
                    width={120}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, payload: any) => {
                      const fullName = payload?.payload?.fullName || payload?.name || 'Student';
                      return [`${value} questions`, fullName];
                    }}
                  />
                  <Bar dataKey="count" fill="#861F41" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-500">No student data available</p>
              </div>
            )}
          </div>

          {/* Model Usage - Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Model Usage Distribution</h2>
            {modelChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={modelChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {modelChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, payload: any) => {
                      const avgLatency = payload?.payload?.avgLatency || payload?.avgLatency;
                      const latencyText = avgLatency ? ` (Avg: ${Math.round(avgLatency)}ms)` : '';
                      return [`${value} questions${latencyText}`, 'Usage'];
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => value}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-500">No model usage data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Calendar Heatmap */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Calendar</h2>
          {chartData.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="flex gap-1 flex-wrap justify-start min-w-[600px]">
                {chartData.map((item, index) => {
                  const maxCount = Math.max(...chartData.map(d => d.count), 1);
                  const intensity = item.count / maxCount;
                  const bgColor = intensity > 0.7 
                    ? 'bg-vt-maroon' 
                    : intensity > 0.4 
                    ? 'bg-vt-maroon/70' 
                    : intensity > 0.1
                    ? 'bg-vt-maroon/40'
                    : 'bg-gray-100';
                  
                  return (
                    <div
                      key={index}
                      className={`${bgColor} w-8 h-8 rounded text-white text-xs flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-vt-maroon transition-all`}
                      title={`${item.fullDate}: ${item.count} questions`}
                    >
                      {item.count > 0 ? item.count : ''}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <div className="w-4 h-4 bg-vt-maroon/40 rounded"></div>
                  <div className="w-4 h-4 bg-vt-maroon/70 rounded"></div>
                  <div className="w-4 h-4 bg-vt-maroon rounded"></div>
                </div>
                <span>More</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No activity data available</p>
          )}
        </div>

        {/* Questions By Student Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Students</h2>
          {analytics?.questionsByStudent && analytics.questionsByStudent.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.questionsByStudent.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.studentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-vt-maroon">
                        {item.questionCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewStudentQuestions(item.studentId, item.studentName)}
                          className="px-4 py-2 bg-vt-maroon text-white rounded-lg hover:bg-vt-maroon/90 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No student questions found for this course</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;

