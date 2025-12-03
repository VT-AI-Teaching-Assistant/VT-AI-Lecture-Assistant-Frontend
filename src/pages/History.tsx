import React, { useState, useEffect } from 'react';
import { useCourse } from '../context/CourseContext';
import { analyticsApiService, QaLogEntry } from '../api/analytics';
import { formatMarkdown } from '../utils/markdownFormatter';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const History = () => {
  const { selectedCourse } = useCourse();
  const [questions, setQuestions] = useState<QaLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<QaLogEntry | null>(null);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [selectedDisputeLog, setSelectedDisputeLog] = useState<QaLogEntry | null>(null);
  const [whatWasWrong, setWhatWasWrong] = useState('');
  const [whatWasExpected, setWhatWasExpected] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [disputeError, setDisputeError] = useState<string | null>(null);
  const [disputeSuccess, setDisputeSuccess] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      if (!selectedCourse?.course_id) {
        setError('Please select a course first');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await analyticsApiService.getMyQuestionHistory();
        setQuestions(data);
      } catch (err: any) {
        console.error('Error loading question history:', err);
        setError(err.message || 'Failed to load question history');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [selectedCourse]);

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

  const handleDisputeClick = (question: QaLogEntry) => {
    setSelectedDisputeLog(question);
    setWhatWasWrong('');
    setWhatWasExpected('');
    setDisputeError(null);
    setDisputeSuccess(false);
    setDisputeDialogOpen(true);
  };

  const handleDisputeSubmit = async () => {
    if (!selectedDisputeLog) return;

    if (!whatWasWrong.trim() || whatWasWrong.trim().length < 10) {
      setDisputeError('Please describe what was wrong (at least 10 characters)');
      return;
    }

    if (!whatWasExpected.trim() || whatWasExpected.trim().length < 10) {
      setDisputeError('Please describe what you were looking for (at least 10 characters)');
      return;
    }

    try {
      setSubmittingDispute(true);
      setDisputeError(null);
      await analyticsApiService.submitDispute(
        selectedDisputeLog.logId,
        whatWasWrong.trim(),
        whatWasExpected.trim()
      );
      setDisputeSuccess(true);
      setTimeout(() => {
        setDisputeDialogOpen(false);
        setDisputeSuccess(false);
        setWhatWasWrong('');
        setWhatWasExpected('');
        setSelectedDisputeLog(null);
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting dispute:', err);
      setDisputeError(err.message || 'Failed to submit dispute. Please try again.');
    } finally {
      setSubmittingDispute(false);
    }
  };

  const handleDisputeCancel = () => {
    setDisputeDialogOpen(false);
    setSelectedDisputeLog(null);
    setWhatWasWrong('');
    setWhatWasExpected('');
    setDisputeError(null);
    setDisputeSuccess(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vt-maroon mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your question history...</p>
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
          <p className="text-gray-600">Please select a course to view your question history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Question History</h1>
          <p className="text-gray-600">Course: {selectedCourse.title || selectedCourse.code}</p>
          <p className="text-sm text-gray-500 mt-1">View all your questions and AI responses</p>
        </div>

        {questions.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dispute
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.map((question, index) => (
                    <tr key={question.logId || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(question.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-lg">
                        <div className="line-clamp-2" title={question.question}>
                          {question.question}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {question.latencyMs ? `${question.latencyMs}ms` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedResponse(question)}
                          className="px-4 py-2 bg-vt-maroon text-white rounded-lg hover:bg-vt-maroon/90 transition-colors"
                        >
                          View Response
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDisputeClick(question)}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                        >
                          <ExclamationTriangleIcon className="w-4 h-4" />
                          Dispute
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No questions found</p>
            <p className="text-gray-400 text-sm mt-2">You haven't asked any questions in this course yet.</p>
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
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Question:</h3>
              <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200 mb-4">
                {selectedResponse.question}
              </p>
            </div>

            {/* Response Section with Markdown */}
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">AI Response:</h3>
              <div className="prose max-w-none markdown-content bg-blue-50 p-4 rounded-lg border border-blue-200">
                {formatMarkdown(selectedResponse.answer)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Dialog */}
      {disputeDialogOpen && selectedDisputeLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">Dispute AI Response</h2>
              </div>
              <button
                onClick={handleDisputeCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {disputeSuccess ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Dispute Submitted Successfully!</h3>
                  <p className="text-gray-600">The TA has been notified and will review your dispute.</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Question:</h3>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                      {selectedDisputeLog.question}
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What was wrong in the answer? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={whatWasWrong}
                      onChange={(e) => setWhatWasWrong(e.target.value)}
                      placeholder="Describe what was incorrect or unsatisfactory in the AI's response..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 10 characters required</p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What were you exactly looking for? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={whatWasExpected}
                      onChange={(e) => setWhatWasExpected(e.target.value)}
                      placeholder="Describe what you expected or were hoping to receive..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 10 characters required</p>
                  </div>

                  {disputeError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{disputeError}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            {!disputeSuccess && (
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={handleDisputeCancel}
                  disabled={submittingDispute}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisputeSubmit}
                  disabled={submittingDispute || !whatWasWrong.trim() || !whatWasExpected.trim()}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submittingDispute ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      Inform TA
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

export default History;

