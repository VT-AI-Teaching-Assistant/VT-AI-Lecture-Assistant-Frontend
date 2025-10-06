# VT AI Lecture Assistant - MVP Architecture

This project has been refactored to follow the **Model-View-Presenter (MVP)** architecture pattern with proper separation of concerns, dependency injection, and remote data fetching capabilities.

## Architecture Overview

### 🏗️ MVP Pattern Structure

```
src/
├── models/                 # Domain models and entities
├── repositories/           # Data access layer
│   ├── interfaces.ts      # Repository interfaces
│   └── implementations.ts # Concrete repository implementations
├── services/              # API service layer
├── presenters/           # Business logic layer
├── container.ts          # Dependency injection container
├── utils/                # Utilities and error handling
└── pages/                # View layer (React components)
```

### 🔧 Key Components

#### 1. **Models** (`src/models/`)
- Domain entities and data transfer objects
- Type definitions for API requests/responses
- Centralized data structure definitions

#### 2. **Repositories** (`src/repositories/`)
- **Interfaces**: Abstract data access contracts
- **Implementations**: Concrete implementations for remote API calls
- Follows Repository pattern for data abstraction

#### 3. **Services** (`src/services/`)
- **ApiService**: Centralized HTTP client with interceptors
- Handles authentication, error handling, and token management
- Configurable base URL and timeout settings

#### 4. **Presenters** (`src/presenters/`)
- Business logic layer
- Mediates between Views and Repositories
- Handles data transformation and error management
- Injectable dependencies for testability

#### 5. **Dependency Injection** (`src/container.ts`)
- Uses InversifyJS for dependency injection
- Singleton scope for repositories
- Easy testing and mocking capabilities

#### 6. **Error Handling** (`src/utils/errorHandling.ts`)
- Centralized error handling utilities
- Loading state management
- Error boundary component
- Custom hooks for async operations

## 🚀 Environment Configuration

### Environment Variables

Create `.env.local` file with:

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3167
REACT_APP_API_TIMEOUT=10000

# Authentication
REACT_APP_JWT_SECRET=dummy-secret-for-development

# Environment
REACT_APP_ENVIRONMENT=development

# Feature Flags
REACT_APP_ENABLE_DEBUG_MODE=true
REACT_APP_ENABLE_MOCK_DATA=false
```

## 📡 API Integration

### Base URL Configuration
The application is configured to fetch data from `http://localhost:3167/` by default.

### Authentication Flow
1. **Login**: Attempts remote authentication first, falls back to local hardcoded users
2. **Token Management**: Automatic token refresh and storage
3. **Logout**: Clears tokens and redirects to login

### API Endpoints Structure
```
GET    /auth/me                    # Get current user
POST   /auth/login                 # User login
POST   /auth/logout                # User logout
POST   /auth/refresh               # Refresh token

GET    /students/{id}/profile       # Get student profile
PATCH  /students/{id}/profile      # Update student profile
GET    /students/{id}/courses       # Get enrolled courses

GET    /announcements              # Get announcements
POST   /announcements              # Create announcement
GET    /announcements/{id}         # Get specific announcement

GET    /discussions                # Get discussions (paginated)
POST   /discussions                # Create discussion
GET    /discussions/{id}           # Get specific discussion

GET    /chat/messages              # Get chat messages
POST   /chat/messages              # Send message
POST   /chat/conversations         # Create conversation

GET    /lectures                   # Get lectures
POST   /lectures                   # Create lecture
GET    /lectures/{id}              # Get specific lecture

GET    /grades                     # Get grades
GET    /grades/{id}                # Get specific grade

GET    /faqs                       # Get FAQs
POST   /faqs                       # Create FAQ

GET    /transcripts                # Get transcripts
POST   /transcripts                # Upload transcript
GET    /transcripts/{id}           # Get specific transcript
```

## 🔄 Data Flow

### MVP Data Flow
```
View (React Component) 
    ↓ (user action)
Presenter (Business Logic)
    ↓ (data request)
Repository Interface
    ↓ (implementation)
Repository Implementation
    ↓ (HTTP call)
API Service
    ↓ (network request)
Remote Server (http://localhost:3167)
```

### Example: Loading Student Profile
1. **View**: Profile component calls `presenter.loadProfile()`
2. **Presenter**: Validates input, calls `studentRepository.getProfile()`
3. **Repository**: Makes HTTP request via `apiService.get()`
4. **API Service**: Sends request to `/students/{id}/profile`
5. **Response**: Data flows back through the layers
6. **View**: Updates UI with loading states, data, or errors

## 🛠️ Development Features

### Fallback Data
- Components include fallback data for development/demo purposes
- Graceful degradation when API is unavailable
- Easy switching between mock and real data

### Error Handling
- Comprehensive error boundaries
- Loading states for all async operations
- User-friendly error messages
- Network error detection and handling

### Type Safety
- Full TypeScript support
- Strongly typed models and interfaces
- Compile-time error detection

## 🧪 Testing Strategy

### Dependency Injection Benefits
- Easy mocking of repositories for unit tests
- Isolated testing of presenters
- Mock API responses for component testing

### Example Test Setup
```typescript
// Mock repository for testing
const mockStudentRepository = {
  getProfile: jest.fn().mockResolvedValue(mockProfile),
  updateProfile: jest.fn().mockResolvedValue(updatedProfile)
};

// Inject mock into container
container.rebind(TYPES.StudentRepository).toConstantValue(mockStudentRepository);
```

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API settings
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Start Backend Server**
   ```bash
   # Ensure your backend is running on http://localhost:3167
   ```

## 📝 Key Benefits

### ✅ Separation of Concerns
- Clear separation between UI, business logic, and data access
- Easier maintenance and testing

### ✅ Scalability
- Easy to add new features following the same pattern
- Repository pattern allows easy data source switching

### ✅ Testability
- Dependency injection enables easy mocking
- Isolated testing of each layer

### ✅ Error Handling
- Centralized error management
- Consistent user experience

### ✅ Type Safety
- Full TypeScript support
- Compile-time error detection

### ✅ Remote Data Integration
- Ready for production API integration
- Fallback mechanisms for development

## 🔧 Customization

### Adding New Features
1. Define models in `src/models/`
2. Create repository interface in `src/repositories/interfaces.ts`
3. Implement repository in `src/repositories/implementations.ts`
4. Create presenter in `src/presenters/`
5. Register dependencies in `src/container.ts`
6. Use presenter in React components

### Changing API Endpoints
- Update `src/services/ApiService.ts` base URL
- Modify repository implementations as needed
- Update environment variables

This architecture provides a solid foundation for a scalable, maintainable, and testable React application with proper separation of concerns and remote data integration capabilities.
