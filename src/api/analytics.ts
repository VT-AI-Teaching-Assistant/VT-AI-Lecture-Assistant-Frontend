import { apiService } from '../services/ApiService';

export interface DailyQuestionCount {
  date: string;
  count: number;
}

export interface StudentQuestionCount {
  studentId: number;
  studentName: string;
  questionCount: number;
}

export interface ModelUsageStats {
  modelUsed: string;
  count: number;
  avgLatency: number | null;
}

export interface AnalyticsResponse {
  questionsPerDay: DailyQuestionCount[];
  totalQuestions: number;
  questionsByStudent: StudentQuestionCount[];
  modelUsageStats?: ModelUsageStats[];
}

export interface QaLogEntry {
  logId: number;
  studentId: number | null;
  instructorId: number | null;
  courseId: number;
  question: string;
  answer: string;
  modelUsed: string | null;
  latencyMs: number | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export class AnalyticsApiService {
  private static instance: AnalyticsApiService;

  private constructor() {}

  public static getInstance(): AnalyticsApiService {
    if (!AnalyticsApiService.instance) {
      AnalyticsApiService.instance = new AnalyticsApiService();
    }
    return AnalyticsApiService.instance;
  }

  async getQaAnalytics(courseId: number, startDate?: string, endDate?: string): Promise<AnalyticsResponse> {
    try {
      const params = new URLSearchParams();
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }

      const url = `/analytics/qa${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiService.get<ApiResponse<AnalyticsResponse>>(url);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to get analytics');
      }
    } catch (error) {
      console.error('Analytics API error:', error);
      throw error;
    }
  }

  async getStudentQuestions(studentId: number): Promise<QaLogEntry[]> {
    try {
      const url = `/analytics/qa/student/${studentId}`;
      const response = await apiService.get<ApiResponse<QaLogEntry[]>>(url);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to get student questions');
      }
    } catch (error) {
      console.error('Student questions API error:', error);
      throw error;
    }
  }

  async getMyQuestionHistory(): Promise<QaLogEntry[]> {
    try {
      const url = `/qa/history`;
      const response = await apiService.get<ApiResponse<QaLogEntry[]>>(url);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to get question history');
      }
    } catch (error) {
      console.error('Question history API error:', error);
      throw error;
    }
  }

  async submitDispute(logId: number, whatWasWrong: string, whatWasExpected: string): Promise<void> {
    try {
      const url = `/qa/dispute`;
      const response = await apiService.post<ApiResponse<string>>(url, {
        logId,
        whatWasWrong,
        whatWasExpected
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to submit dispute');
      }
    } catch (error) {
      console.error('Dispute submission API error:', error);
      throw error;
    }
  }
}

export interface QaDispute {
  disputeId: number;
  logId: number;
  studentId: number;
  courseId: number;
  whatWasWrong: string;
  whatWasExpected: string;
  status: string;
  solution?: string | null;
  resolvedBy?: number | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export class DisputesApiService {
  private static instance: DisputesApiService;

  private constructor() {}

  public static getInstance(): DisputesApiService {
    if (!DisputesApiService.instance) {
      DisputesApiService.instance = new DisputesApiService();
    }
    return DisputesApiService.instance;
  }

  async getDisputes(): Promise<QaDispute[]> {
    try {
      const url = `/disputes`;
      const response = await apiService.get<ApiResponse<QaDispute[]>>(url);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to get disputes');
      }
    } catch (error) {
      console.error('Disputes API error:', error);
      throw error;
    }
  }

  async resolveDispute(disputeId: number, solution: string): Promise<void> {
    try {
      const url = `/disputes/resolve`;
      const response = await apiService.post<ApiResponse<string>>(url, {
        disputeId,
        solution
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to resolve dispute');
      }
    } catch (error) {
      console.error('Resolve dispute API error:', error);
      throw error;
    }
  }

  async getQaLogById(logId: number): Promise<QaLogEntry> {
    try {
      const url = `/qa/log/${logId}`;
      const response = await apiService.get<ApiResponse<QaLogEntry>>(url);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to get QA log');
      }
    } catch (error) {
      console.error('QA log API error:', error);
      throw error;
    }
  }
}

export const disputesApiService = DisputesApiService.getInstance();

export const analyticsApiService = AnalyticsApiService.getInstance();

