// Domain Models/Entities

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'instructor';
  profilePicture?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  userCode: string;
  name?: string;
  email?: string;
  major: string;
  year: string;
  gpa: string;
  phone?: string;
  totalCredits: number;
  currentSemesterCredits: number;
  completedAssignments: number;
  dueSoon: number;
  enrolledCourses: Course[];
}

export interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  instructorId: string;
  semester: string;
  year: number;
}

export interface Announcement {
  announcementId: number;
  courseId: number;
  title: string;
  content: string;
  status: string;
  canvasAnnouncementId: number;
  postedAt: string;
  createdAt: string;
  // Legacy fields for UI compatibility
  id?: string;
  authorId?: string;
  authorName?: string;
  priority?: 'high' | 'medium' | 'low';
  isPinned?: boolean;
  updatedAt?: string;
}

export interface Discussion {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  courseId?: string;
  replies: number;
  upvotes: number;
  downvotes: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'ai' | 'user';
  userId: string;
  timestamp: string;
  conversationId?: string;
}

export interface Lecture {
  id: string;
  title: string;
  courseId: string;
  instructorId: string;
  date: string;
  duration: string;
  notes: string;
  transcriptId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Grade {
  id: string;
  assignment: string;
  courseId: string;
  userId: string;
  type: 'Assignment' | 'Quiz' | 'Project' | 'Exam';
  score: number;
  maxScore: number;
  dueDate: string;
  submittedDate: string;
  feedback: string;
  createdAt: string;
  updatedAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transcript {
  id: string;
  title: string;
  courseId: string;
  instructorId: string;
  rawText: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  courseId?: string;
  priority: 'high' | 'medium' | 'low';
  isPinned: boolean;
}

export interface CreateDiscussionRequest {
  title: string;
  content: string;
  courseId?: string;
  tags: string[];
}

export interface UploadTranscriptRequest {
  title: string;
  rawText: string;
  courseId: string;
}

export interface SendChatMessageRequest {
  content: string;
  conversationId?: string;
}
