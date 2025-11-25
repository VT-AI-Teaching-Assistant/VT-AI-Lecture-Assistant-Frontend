// QA API Service for frontend

import { apiService } from '../services/ApiService';

export interface QaRequest {
  question: string;
  courseId: number;
}

export interface QaResponse {
  answer: string;
  question: string;
  courseId: number;
  timestamp: number;
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

  async askQuestion(question: string, courseId: number): Promise<QaResponse> {
    try {
      const request: QaRequest = {
        question,
        courseId
      };

      const response = await apiService.post<ApiResponse<QaResponse>>('/qa/ask', request);
      
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
