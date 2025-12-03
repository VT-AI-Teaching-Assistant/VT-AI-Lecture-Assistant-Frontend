// Repository Interfaces

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
  PaginatedResponse
} from '../models';

export interface IAuthRepository {
  login(request: LoginRequest): Promise<LoginResponse>;
  logout(): Promise<void>;
  refreshToken(): Promise<string>;
  getCurrentUser(): Promise<User>;
}

export interface IUserRepository {
  getProfile(userId: string, role?: 'student' | 'instructor'): Promise<UserProfile>;
  updateProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile>;
  getEnrolledCourses(userId: string): Promise<Course[]>;
}

export interface ICourseRepository {
  getAllCourses(): Promise<Course[]>;
  getCourseById(courseId: string): Promise<Course>;
  getCoursesByInstructor(instructorId: string): Promise<Course[]>;
}

export interface IAnnouncementRepository {
  getAnnouncements(courseId?: string): Promise<Announcement[]>;
  getAnnouncementById(id: string): Promise<Announcement>;
  createAnnouncement(request: CreateAnnouncementRequest): Promise<Announcement>;
  updateAnnouncement(id: string, announcement: Partial<Announcement>): Promise<Announcement>;
  deleteAnnouncement(id: string): Promise<void>;
}

export interface IDiscussionRepository {
  getDiscussions(courseId?: string, page?: number, limit?: number): Promise<PaginatedResponse<Discussion>>;
  getDiscussionById(id: string): Promise<Discussion>;
  createDiscussion(request: CreateDiscussionRequest): Promise<Discussion>;
  updateDiscussion(id: string, discussion: Partial<Discussion>): Promise<Discussion>;
  deleteDiscussion(id: string): Promise<void>;
  upvoteDiscussion(id: string): Promise<void>;
  downvoteDiscussion(id: string): Promise<void>;
}

export interface IChatRepository {
  getMessages(conversationId?: string): Promise<ChatMessage[]>;
  sendMessage(request: SendChatMessageRequest): Promise<ChatMessage>;
  createConversation(): Promise<string>;
}

export interface ILectureRepository {
  getLectures(courseId?: string): Promise<Lecture[]>;
  getLectureById(id: string): Promise<Lecture>;
  createLecture(lecture: Omit<Lecture, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lecture>;
  updateLecture(id: string, lecture: Partial<Lecture>): Promise<Lecture>;
  deleteLecture(id: string): Promise<void>;
}

export interface IGradeRepository {
  getGrades(userId: string, courseId?: string): Promise<Grade[]>;
  getGradeById(id: string): Promise<Grade>;
  updateGrade(id: string, grade: Partial<Grade>): Promise<Grade>;
}

export interface IFAQRepository {
  getFAQs(category?: string): Promise<FAQ[]>;
  getFAQById(id: string): Promise<FAQ>;
  createFAQ(faq: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>): Promise<FAQ>;
  updateFAQ(id: string, faq: Partial<FAQ>): Promise<FAQ>;
  deleteFAQ(id: string): Promise<void>;
}

export interface ITranscriptRepository {
  getTranscripts(courseId?: string): Promise<Transcript[]>;
  getTranscriptById(id: string): Promise<Transcript>;
  uploadTranscript(request: UploadTranscriptRequest): Promise<Transcript>;
  updateTranscript(id: string, transcript: Partial<Transcript>): Promise<Transcript>;
  deleteTranscript(id: string): Promise<void>;
}

export interface AnalyticsResponse {
  questionsPerDay: Array<{ date: string; count: number }>;
  totalQuestions: number;
  questionsByStudent: Array<{ studentId: number; studentName: string; questionCount: number }>;
}

export interface IAnalyticsRepository {
  getQaAnalytics(courseId: number, startDate?: string, endDate?: string): Promise<AnalyticsResponse>;
}
