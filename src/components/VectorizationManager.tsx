/**
 * VectorizationManager Component
 *
 * Displays vectorization status for a course and allows instructors to:
 * - View progress of content vectorization
 * - Trigger manual sync with Canvas
 * - Revectorize failed/pending items
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  getVectorizationStatus,
  triggerSync,
  revectorizeRemaining,
  VectorizationStatus,
  SyncResult,
} from '../api/vectorization';

interface VectorizationManagerProps {
  courseId: number;
}

const VectorizationManager: React.FC<VectorizationManagerProps> = ({ courseId }) => {
  const [status, setStatus] = useState<VectorizationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [revectorizing, setRevectorizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getVectorizationStatus(courseId);
      setStatus(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch vectorization status:', err);
      setError('Failed to load vectorization status');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchStatus();

    // Poll every 30 seconds when there are items in progress
    const interval = setInterval(() => {
      if (status?.counts?.IN_PROGRESS || status?.counts?.QUEUED) {
        fetchStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchStatus, status?.counts?.IN_PROGRESS, status?.counts?.QUEUED]);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setSuccessMessage(null);
    setLastSyncResult(null);

    try {
      const result = await triggerSync(courseId);
      setLastSyncResult(result);
      setSuccessMessage(
        `Sync complete: ${result.newDetected} new, ${result.updatedDetected} updated, ${result.deletedDetected} deleted, ${result.jobsQueued} queued for vectorization`
      );
      // Refresh status
      await fetchStatus();
    } catch (err) {
      console.error('Sync failed:', err);
      setError('Failed to sync with Canvas. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleRevectorize = async () => {
    setRevectorizing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await revectorizeRemaining(courseId);
      setSuccessMessage(`Queued ${result.jobsQueued} items for revectorization`);
      // Refresh status
      await fetchStatus();
    } catch (err) {
      console.error('Revectorize failed:', err);
      setError('Failed to queue revectorization. Please try again.');
    } finally {
      setRevectorizing(false);
    }
  };

  const getProgressPercentage = (): number => {
    if (!status || status.totalActive === 0) return 0;
    return Math.round(status.progress * 100);
  };

  const getProgressColor = (): string => {
    const progress = getProgressPercentage();
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Never';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const hasFailedItems = (status?.counts?.FAILED ?? 0) > 0;
  const hasPendingItems = (status?.counts?.NOT_VECTORIZED ?? 0) > 0;
  const hasInProgressItems = (status?.counts?.IN_PROGRESS ?? 0) > 0 || (status?.counts?.QUEUED ?? 0) > 0;

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Canvas Content Vectorization</h2>
        <p className="text-sm text-gray-600">
          Manage AI search indexing for course content from Canvas
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {successMessage}
        </div>
      )}

      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Vectorization Progress</span>
          <span className="text-sm text-gray-600">
            {status?.totalReady ?? 0} / {status?.totalActive ?? 0} items ready
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>{getProgressPercentage()}% complete</span>
          <span>Last sync: {formatDate(status?.lastSyncTime ?? null)}</span>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <StatusBadge
          label="Ready"
          count={status?.counts?.READY ?? 0}
          color="bg-green-100 text-green-800"
        />
        <StatusBadge
          label="Queued"
          count={status?.counts?.QUEUED ?? 0}
          color="bg-blue-100 text-blue-800"
        />
        <StatusBadge
          label="In Progress"
          count={status?.counts?.IN_PROGRESS ?? 0}
          color="bg-yellow-100 text-yellow-800"
          pulse={hasInProgressItems}
        />
        <StatusBadge
          label="Pending"
          count={status?.counts?.NOT_VECTORIZED ?? 0}
          color="bg-gray-100 text-gray-800"
        />
        <StatusBadge
          label="Failed"
          count={status?.counts?.FAILED ?? 0}
          color="bg-red-100 text-red-800"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="btn-primary flex items-center gap-2"
        >
          {syncing ? (
            <>
              <LoadingSpinner />
              Syncing...
            </>
          ) : (
            <>
              <SyncIcon />
              Sync Now
            </>
          )}
        </button>

        {(hasFailedItems || hasPendingItems) && (
          <button
            onClick={handleRevectorize}
            disabled={revectorizing}
            className="btn-secondary flex items-center gap-2"
          >
            {revectorizing ? (
              <>
                <LoadingSpinner />
                Queuing...
              </>
            ) : (
              <>
                <RefreshIcon />
                Revectorize Remaining
              </>
            )}
          </button>
        )}
      </div>

      {/* Last Sync Result */}
      {lastSyncResult && (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Last Sync Result</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="text-blue-700">
              <span className="font-medium">{lastSyncResult.newDetected}</span> new items
            </div>
            <div className="text-blue-700">
              <span className="font-medium">{lastSyncResult.updatedDetected}</span> updated
            </div>
            <div className="text-blue-700">
              <span className="font-medium">{lastSyncResult.deletedDetected}</span> deleted
            </div>
            <div className="text-blue-700">
              <span className="font-medium">{lastSyncResult.jobsQueued}</span> queued
            </div>
          </div>
          {lastSyncResult.errors.length > 0 && (
            <div className="mt-2 text-red-600 text-sm">
              Errors: {lastSyncResult.errors.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Recent Failures */}
      {status?.recentFailures && status.recentFailures.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Recent Failures</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {status.recentFailures.map((failure) => (
              <div
                key={failure.id}
                className="p-2 bg-red-50 border border-red-100 rounded text-sm"
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium text-red-900">
                    {failure.contentType} - {failure.canvasId}
                  </span>
                  <span className="text-xs text-red-600">
                    {formatDate(failure.updatedAt)}
                  </span>
                </div>
                {failure.errorMessage && (
                  <p className="text-red-700 text-xs mt-1 truncate">
                    {failure.errorMessage}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
interface StatusBadgeProps {
  label: string;
  count: number;
  color: string;
  pulse?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ label, count, color, pulse }) => (
  <div className={`p-3 rounded-lg ${color} ${pulse ? 'animate-pulse' : ''}`}>
    <div className="text-2xl font-bold">{count}</div>
    <div className="text-xs uppercase tracking-wide">{label}</div>
  </div>
);

const LoadingSpinner: React.FC = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const SyncIcon: React.FC = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

const RefreshIcon: React.FC = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

export default VectorizationManager;
