// Presenter Classes for MVP Pattern

import { injectable, inject } from 'inversify';
import { container } from '../container';
import { TYPES } from '../types';
import type {
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
} from '../repositories/interfaces';
import {
  AuthRepository,
  UserRepository,
  CourseRepository,
  AnnouncementRepository,
  DiscussionRepository,
  ChatRepository,
  LectureRepository,
  GradeRepository,
  FAQRepository,
  TranscriptRepository,
} from '../repositories/implementations';
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
  CreateAnnouncementRequest,
  CreateDiscussionRequest,
  UploadTranscriptRequest,
  SendChatMessageRequest,
  PaginatedResponse,
} from '../models';

// Base presenter interface
export interface IPresenter {
  dispose(): void;
}

// Base presenter class
export abstract class BasePresenter implements IPresenter {
  abstract dispose(): void;
}

// Auth Presenter
export interface IAuthPresenter {
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  isAuthenticated(): boolean;
}

@injectable()
export class AuthPresenter extends BasePresenter implements IAuthPresenter {
  constructor(
    @inject(TYPES.AuthRepository) private authRepository: IAuthRepository
  ) {
    super();
  }

  async logout(): Promise<void> {
    try {
      await this.authRepository.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      return await this.authRepository.getCurrentUser();
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  dispose(): void {
    // Cleanup if needed
  }
}

// User Profile Presenter
export interface IUserProfilePresenter {
  loadProfile(userId: string, role?: 'student' | 'instructor'): Promise<UserProfile | null>;
  updateProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile | null>;
  loadEnrolledCourses(userId: string): Promise<Course[]>;
}

@injectable()
export class UserProfilePresenter extends BasePresenter implements IUserProfilePresenter {
  private userRepository: IUserRepository;

  constructor() {
    super();
    // Create repository directly for now to test
    this.userRepository = new UserRepository();
  }

  async loadProfile(userId: string, role?: 'student' | 'instructor'): Promise<UserProfile | null> {
    try {
      console.log('UserProfilePresenter.loadProfile called with userId:', userId, 'role:', role);
      console.log('UserProfilePresenter.loadProfile called, repository:', !!this.userRepository);
      if (!this.userRepository) {
        console.error('UserRepository is undefined!');
        return null;
      }
      const result = await this.userRepository.getProfile(userId, role);
      console.log('UserProfilePresenter.loadProfile result:', result);
      return result;
    } catch (error) {
      console.error('Load profile error:', error);
      return null;
    }
  }

  async updateProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      return await this.userRepository.updateProfile(userId, profile);
    } catch (error) {
      console.error('Update profile error:', error);
      return null;
    }
  }

  async loadEnrolledCourses(userId: string): Promise<Course[]> {
    try {
      return await this.userRepository.getEnrolledCourses(userId);
    } catch (error) {
      console.error('Load enrolled courses error:', error);
      return [];
    }
  }

  dispose(): void {
    // Cleanup if needed
  }
}

// Home Dashboard Presenter
export interface IHomePresenter {
  loadAnnouncements(courseId?: string): Promise<Announcement[]>;
  loadDiscussions(courseId?: string, page?: number, limit?: number): Promise<PaginatedResponse<Discussion>>;
  createAnnouncement(request: CreateAnnouncementRequest): Promise<Announcement | null>;
  createDiscussion(request: CreateDiscussionRequest): Promise<Discussion | null>;
}

@injectable()
export class HomePresenter extends BasePresenter implements IHomePresenter {
  private announcementRepository: IAnnouncementRepository;
  private discussionRepository: IDiscussionRepository;

  constructor() {
    super();
    // Create repositories directly for now to test
    this.announcementRepository = new AnnouncementRepository();
    this.discussionRepository = new DiscussionRepository();
  }

  async loadAnnouncements(courseId?: string): Promise<Announcement[]> {
    try {
      console.log('HomePresenter.loadAnnouncements called, repository:', !!this.announcementRepository);
      if (!this.announcementRepository) {
        console.error('AnnouncementRepository is undefined!');
        return [];
      }
      return await this.announcementRepository.getAnnouncements(courseId);
    } catch (error) {
      console.error('Load announcements error:', error);
      return [];
    }
  }

  async loadDiscussions(courseId?: string, page = 1, limit = 10): Promise<PaginatedResponse<Discussion>> {
    try {
      return await this.discussionRepository.getDiscussions(courseId, page, limit);
    } catch (error) {
      console.error('Load discussions error:', error);
      return {
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      };
    }
  }

  async createAnnouncement(request: CreateAnnouncementRequest): Promise<Announcement | null> {
    try {
      return await this.announcementRepository.createAnnouncement(request);
    } catch (error) {
      console.error('Create announcement error:', error);
      return null;
    }
  }

  async createDiscussion(request: CreateDiscussionRequest): Promise<Discussion | null> {
    try {
      return await this.discussionRepository.createDiscussion(request);
    } catch (error) {
      console.error('Create discussion error:', error);
      return null;
    }
  }

  dispose(): void {
    // Cleanup if needed
  }
}

// Chat Presenter
export interface IChatPresenter {
  loadMessages(conversationId?: string): Promise<ChatMessage[]>;
  sendMessage(content: string, conversationId?: string): Promise<ChatMessage | null>;
  createConversation(): Promise<string | null>;
}

@injectable()
export class ChatPresenter extends BasePresenter implements IChatPresenter {
  constructor(
    @inject(TYPES.ChatRepository) private chatRepository: IChatRepository
  ) {
    super();
  }

  async loadMessages(conversationId?: string): Promise<ChatMessage[]> {
    try {
      return await this.chatRepository.getMessages(conversationId);
    } catch (error) {
      console.error('Load messages error:', error);
      return [];
    }
  }

  async sendMessage(content: string, conversationId?: string): Promise<ChatMessage | null> {
    try {
      const request: SendChatMessageRequest = { content, conversationId };
      return await this.chatRepository.sendMessage(request);
    } catch (error) {
      console.error('Send message error:', error);
      return null;
    }
  }

  async createConversation(): Promise<string | null> {
    try {
      return await this.chatRepository.createConversation();
    } catch (error) {
      console.error('Create conversation error:', error);
      return null;
    }
  }

  dispose(): void {
    // Cleanup if needed
  }
}

// Lectures Presenter
export interface ILecturesPresenter {
  loadLectures(courseId?: string): Promise<Lecture[]>;
  loadLectureById(id: string): Promise<Lecture | null>;
  createLecture(lecture: Omit<Lecture, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lecture | null>;
  updateLecture(id: string, lecture: Partial<Lecture>): Promise<Lecture | null>;
  deleteLecture(id: string): Promise<boolean>;
}

@injectable()
export class LecturesPresenter extends BasePresenter implements ILecturesPresenter {
  constructor(
    @inject(TYPES.LectureRepository) private lectureRepository: ILectureRepository
  ) {
    super();
  }

  async loadLectures(courseId?: string): Promise<Lecture[]> {
    try {
      return await this.lectureRepository.getLectures(courseId);
    } catch (error) {
      console.error('Load lectures error:', error);
      return [];
    }
  }

  async loadLectureById(id: string): Promise<Lecture | null> {
    try {
      return await this.lectureRepository.getLectureById(id);
    } catch (error) {
      console.error('Load lecture error:', error);
      return null;
    }
  }

  async createLecture(lecture: Omit<Lecture, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lecture | null> {
    try {
      return await this.lectureRepository.createLecture(lecture);
    } catch (error) {
      console.error('Create lecture error:', error);
      return null;
    }
  }

  async updateLecture(id: string, lecture: Partial<Lecture>): Promise<Lecture | null> {
    try {
      return await this.lectureRepository.updateLecture(id, lecture);
    } catch (error) {
      console.error('Update lecture error:', error);
      return null;
    }
  }

  async deleteLecture(id: string): Promise<boolean> {
    try {
      await this.lectureRepository.deleteLecture(id);
      return true;
    } catch (error) {
      console.error('Delete lecture error:', error);
      return false;
    }
  }

  dispose(): void {
    // Cleanup if needed
  }
}

// Grades Presenter
export interface IGradesPresenter {
  loadGrades(userId: string, courseId?: string): Promise<Grade[]>;
  loadGradeById(id: string): Promise<Grade | null>;
  updateGrade(id: string, grade: Partial<Grade>): Promise<Grade | null>;
}

@injectable()
export class GradesPresenter extends BasePresenter implements IGradesPresenter {
  constructor(
    @inject(TYPES.GradeRepository) private gradeRepository: IGradeRepository
  ) {
    super();
  }

  async loadGrades(userId: string, courseId?: string): Promise<Grade[]> {
    try {
      return await this.gradeRepository.getGrades(userId, courseId);
    } catch (error) {
      console.error('Load grades error:', error);
      return [];
    }
  }

  async loadGradeById(id: string): Promise<Grade | null> {
    try {
      return await this.gradeRepository.getGradeById(id);
    } catch (error) {
      console.error('Load grade error:', error);
      return null;
    }
  }

  async updateGrade(id: string, grade: Partial<Grade>): Promise<Grade | null> {
    try {
      return await this.gradeRepository.updateGrade(id, grade);
    } catch (error) {
      console.error('Update grade error:', error);
      return null;
    }
  }

  dispose(): void {
    // Cleanup if needed
  }
}

// FAQ Presenter
export interface IFAQPresenter {
  loadFAQs(category?: string): Promise<FAQ[]>;
  loadFAQById(id: string): Promise<FAQ | null>;
  createFAQ(faq: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>): Promise<FAQ | null>;
  updateFAQ(id: string, faq: Partial<FAQ>): Promise<FAQ | null>;
  deleteFAQ(id: string): Promise<boolean>;
}

@injectable()
export class FAQPresenter extends BasePresenter implements IFAQPresenter {
  constructor(
    @inject(TYPES.FAQRepository) private faqRepository: IFAQRepository
  ) {
    super();
  }

  async loadFAQs(category?: string): Promise<FAQ[]> {
    try {
      return await this.faqRepository.getFAQs(category);
    } catch (error) {
      console.error('Load FAQs error:', error);
      return [];
    }
  }

  async loadFAQById(id: string): Promise<FAQ | null> {
    try {
      return await this.faqRepository.getFAQById(id);
    } catch (error) {
      console.error('Load FAQ error:', error);
      return null;
    }
  }

  async createFAQ(faq: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>): Promise<FAQ | null> {
    try {
      return await this.faqRepository.createFAQ(faq);
    } catch (error) {
      console.error('Create FAQ error:', error);
      return null;
    }
  }

  async updateFAQ(id: string, faq: Partial<FAQ>): Promise<FAQ | null> {
    try {
      return await this.faqRepository.updateFAQ(id, faq);
    } catch (error) {
      console.error('Update FAQ error:', error);
      return null;
    }
  }

  async deleteFAQ(id: string): Promise<boolean> {
    try {
      await this.faqRepository.deleteFAQ(id);
      return true;
    } catch (error) {
      console.error('Delete FAQ error:', error);
      return false;
    }
  }

  dispose(): void {
    // Cleanup if needed
  }
}

// Transcript Presenter
export interface ITranscriptPresenter {
  loadTranscripts(courseId?: string): Promise<Transcript[]>;
  loadTranscriptById(id: string): Promise<Transcript | null>;
  uploadTranscript(request: UploadTranscriptRequest): Promise<Transcript | null>;
  updateTranscript(id: string, transcript: Partial<Transcript>): Promise<Transcript | null>;
  deleteTranscript(id: string): Promise<boolean>;
}

@injectable()
export class TranscriptPresenter extends BasePresenter implements ITranscriptPresenter {
  constructor(
    @inject(TYPES.TranscriptRepository) private transcriptRepository: ITranscriptRepository
  ) {
    super();
  }

  async loadTranscripts(courseId?: string): Promise<Transcript[]> {
    try {
      return await this.transcriptRepository.getTranscripts(courseId);
    } catch (error) {
      console.error('Load transcripts error:', error);
      return [];
    }
  }

  async loadTranscriptById(id: string): Promise<Transcript | null> {
    try {
      return await this.transcriptRepository.getTranscriptById(id);
    } catch (error) {
      console.error('Load transcript error:', error);
      return null;
    }
  }

  async uploadTranscript(request: UploadTranscriptRequest): Promise<Transcript | null> {
    try {
      return await this.transcriptRepository.uploadTranscript(request);
    } catch (error) {
      console.error('Upload transcript error:', error);
      return null;
    }
  }

  async updateTranscript(id: string, transcript: Partial<Transcript>): Promise<Transcript | null> {
    try {
      return await this.transcriptRepository.updateTranscript(id, transcript);
    } catch (error) {
      console.error('Update transcript error:', error);
      return null;
    }
  }

  async deleteTranscript(id: string): Promise<boolean> {
    try {
      await this.transcriptRepository.deleteTranscript(id);
      return true;
    } catch (error) {
      console.error('Delete transcript error:', error);
      return false;
    }
  }

  dispose(): void {
    // Cleanup if needed
  }
}

// Presenter factory for easy access
export class PresenterFactory {
  static getAuthPresenter(): IAuthPresenter {
    console.log('Getting AuthPresenter from container...');
    return container.get<IAuthPresenter>(TYPES.AuthPresenter);
  }

  static getUserProfilePresenter(): IUserProfilePresenter {
    console.log('Getting UserProfilePresenter from container...');
    return container.get<IUserProfilePresenter>(TYPES.UserProfilePresenter);
  }

  static getHomePresenter(): IHomePresenter {
    console.log('Getting HomePresenter from container...');
    return container.get<IHomePresenter>(TYPES.HomePresenter);
  }

  static getChatPresenter(): IChatPresenter {
    return container.get<IChatPresenter>(TYPES.ChatPresenter);
  }

  static getLecturesPresenter(): ILecturesPresenter {
    return container.get<ILecturesPresenter>(TYPES.LecturesPresenter);
  }

  static getGradesPresenter(): IGradesPresenter {
    return container.get<IGradesPresenter>(TYPES.GradesPresenter);
  }

  static getFAQPresenter(): IFAQPresenter {
    return container.get<IFAQPresenter>(TYPES.FAQPresenter);
  }

  static getTranscriptPresenter(): ITranscriptPresenter {
    return container.get<ITranscriptPresenter>(TYPES.TranscriptPresenter);
  }
}
