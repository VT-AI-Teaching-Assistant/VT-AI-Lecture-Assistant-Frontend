import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Landing from './pages/Landing';
import InstructorUpload from './pages/InstructorUpload';
import { AuthProvider } from './context/AuthContext';
import { CourseSelectionProvider } from './context/CourseSelectionContext';
import { UserProfileProvider } from './context/UserProfileContext';
import { CourseProvider } from './context/CourseContext';
import Profile from './pages/Profile';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Lectures from './pages/Lectures';
import LectureNotes from './pages/LectureNotes';
import Grades from './pages/Grades';
import FAQ from './pages/FAQ';
import Analytics from './pages/Analytics';
import StudentQuestionsDetail from './pages/StudentQuestionsDetail';
import History from './pages/History';
import Disputes from './pages/Disputes';
import { ErrorBoundary } from './utils/errorHandling';
import './container'; // Initialize dependency injection container
import { bindPresenters } from './presenterBindings'; // Bind presenters

// Initialize presenter bindings
bindPresenters();

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <UserProfileProvider>
            <CourseSelectionProvider>
              <CourseProvider>
                <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/*"
                  element={
                    <Layout>
                      <Routes>
                        <Route path="/home" element={
                          <ProtectedRoute>
                            <Home />
                          </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        } />
                        <Route path="/chat" element={
                          <ProtectedRoute>
                            <Chat />
                          </ProtectedRoute>
                        } />
                        <Route path="/lectures" element={
                          <ProtectedRoute>
                            <Lectures />
                          </ProtectedRoute>
                        } />
                        <Route path="/lectures/:id/notes" element={
                          <ProtectedRoute>
                            <LectureNotes />
                          </ProtectedRoute>
                        } />
                        <Route path="/grades" element={
                          <ProtectedRoute>
                            <Grades />
                          </ProtectedRoute>
                        } />
                        <Route path="/faq" element={
                          <ProtectedRoute>
                            <FAQ />
                          </ProtectedRoute>
                        } />
                        <Route path="/history" element={
                          <ProtectedRoute allow={["student"]}>
                            <History />
                          </ProtectedRoute>
                        } />
                        <Route path="/analytics" element={
                          <ProtectedRoute allow={["instructor"]}>
                            <Analytics />
                          </ProtectedRoute>
                        } />
                        <Route path="/analytics/student/:studentId" element={
                          <ProtectedRoute allow={["instructor"]}>
                            <StudentQuestionsDetail />
                          </ProtectedRoute>
                        } />
                        <Route path="/disputes" element={
                          <ProtectedRoute allow={["instructor"]}>
                            <Disputes />
                          </ProtectedRoute>
                        } />
                        <Route path="/instructor/upload" element={
                          <ProtectedRoute allow={["instructor"]}>
                            <InstructorUpload />
                          </ProtectedRoute>
                        } />
                      </Routes>
                    </Layout>
                  }
                />
              </Routes>
              </CourseProvider>
            </CourseSelectionProvider>
          </UserProfileProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
