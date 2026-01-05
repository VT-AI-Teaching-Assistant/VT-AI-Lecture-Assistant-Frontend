/**
 * KnowledgeBaseDashboard Component
 *
 * Displays a detailed view of all course content and their vectorization status.
 * Shows instructors what content has been added to the knowledge base.
 */

import React, { useState, useEffect } from 'react';
import {
  getKnowledgeBaseDashboard,
  revectorizeRemaining,
  KnowledgeBaseDashboardResponse,
  KnowledgeBaseContentItem,
} from '../api/vectorization';

interface KnowledgeBaseDashboardProps {
  courseId: number;
}

const KnowledgeBaseDashboard: React.FC<KnowledgeBaseDashboardProps> = ({ courseId }) => {
  const [dashboard, setDashboard] = useState<KnowledgeBaseDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('title');
  const [retryingFailed, setRetryingFailed] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, [courseId]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await getKnowledgeBaseDashboard(courseId);
      setDashboard(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch knowledge base dashboard:', err);
      setError('Failed to load knowledge base dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryFailed = async () => {
    try {
      setRetryingFailed(true);
      setError(null);
      const result = await revectorizeRemaining(courseId);
      // Refresh dashboard
      await fetchDashboard();
      alert(`Queued ${result.jobsQueued} failed items for retry`);
    } catch (err) {
      console.error('Failed to retry failed items:', err);
      setError('Failed to queue items for retry');
    } finally {
      setRetryingFailed(false);
    }
  };

  const getStatusBadgeColor = (vectorStatus: string): string => {
    switch (vectorStatus) {
      case 'READY':
        return 'bg-green-100 text-green-800';
      case 'QUEUED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'NOT_VECTORIZED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getContentTypeIcon = (contentType: string): string => {
    switch (contentType) {
      case 'ASSIGNMENT':
        return '📝';
      case 'ANNOUNCEMENT':
        return '📢';
      case 'PAGE':
        return '📄';
      case 'MODULE_ITEM':
        return '📚';
      case 'FILE':
        return '📎';
      case 'SYLLABUS':
        return '📋';
      default:
        return '📄';
    }
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Never';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const filteredItems = dashboard?.contentItems.filter(item => {
    if (filter === 'ALL') return true;
    if (filter === 'VECTORIZED') return item.vectorStatus === 'READY';
    if (filter === 'PENDING') return ['NOT_VECTORIZED', 'QUEUED', 'IN_PROGRESS'].includes(item.vectorStatus);
    if (filter === 'FAILED') return item.vectorStatus === 'FAILED';
    return item.contentType === filter;
  }) || [];

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'type':
        return a.contentType.localeCompare(b.contentType);
      case 'status':
        return a.vectorStatus.localeCompare(b.vectorStatus);
      case 'lastUpdated':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">Error loading dashboard</div>
          <div className="text-gray-600 text-sm">{error}</div>
          <button
            onClick={fetchDashboard}
            className="mt-4 btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Knowledge Base Content</h2>
        <p className="text-gray-600 mt-1">
          Overview of all course content and their AI search indexing status
        </p>
      </div>

      {/* Failed Items Alert */}
      {dashboard && (dashboard.statusCounts.FAILED || 0) > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {dashboard.statusCounts.FAILED} {dashboard.statusCounts.FAILED === 1 ? 'item has' : 'items have'} failed vectorization
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  These items could not be processed and will not appear in AI search results. Click "Retry Failed Items" to try again.
                </p>
              </div>
            </div>
            <button
              onClick={handleRetryFailed}
              disabled={retryingFailed}
              className="ml-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded text-sm font-medium"
            >
              {retryingFailed ? 'Retrying...' : 'Retry Failed Items'}
            </button>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">{dashboard.totalItems}</div>
            <div className="text-blue-700 text-sm">Total Items</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-900">{dashboard.vectorizedItems}</div>
            <div className="text-green-700 text-sm">Vectorized</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-900">
              {Math.round(dashboard.progressPercentage)}%
            </div>
            <div className="text-yellow-700 text-sm">Complete</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Last Sync</div>
            <div className="text-gray-900 font-medium">
              {formatDate(dashboard.lastSyncTime)}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="ALL">All Content</option>
            <option value="VECTORIZED">Vectorized Only</option>
            <option value="PENDING">Pending/Processing</option>
            <option value="FAILED">Failed</option>
            <optgroup label="Content Types">
              <option value="ASSIGNMENT">Assignments</option>
              <option value="ANNOUNCEMENT">Announcements</option>
              <option value="PAGE">Pages</option>
              <option value="MODULE_ITEM">Module Items</option>
              <option value="FILE">Files</option>
            </optgroup>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="title">Title</option>
            <option value="type">Content Type</option>
            <option value="status">Status</option>
            <option value="lastUpdated">Last Updated</option>
          </select>
        </div>
      </div>

      {/* Content List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No content items match the current filter.
          </div>
        ) : (
          sortedItems.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-xl">
                    {getContentTypeIcon(item.contentType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.title}
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {item.contentType}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      ID: {item.canvasId}
                    </div>
                    {item.errorMessage && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded mt-2">
                        Error: {item.errorMessage}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(item.vectorStatus)}`}>
                    {item.vectorStatus.replace('_', ' ')}
                  </span>
                  <div className="text-xs text-gray-500 text-right">
                    <div>Last updated</div>
                    <div>{formatDate(item.lastUpdated)}</div>
                    {item.lastVectorizedAt && (
                      <>
                        <div className="mt-1">Vectorized</div>
                        <div>{formatDate(item.lastVectorizedAt)}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary by Content Type */}
      {dashboard && dashboard.contentTypeCounts && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">Content by Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(dashboard.contentTypeCounts).map(([type, count]) => (
              <div key={type} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span>{getContentTypeIcon(type)}</span>
                <span className="text-sm font-medium">{type}</span>
                <span className="text-sm text-gray-600 ml-auto">({count})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseDashboard;
