// Dependency Injection Types

// Define symbols for dependency injection
export const TYPES = {
  AuthRepository: Symbol.for('AuthRepository'),
  UserRepository: Symbol.for('UserRepository'),
  CourseRepository: Symbol.for('CourseRepository'),
  AnnouncementRepository: Symbol.for('AnnouncementRepository'),
  DiscussionRepository: Symbol.for('DiscussionRepository'),
  ChatRepository: Symbol.for('ChatRepository'),
  LectureRepository: Symbol.for('LectureRepository'),
  GradeRepository: Symbol.for('GradeRepository'),
  FAQRepository: Symbol.for('FAQRepository'),
  TranscriptRepository: Symbol.for('TranscriptRepository'),
  // Presenter symbols
  AuthPresenter: Symbol.for('AuthPresenter'),
  UserProfilePresenter: Symbol.for('UserProfilePresenter'),
  HomePresenter: Symbol.for('HomePresenter'),
  ChatPresenter: Symbol.for('ChatPresenter'),
  LecturesPresenter: Symbol.for('LecturesPresenter'),
  GradesPresenter: Symbol.for('GradesPresenter'),
  FAQPresenter: Symbol.for('FAQPresenter'),
  TranscriptPresenter: Symbol.for('TranscriptPresenter'),
};
