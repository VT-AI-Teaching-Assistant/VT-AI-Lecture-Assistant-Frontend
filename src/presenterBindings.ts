// Presenter Bindings for Dependency Injection

import { container } from './container';
import { TYPES } from './types';
import {
  AuthPresenter,
  UserProfilePresenter,
  HomePresenter,
  ChatPresenter,
  LecturesPresenter,
  GradesPresenter,
  FAQPresenter,
  TranscriptPresenter,
  IAuthPresenter,
  IUserProfilePresenter,
  IHomePresenter,
  IChatPresenter,
  ILecturesPresenter,
  IGradesPresenter,
  IFAQPresenter,
  ITranscriptPresenter,
} from './presenters';

// Bind presenters to the container
export function bindPresenters(): void {
  container.bind<IAuthPresenter>(TYPES.AuthPresenter).to(AuthPresenter).inSingletonScope();
  container.bind<IUserProfilePresenter>(TYPES.UserProfilePresenter).to(UserProfilePresenter).inSingletonScope();
  container.bind<IHomePresenter>(TYPES.HomePresenter).to(HomePresenter).inSingletonScope();
  container.bind<IChatPresenter>(TYPES.ChatPresenter).to(ChatPresenter).inSingletonScope();
  container.bind<ILecturesPresenter>(TYPES.LecturesPresenter).to(LecturesPresenter).inSingletonScope();
  container.bind<IGradesPresenter>(TYPES.GradesPresenter).to(GradesPresenter).inSingletonScope();
  container.bind<IFAQPresenter>(TYPES.FAQPresenter).to(FAQPresenter).inSingletonScope();
  container.bind<ITranscriptPresenter>(TYPES.TranscriptPresenter).to(TranscriptPresenter).inSingletonScope();
}
