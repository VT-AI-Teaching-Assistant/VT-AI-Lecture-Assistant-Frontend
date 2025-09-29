import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import InstructorUpload from './pages/InstructorUpload';
import { AuthProvider } from './context/AuthContext';
import Profile from './pages/Profile';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Lectures from './pages/Lectures';
import LectureNotes from './pages/LectureNotes';
import Grades from './pages/Grades';
import FAQ from './pages/FAQ';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={
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
      </AuthProvider>
    </Router>
  );
}

export default App;
