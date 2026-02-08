# AI Lecture Assistant - Virginia Tech (Frontend)

React + TypeScript frontend for the Virginia Tech AI Lecture Assistant. It provides a learning management interface with AI-powered Q&A, lecture notes, and Canvas LMS integration. Authentication is via Canvas OAuth only; the app talks to the Spring Boot backend (API gateway) for all data.

## Features

### Authentication
- **Canvas OAuth only**: Sign in with Canvas; no email/password login. The backend exchanges the OAuth code for tokens and issues JWTs. Redirect URI and OAuth server URL are configurable via environment variables.

### Public Routes
- **Landing** (`/`): Public marketing page (HokieLearn AI) with hero, features, about, and testimonials. Scroll-aware nav; redirects authenticated users to `/home` or `/profile`.
- **Login** (`/login`): Single "Sign in with Canvas" button; redirects to Canvas OAuth.
- **OAuth callback** (`/auth/callback`): Handles redirect from Canvas; exchanges code via backend and redirects to `/home` or `/profile` by role.

### Protected Routes (require authentication)
- **Profile** (`/profile`): User info and academic context; course registration.
- **Home** (`/home`): Announcements and discussions (Piazza-style).
- **Chat** (`/chat`): AI Q&A with course-aware context; markdown, copy, typing indicators.
- **Lectures** (`/lectures`), **Lecture notes** (`/lectures/:id/notes`): Course materials, notes, and placeholders for quiz/recording.
- **FAQ** (`/faq`): Expandable Q&A with search and categories.
- **History** (`/history`): Student-only; past Q&A history.
- **Knowledge Base** (`/knowledge-base`): Instructor-only; syllabus, assignments, announcements, modules, vectorization status.
- **Analytics** (`/analytics`, `/analytics/student/:studentId`): Instructor-only; Q&A analytics and per-student detail.
- **Disputes** (`/disputes`): Instructor-only; Q&A dispute resolution.
- **Upload Transcript** (`/instructor/upload`): Instructor-only; transcript upload and processing.

### Design
- Virginia Tech branding (maroon/orange); responsive layout; sidebar nav with role-based items; Inter and DM Serif Display fonts; Tailwind-based design system with custom animations (e.g. rise, reveal, float).

## Technology Stack

- **React 18** with hooks and functional components
- **TypeScript**
- **React Router 6** for client-side routing
- **Tailwind CSS** for styling (custom theme: maroon, orange, VT gray)
- **Lucide React** and **Heroicons** for icons
- **Inversify** for dependency injection (repositories, presenters)
- **Axios** via `ApiService` (JWT in memory, refresh via HTTP-only cookie)
- **Recharts** for analytics charts

## Installation and Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables**  
   Create a `.env` in the project root (or set in the shell). Required:
   - `REACT_APP_API_BASE_URL` – Backend API base URL (e.g. `http://localhost:3167/api`). Required; app throws if missing.
   - `REACT_APP_API_TIMEOUT` – Request timeout in ms (optional; default 60000).
   - `REACT_APP_OAUTH_SERVER_URL` – Canvas OAuth server URL (e.g. `https://canvas.vt.edu` or mock server for dev).
   - `REACT_APP_OAUTH_CLIENT_ID` – OAuth client ID.
   - `REACT_APP_OAUTH_REDIRECT_URI` – OAuth redirect URI (e.g. `http://localhost:3000/auth/callback` for local dev).

3. **Start development server**
   ```bash
   npm start
   ```
   App runs at `http://localhost:3000` by default.

## Scripts

- `npm start` – Development server (port 3000).
- `npm run build` – Production build (output in `build/`).
- `npm test` – Run tests.
- `npm run eject` – Eject from Create React App (irreversible).

## Design System

### Colors (Tailwind)
- **VT Maroon**: `#630031` (`vt-maroon`); also `maroon` / `maroon-dark` / `maroon-light`.
- **VT Orange**: `#FF6600` (`vt-orange`); also `orange` / `orange-dark` / `orange-light`.
- **VT Gray**: `#54585A` (`vt-gray`); **VT Light Gray**: `#F5F5F5` (`vt-light-gray`).

### Typography
- Sans: Inter (system fallback).
- Display: DM Serif Display (Georgia fallback); loaded from Google Fonts in `src/index.css`.

### Custom animations (Tailwind)
- `fade-in`, `fade-in-delay`, `slide-up`, `slide-up-delay`
- `rise`, `rise-d1` … `rise-d5`, `reveal`, `reveal-d1`, `reveal-d2`
- `float`, `pulse-slow`, `slide-in-right`

## Project Structure (high level)

- `src/App.tsx` – Route definitions; `AuthProvider`, `CourseProvider`, etc.
- `src/pages/` – Page components (Landing, Login, OAuthCallback, Home, Profile, Chat, etc.).
- `src/components/` – Layout, ProtectedRoute, modals, course/student UI.
- `src/context/` – AuthContext, CourseContext, UserProfileContext, CourseSelectionContext.
- `src/config/oauth.ts` – OAuth config and `getAuthorizationUrl()`.
- `src/services/ApiService.ts` – Axios instance, JWT attachment, refresh handling.
- `src/repositories/` – API layer (interfaces + implementations).
- `src/presenters/` – Business logic and repository orchestration.
- `src/container.ts` – Inversify container; `presenterBindings.ts` wires presenters.
- `src/models/index.ts` – Shared TypeScript types and DTOs.
- `tailwind.config.js` – Theme (colors, fonts, animations).

## Adding a new page

1. Add the component under `src/pages/`.
2. Add the route in `src/App.tsx` (public under `<Routes>`, or protected inside `<Layout>` with `<ProtectedRoute>` and optional `allow={["instructor"]}` or `allow={["student"]}`).
3. If it should appear in the sidebar, extend the `navigation` array in `src/components/Layout.tsx` (role-based logic is already there).

## Docker

Multi-stage build: Node 18 Alpine for build, nginx Alpine for serving.

- Build: `docker build -t vt-ai-frontend .`
- Run: e.g. `docker run -p 80:80 vt-ai-frontend`

Build args (defaults in Dockerfile): `REACT_APP_API_BASE_URL`, `REACT_APP_API_TIMEOUT`, `REACT_APP_OAUTH_SERVER_URL`, `REACT_APP_OAUTH_CLIENT_ID`, `REACT_APP_OAUTH_REDIRECT_URI`. Override with `--build-arg` when building for different environments.

## Deployment

- Run `npm run build` and deploy the `build/` directory to any static host (e.g. S3 + CloudFront, Netlify, Vercel).
- Ensure `REACT_APP_*` values are set at build time for the target environment; the backend URL and OAuth redirect URI must match the deployed frontend URL.

## Virginia Tech integration

- Canvas OAuth for sign-in; backend stores and uses Canvas tokens for API calls.
- VT branding and terminology; role-based experience for students and instructors.
- Built for use with the VT AI Lecture Assistant backend and Canvas LMS. 

---

**Built with ❤️ for VT students by VT students**
