import { apiService } from '../services/ApiService';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type PresignedUploadPayload = {
  fileName: string;
  fileType: string;
  courseId: number;
};

export type PresignedUploadResponse = {
  uploadUrl: string;
  fileUrl: string;
};

export async function getVideoUploadUrl(payload: PresignedUploadPayload): Promise<PresignedUploadResponse> {
  const response = await apiService.post<ApiResponse<PresignedUploadResponse>>('/media/presign-upload', payload);

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Unable to retrieve upload URL');
  }

  return response.data;
}

export type TranscriptionJobPayload = {
  fileUrl: string;
  title: string;
  courseId: number;
};

export type TranscriptionJobResponse = {
  jobId: string;
};

export async function startVideoTranscriptionJob(payload: TranscriptionJobPayload): Promise<TranscriptionJobResponse> {
  const response = await apiService.post<ApiResponse<TranscriptionJobResponse>>('/transcripts/video', payload);

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Unable to start transcription job');
  }

  return response.data;
}

// Backend response format
type BackendTranscriptionStatusResponse = {
  jobId: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  transcriptText?: string | null;
  failureReason?: string | null;
};

// Frontend expected format
export type TranscriptionJobStatus = {
  status: 'queued' | 'uploading' | 'processing' | 'completed' | 'failed';
  transcript?: string;
  errorMessage?: string;
  rawStatus?: string; // Keep original status for debugging
};

function mapBackendStatusToFrontend(backendStatus: string): TranscriptionJobStatus['status'] {
  const statusMap: Record<string, TranscriptionJobStatus['status']> = {
    'IN_PROGRESS': 'processing',
    'COMPLETED': 'completed',
    'FAILED': 'failed',
    'QUEUED': 'queued',
    'UPLOADING': 'uploading'
  };
  return statusMap[backendStatus] || 'processing';
}

export async function getTranscriptionJobStatus(jobId: string): Promise<TranscriptionJobStatus> {
  const response = await apiService.get<ApiResponse<BackendTranscriptionStatusResponse>>(`/transcripts/video/${jobId}`);

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Unable to fetch transcription status');
  }

  const backendData = response.data;
  console.log('Backend transcription status response:', backendData);
  
  // Check status directly as the user suggested
  const rawStatus = backendData.status;
  const mappedStatus = mapBackendStatusToFrontend(rawStatus);
  
  const result: TranscriptionJobStatus = {
    status: mappedStatus,
    transcript: backendData.transcriptText || undefined,
    errorMessage: backendData.failureReason || undefined,
    rawStatus: rawStatus // Keep for debugging
  };
  
  console.log('Mapped transcription status:', result);
  
  // If status is COMPLETED but no transcript, there might be an error
  if (rawStatus === 'COMPLETED' && !backendData.transcriptText) {
    console.warn('Job marked as COMPLETED but transcript text is missing');
  }
  
  return result;
}
