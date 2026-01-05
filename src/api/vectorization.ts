/**
 * Vectorization API Service
 *
 * Handles Canvas content sync and vectorization management
 */

import { apiService } from '../services/ApiService';

export interface VectorizationStatusCounts {
  NOT_VECTORIZED?: number;
  QUEUED?: number;
  IN_PROGRESS?: number;
  READY?: number;
  FAILED?: number;
}

export interface VectorizationFailure {
  id: number;
  contentType: string;
  canvasId: string;
  errorMessage: string | null;
  updatedAt: string;
}

export interface VectorizationStatus {
  counts: VectorizationStatusCounts;
  totalActive: number;
  totalReady: number;
  progress: number;
  lastSyncTime: string | null;
  recentFailures: VectorizationFailure[];
}

export interface SyncResult {
  newDetected: number;
  updatedDetected: number;
  deletedDetected: number;
  jobsQueued: number;
  errors: string[];
}

export interface KnowledgeBaseContentItem {
  id: number;
  contentType: string;
  canvasId: string;
  title: string;
  status: string;
  vectorStatus: string;
  lastVectorizedAt: string | null;
  errorMessage: string | null;
  lastUpdated: string;
}

export interface KnowledgeBaseDashboardResponse {
  contentItems: KnowledgeBaseContentItem[];
  statusCounts: Record<string, number>;
  contentTypeCounts: Record<string, number>;
  totalItems: number;
  vectorizedItems: number;
  progressPercentage: number;
  lastSyncTime: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Get vectorization status for a course
 */
export const getVectorizationStatus = async (courseId: number): Promise<VectorizationStatus> => {
  const response = await apiService.get<ApiResponse<VectorizationStatus>>(
    `/courses/${courseId}/vectorization/status`
  );
  return response.data;
};

/**
 * Trigger a manual sync for a course
 */
export const triggerSync = async (courseId: number): Promise<SyncResult> => {
  const response = await apiService.post<ApiResponse<SyncResult>>(
    `/courses/${courseId}/sync`
  );
  return response.data;
};

/**
 * Revectorize failed/pending items for a course
 */
export const revectorizeRemaining = async (courseId: number): Promise<{ jobsQueued: number }> => {
  const response = await apiService.post<ApiResponse<{ jobsQueued: number }>>(
    `/courses/${courseId}/revectorize`
  );
  return response.data;
};

/**
 * Get detailed knowledge base dashboard for a course
 */
export const getKnowledgeBaseDashboard = async (courseId: number): Promise<KnowledgeBaseDashboardResponse> => {
  const response = await apiService.get<ApiResponse<KnowledgeBaseDashboardResponse>>(
    `/courses/${courseId}/knowledge-base/dashboard`
  );
  return response.data;
};
