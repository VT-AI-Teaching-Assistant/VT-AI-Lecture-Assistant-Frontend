# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

AI Lecture Assistant for Virginia Tech - A React TypeScript frontend application with AI-powered learning management features including chat, lecture notes, grades tracking, and Q&A functionality.

## Common Commands

### Development
```bash
npm install          # Install dependencies
npm start            # Start development server (http://localhost:3000)
npm run build        # Build for production
npm test             # Run tests
```

### Environment Variables
The application uses environment variables for API configuration:
- `REACT_APP_API_BASE_URL` - Backend API URL (default: `http://localhost:3167/api`)
- `REACT_APP_API_TIMEOUT` - API request timeout in milliseconds (default: `10000`)

## Architecture

### Design Pattern: MVP with Dependency Injection

This codebase implements **Model-View-Presenter (MVP)** pattern with **InversifyJS** for dependency injection.

#### Key Architecture Components

**Dependency Injection Container** (`src/container.ts` & `src/presenterBindings.ts`)
- Central IoC container using InversifyJS
- All repositories and presenters are bound as singletons
- Symbol-based type identifiers in `src/types.ts`
- Initialization happens in `App.tsx` via `bindPresenters()`

**Repository Layer** (`src/repositories/`)
- Interfaces: `src/repositories/interfaces.ts` - Defines contracts for data access
- Implementations: `src/repositories/implementations.ts` - Concrete implementations
- Repositories handle API calls via `ApiService`
- All repository methods are async and return domain models

**Presenter Layer** (`src/presenters/index.ts`)
- Presenters act as mediators between Views (React components) and Repositories
- Each presenter corresponds to a feature domain (Auth, Chat, Lectures, etc.)
- Dependency injection via `@inject()` decorator
- All presenters extend `BasePresenter` and implement `dispose()` method

**API Service** (`src/services/ApiService.ts`)
- Singleton axios-based HTTP client
- Automatic token refresh with request queuing during refresh
- JWT access token in memory (not localStorage)
- Refresh token in HTTP-only cookie
- Handles 401 responses with automatic retry after token refresh

**Context Providers** (`src/context/`)
- React Context API for cross-cutting concerns
- `AuthContext`: Authentication state and user session
- `CourseContext`: Selected course state
- `UserProfileContext`: Current user profile data
- `CourseSelectionContext`: Course selection workflow

**Models** (`src/models/index.ts`)
- Domain entities (User, Course, Lecture, etc.)
- API request/response types
- Type-safe interfaces for all data structures

### Authentication Flow

1. Login via `AuthContext.login()` → API call to `/auth/login`
2. Access token stored in `ApiService` memory, refresh token in HTTP-only cookie
3. All API requests include Bearer token via interceptor
4. On 401 response → automatic token refresh → retry failed requests
5. Session persists via refresh token cookie across page reloads

### Protected Routes

Use `<ProtectedRoute>` component to guard routes:
```tsx
<ProtectedRoute allow={["instructor"]}>
  <InstructorUpload />
</ProtectedRoute>
```

### Component Structure

- **Pages** (`src/pages/`): Top-level route components
- **Components** (`src/components/`): Reusable UI components
- **Layout** (`src/components/Layout.tsx`): Main layout with sidebar navigation

### Styling

- **Tailwind CSS** with custom Virginia Tech color scheme
- VT Brand Colors: `vt-maroon` (#630031), `vt-orange` (#FF6600), `vt-gray` (#54585A)
- Custom utility classes defined in `tailwind.config.js`
- Global styles in `src/index.css`

## Development Guidelines

### Adding New Features

1. **Define Model** in `src/models/index.ts`
2. **Create Repository Interface** in `src/repositories/interfaces.ts`
3. **Implement Repository** in `src/repositories/implementations.ts`
4. **Add Type Symbol** to `src/types.ts`
5. **Bind Repository** in `src/container.ts`
6. **Create Presenter** in `src/presenters/index.ts`
7. **Bind Presenter** in `src/presenterBindings.ts`
8. **Build UI Component/Page** that uses the presenter

### Dependency Injection Usage

Get dependencies from container in React components:
```tsx
import { container } from '../container';
import { TYPES } from '../types';
import type { IChatPresenter } from '../presenters';

const presenter = container.get<IChatPresenter>(TYPES.ChatPresenter);
```

### TypeScript Configuration

- Strict mode enabled
- Decorators enabled (`experimentalDecorators`, `emitDecoratorMetadata`)
- Target: ES2020
- React JSX transform

### Backend Integration

This frontend expects a Java Spring Boot backend running on port 3167. Key API endpoints:
- `/api/auth/login` - Authentication
- `/api/auth/refresh` - Token refresh
- `/api/auth/me` - Current user info
- `/api/auth/logout` - Logout

The backend repository is likely in a sibling directory (`VT-AI-Lecture-Assistant-Backend_Java`).
