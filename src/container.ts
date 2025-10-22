// Dependency Injection Container

import 'reflect-metadata';
import { Container } from 'inversify';
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
} from './repositories/interfaces';
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
} from './repositories/implementations';
import { TYPES } from './types';

// Create container
const container = new Container();

// Bind repositories
container.bind<IAuthRepository>(TYPES.AuthRepository).to(AuthRepository).inSingletonScope();
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();
container.bind<ICourseRepository>(TYPES.CourseRepository).to(CourseRepository).inSingletonScope();
container.bind<IAnnouncementRepository>(TYPES.AnnouncementRepository).to(AnnouncementRepository).inSingletonScope();
container.bind<IDiscussionRepository>(TYPES.DiscussionRepository).to(DiscussionRepository).inSingletonScope();
container.bind<IChatRepository>(TYPES.ChatRepository).to(ChatRepository).inSingletonScope();
container.bind<ILectureRepository>(TYPES.LectureRepository).to(LectureRepository).inSingletonScope();
container.bind<IGradeRepository>(TYPES.GradeRepository).to(GradeRepository).inSingletonScope();
container.bind<IFAQRepository>(TYPES.FAQRepository).to(FAQRepository).inSingletonScope();
container.bind<ITranscriptRepository>(TYPES.TranscriptRepository).to(TranscriptRepository).inSingletonScope();

export { container };
