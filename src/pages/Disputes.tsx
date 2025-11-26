import React, { useState, useEffect } from 'react';
import { useCourse } from '../context/CourseContext';
import { disputesApiService, QaDispute, QaLogEntry } from '../api/analytics';
import { analyticsApiService } from '../api/analytics';
import { formatMarkdown } from '../utils/markdownFormatter';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const Disputes = () => {
  const { selectedCourse } = useCourse();
  const [disputes, setDisputes] = useState<QaDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<QaDispute | null>(null);
  const [qaLogDetails, setQaLogDetails] = useState<QaLogEntry | null>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [solution, setSolution] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [resolveSuccess, setResolveSuccess] = useState(false);

  useEffect(() => {
    const loadDisputes = async () => {
      if (!selectedCourse?.course_id) {
        setError('Please select a course first');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await disputesApiService.getDisputes();
        setDisputes(data);
      } catch (err: any) {
        console.error('Error loading disputes:', err);
        setError(err.message || 'Failed to load disputes');
      } finally {
        setLoading(false);
      }
    };

    loadDisputes();
  }, [selectedCourse]);

  const loadQaLogDetails = async (logId: number) => {
    try {
      const log = await disputesApiService.getQaLogById(logId);
      setQaLogDetails(log);
    } catch (err) {
      console.error('Error loading QA log details:', err);
      // Don't show error to user, just continue without QA log details
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleResolveClick = (dispute: QaDispute) => {
    setSelectedDispute(dispute);
    setSolution('');
    setResolveError(null);
    setResolveSuccess(false);
    setResolveDialogOpen(true);
    loadQaLogDetails(dispute.logId);
  };

  const handleResolveSubmit = async () => {
    if (!selectedDispute) return;

    if (!solution.trim() || solution.trim().length < 10) {
      setResolveError('Please provide a solution (at least 10 characters)');
      return;
    }

    try {
      setSubmitting(true);
      setResolveError(null);
      await disputesApiService.resolveDispute(selectedDispute.disputeId, solution.trim());
      setResolveSuccess(true);
      
      // Reload disputes after successful resolution
      setTimeout(async () => {
        const data = await disputesApiService.getDisputes();
        setDisputes(data);
        setResolveDialogOpen(false);
        setResolveSuccess(false);
        setSolution('');
        setSelectedDispute(null);
        setQaLogDetails(null);
      }, 2000);
    } catch (err: any) {
      console.error('Error resolving dispute:', err);
      setResolveError(err.message || 'Failed to resolve dispute. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveCancel = () => {
    setResolveDialogOpen(false);
    setSelectedDispute(null);
    setSolution('');
    setResolveError(null);
    setResolveSuccess(false);
    setQaLogDetails(null);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'resolved') {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircleIcon className="w-4 h-4" />
          Resolved
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 flex items-center gap-1">
        <ExclamationTriangleIcon className="w-4 h-4" />
        Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vt-maroon mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading disputes...</p>
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
          <p className="text-gray-600">Please select a course to view disputes</p>
        </div>
      </div>
    );
  }

  const pendingDisputes = disputes.filter(d => d.status === 'pending');
  const resolvedDisputes = disputes.filter(d => d.status === 'resolved');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Disputes</h1>
          <p className="text-gray-600">Course: {selectedCourse.title || selectedCourse.code}</p>
          <div className="mt-4 flex gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Total Disputes</p>
              <p className="text-2xl font-bold text-vt-maroon">{disputes.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{pendingDisputes.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{resolvedDisputes.length}</p>
            </div>
          </div>
        </div>

        {disputes.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      What Was Wrong
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {disputes.map((dispute) => (
                    <tr key={dispute.disputeId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(dispute.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dispute.studentId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                        <div className="line-clamp-2" title={dispute.whatWasWrong}>
                          {dispute.whatWasWrong}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(dispute.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {dispute.status === 'pending' ? (
                          <button
                            onClick={() => handleResolveClick(dispute)}
                            className="px-4 py-2 bg-vt-maroon text-white rounded-lg hover:bg-vt-maroon/90 transition-colors"
                          >
                            Resolve
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No disputes found</p>
            <p className="text-gray-400 text-sm mt-2">There are no disputes for this course.</p>
          </div>
        )}
      </div>

      {/* Resolve Dispute Dialog */}
      {resolveDialogOpen && selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Resolve Dispute</h2>
                <p className="text-sm text-gray-600 mt-1">Dispute ID: {selectedDispute.disputeId}</p>
              </div>
              <button
                onClick={handleResolveCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {resolveSuccess ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircleIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Dispute Resolved!</h3>
                  <p className="text-gray-600">The student has been notified via email.</p>
                </div>
              ) : (
                <>
                  {/* Dispute Details */}
                  <div className="mb-6 space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">What Was Wrong:</h3>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                        {selectedDispute.whatWasWrong}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">What Was Expected:</h3>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                        {selectedDispute.whatWasExpected}
                      </p>
                    </div>
                    {qaLogDetails && (
                      <>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">Student's Question:</h3>
                          <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                            {qaLogDetails.question}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">Original AI Response:</h3>
                          <div className="prose max-w-none markdown-content bg-blue-50 p-3 rounded border border-blue-200">
                            {formatMarkdown(qaLogDetails.answer)}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Solution Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Solution/Response <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      placeholder="Provide your solution or explanation to address the student's concern. This will be emailed to the student..."
                      rows={8}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vt-maroon focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 10 characters required. This will be emailed to the student.</p>
                  </div>

                  {resolveError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{resolveError}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            {!resolveSuccess && (
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={handleResolveCancel}
                  disabled={submitting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolveSubmit}
                  disabled={submitting || !solution.trim()}
                  className="px-6 py-2 bg-vt-maroon text-white rounded-lg hover:bg-vt-maroon/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Resolving...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4" />
                      Resolve & Email Student
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Disputes;

