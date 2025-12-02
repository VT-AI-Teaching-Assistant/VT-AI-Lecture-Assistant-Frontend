// Concrete Repository Implementations

import { injectable } from 'inversify';
import { apiService } from '../services/ApiService';
import {
  IAuthRepository,
  IUserRepository,
  ICourseRepository,
  IAnnouncementRepository,
  IDiscussionRepository,
  IChatRepository,
  ILectureRepository,
  IGradeRepository,
  IFAQRepository,
  ITranscriptRepository,
  IAnalyticsRepository,
  AnalyticsResponse,
} from '../repositories/interfaces';
import {
  User,
  UserProfile,
  Course,
  Announcement,
  Discussion,
  ChatMessage,
  Lecture,
  Grade,
  FAQ,
  Transcript,
  LoginRequest,
  LoginResponse,
  CreateAnnouncementRequest,
  CreateDiscussionRequest,
  UploadTranscriptRequest,
  SendChatMessageRequest,
  ApiResponse,
  PaginatedResponse,
} from '../models';

@injectable()
export class AuthRepository implements IAuthRepository {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.post<ApiResponse<LoginResponse>>('/auth/login', request);
    if (response.success) {
      apiService.setToken(response.data.token);
      localStorage.setItem('refresh_token', response.data.refreshToken);
    }
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } finally {
      apiService.clearToken();
      localStorage.removeItem('refresh_token');
    }
  }

  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiService.post<ApiResponse<{ token: string }>>('/auth/refresh', {
      refreshToken,
    });

    if (response.success) {
      apiService.setToken(response.data.token);
      return response.data.token;
    }
    throw new Error('Failed to refresh token');
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<ApiResponse<User>>('/auth/me');
    return response.data;
  }
}

  @injectable()
  export class UserRepository implements IUserRepository {
    async getProfile(userId: string, role?: 'student' | 'instructor'): Promise<UserProfile> {
      console.log('UserRepository.getProfile called with userId:', userId, 'role:', role);
      const url = role ? `/user/profile?role=${role}` : '/user/profile';
      const response = await apiService.getFullResponse<any>(url); // Use getFullResponse to access instructorData
      console.log('UserRepository.getProfile full response:', response);
      
      // The backend response includes instructorData for instructors
      // We need to extract and store this information
      if (role === 'instructor' && response.instructorData) {
        console.log('Instructor data found in response:', response.instructorData);
        // Store instructor data in localStorage for later use
        localStorage.setItem('vt-ai-instructor-data', JSON.stringify(response.instructorData));
      }
      
      return response.data;
    }

  async updateProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    const response = await apiService.patch<ApiResponse<UserProfile>>(`/users/${userId}/profile`, profile);
    return response.data;
  }

  async getEnrolledCourses(userId: string): Promise<Course[]> {
    const response = await apiService.get<ApiResponse<Course[]>>(`/users/${userId}/courses`);
    return response.data;
  }
}

@injectable()
export class CourseRepository implements ICourseRepository {
  async getAllCourses(): Promise<Course[]> {
    const response = await apiService.get<ApiResponse<Course[]>>('/courses');
    return response.data;
  }

  async getCourseById(courseId: string): Promise<Course> {
    const response = await apiService.get<ApiResponse<Course>>(`/courses/${courseId}`);
    return response.data;
  }

  async getCoursesByInstructor(instructorId: string): Promise<Course[]> {
    const response = await apiService.get<ApiResponse<Course[]>>(`/instructors/${instructorId}/courses`);
    return response.data;
  }
}

@injectable()
export class AnnouncementRepository implements IAnnouncementRepository {
  async getAnnouncements(courseId?: string): Promise<Announcement[]> {
    if (!courseId) {
      console.warn('No courseId provided for announcements');
      return [];
    }
    const url = `/courses/${courseId}/announcements`;
    const response = await apiService.get<ApiResponse<Announcement[]>>(url);
    return response.data;
  }

  async getAnnouncementById(id: string): Promise<Announcement> {
    const response = await apiService.get<ApiResponse<Announcement>>(`/announcements/${id}`);
    return response.data;
  }

  async createAnnouncement(request: CreateAnnouncementRequest): Promise<Announcement> {
    const response = await apiService.post<ApiResponse<Announcement>>('/announcements', request);
    return response.data;
  }

  async updateAnnouncement(id: string, announcement: Partial<Announcement>): Promise<Announcement> {
    const response = await apiService.patch<ApiResponse<Announcement>>(`/announcements/${id}`, announcement);
    return response.data;
  }

  async deleteAnnouncement(id: string): Promise<void> {
    await apiService.delete(`/announcements/${id}`);
  }
}

@injectable()
export class DiscussionRepository implements IDiscussionRepository {
  async getDiscussions(courseId?: string, page = 1, limit = 10): Promise<PaginatedResponse<Discussion>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (courseId) params.append('courseId', courseId);

    const response = await apiService.get<PaginatedResponse<Discussion>>(`/discussions?${params}`);
    return response;
  }

  async getDiscussionById(id: string): Promise<Discussion> {
    const response = await apiService.get<ApiResponse<Discussion>>(`/discussions/${id}`);
    return response.data;
  }

  async createDiscussion(request: CreateDiscussionRequest): Promise<Discussion> {
    const response = await apiService.post<ApiResponse<Discussion>>('/discussions', request);
    return response.data;
  }

  async updateDiscussion(id: string, discussion: Partial<Discussion>): Promise<Discussion> {
    const response = await apiService.patch<ApiResponse<Discussion>>(`/discussions/${id}`, discussion);
    return response.data;
  }

  async deleteDiscussion(id: string): Promise<void> {
    await apiService.delete(`/discussions/${id}`);
  }

  async upvoteDiscussion(id: string): Promise<void> {
    await apiService.post(`/discussions/${id}/upvote`);
  }

  async downvoteDiscussion(id: string): Promise<void> {
    await apiService.post(`/discussions/${id}/downvote`);
  }
}

@injectable()
export class ChatRepository implements IChatRepository {
  async getMessages(conversationId?: string): Promise<ChatMessage[]> {
    const url = conversationId ? `/chat/${conversationId}/messages` : '/chat/messages';
    const response = await apiService.get<ApiResponse<ChatMessage[]>>(url);
    return response.data;
  }

  async sendMessage(request: SendChatMessageRequest): Promise<ChatMessage> {
    const response = await apiService.post<ApiResponse<ChatMessage>>('/chat/messages', request);
    return response.data;
  }

  async createConversation(): Promise<string> {
    const response = await apiService.post<ApiResponse<{ conversationId: string }>>('/chat/conversations');
    return response.data.conversationId;
  }
}

@injectable()
export class LectureRepository implements ILectureRepository {
  async getLectures(courseId?: string): Promise<Lecture[]> {
    const url = courseId ? `/lectures?courseId=${courseId}` : '/lectures';
    const response = await apiService.get<ApiResponse<Lecture[]>>(url);
    return response.data;
  }

  async getLectureById(id: string): Promise<Lecture> {
    const response = await apiService.get<ApiResponse<Lecture>>(`/lectures/${id}`);
    return response.data;
  }

  async createLecture(lecture: Omit<Lecture, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lecture> {
    const response = await apiService.post<ApiResponse<Lecture>>('/lectures', lecture);
    return response.data;
  }

  async updateLecture(id: string, lecture: Partial<Lecture>): Promise<Lecture> {
    const response = await apiService.patch<ApiResponse<Lecture>>(`/lectures/${id}`, lecture);
    return response.data;
  }

  async deleteLecture(id: string): Promise<void> {
    await apiService.delete(`/lectures/${id}`);
  }
}

@injectable()
export class GradeRepository implements IGradeRepository {
  async getGrades(userId: string, courseId?: string): Promise<Grade[]> {
    const url = courseId ? `/grades?userId=${userId}&courseId=${courseId}` : `/grades?userId=${userId}`;
    const response = await apiService.get<ApiResponse<Grade[]>>(url);
    return response.data;
  }

  async getGradeById(id: string): Promise<Grade> {
    const response = await apiService.get<ApiResponse<Grade>>(`/grades/${id}`);
    return response.data;
  }

  async updateGrade(id: string, grade: Partial<Grade>): Promise<Grade> {
    const response = await apiService.patch<ApiResponse<Grade>>(`/grades/${id}`, grade);
    return response.data;
  }
}

@injectable()
export class FAQRepository implements IFAQRepository {
  async getFAQs(category?: string): Promise<FAQ[]> {
    const url = category ? `/faqs?category=${category}` : '/faqs';
    const response = await apiService.get<ApiResponse<FAQ[]>>(url);
    return response.data;
  }

  async getFAQById(id: string): Promise<FAQ> {
    const response = await apiService.get<ApiResponse<FAQ>>(`/faqs/${id}`);
    return response.data;
  }

  async createFAQ(faq: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>): Promise<FAQ> {
    const response = await apiService.post<ApiResponse<FAQ>>('/faqs', faq);
    return response.data;
  }

  async updateFAQ(id: string, faq: Partial<FAQ>): Promise<FAQ> {
    const response = await apiService.patch<ApiResponse<FAQ>>(`/faqs/${id}`, faq);
    return response.data;
  }

  async deleteFAQ(id: string): Promise<void> {
    await apiService.delete(`/faqs/${id}`);
  }
}

@injectable()
export class TranscriptRepository implements ITranscriptRepository {
  async getTranscripts(courseId?: string): Promise<Transcript[]> {
    const url = courseId ? `/transcripts?courseId=${courseId}` : '/transcripts';
    const response = await apiService.get<ApiResponse<Transcript[]>>(url);
    return response.data;
  }

  async getTranscriptById(id: string): Promise<Transcript> {
    const response = await apiService.get<ApiResponse<Transcript>>(`/transcripts/${id}`);
    return response.data;
  }

  async uploadTranscript(request: UploadTranscriptRequest): Promise<Transcript> {
    const response = await apiService.post<ApiResponse<Transcript>>('/transcripts', request);
    return response.data;
  }

  async updateTranscript(id: string, transcript: Partial<Transcript>): Promise<Transcript> {
    const response = await apiService.patch<ApiResponse<Transcript>>(`/transcripts/${id}`, transcript);
    return response.data;
  }

  async deleteTranscript(id: string): Promise<void> {
    await apiService.delete(`/transcripts/${id}`);
  }
}

@injectable()
export class AnalyticsRepository implements IAnalyticsRepository {
  async getQaAnalytics(courseId: number, startDate?: string, endDate?: string): Promise<AnalyticsResponse> {
    const params = new URLSearchParams();
    if (startDate) {
      params.append('startDate', startDate);
    }
    if (endDate) {
      params.append('endDate', endDate);
    }

    const url = `/analytics/qa${params.toString() ? '?' + params.toString() : ''}`;
    const response = await apiService.get<ApiResponse<AnalyticsResponse>>(url);
    return response.data;
  }
}
