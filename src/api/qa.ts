// QA API Service for frontend

import { apiService } from '../services/ApiService';

export interface QaRequest {
  question: string;
  courseId: number;
}

export interface SourceInfo {
  sourceType: string;
  title: string | null;
  sourceId: string | null;
  courseId: string | null;
  fileName: string | null;
  chunkIndex: number | null;
  relevanceScore: number | null;
  excerpt: string | null;
}

export interface QaResponse {
  answer: string;
  question: string;
  courseId: number;
  timestamp: number;
  sources: SourceInfo[] | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export class QaApiService {
  private static instance: QaApiService;

  private constructor() {}

  public static getInstance(): QaApiService {
    if (!QaApiService.instance) {
      QaApiService.instance = new QaApiService();
    }
    return QaApiService.instance;
  }

  // QA requests can take longer due to:
  // 1. Embedding generation
  // 2. Vector search
  // 3. LLM response generation (Claude)
  // Use 120 second timeout for chat operations
  private readonly QA_TIMEOUT = 120000; // 120 seconds

  async askQuestion(question: string, courseId: number): Promise<QaResponse> {
    try {
      const request: QaRequest = {
        question,
        courseId
      };

      const response = await apiService.post<ApiResponse<QaResponse>>(
        '/qa/ask',
        request,
        { timeout: this.QA_TIMEOUT }
      );

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to get answer');
      }
    } catch (error) {
      console.error('QA API error:', error);
      throw error;
    }
  }
}

export const qaApiService = QaApiService.getInstance();
