import React from 'react';
import { useCourse } from '../context/CourseContext';
import VectorizationManager from '../components/VectorizationManager';
import KnowledgeBaseDashboard from '../components/KnowledgeBaseDashboard';

const KnowledgeBase = () => {
  const { selectedCourse } = useCourse();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-vt-maroon to-vt-orange text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <p className="mt-2 opacity-90">
          View and manage your course content that has been indexed for AI search
        </p>
        {selectedCourse ? (
          <p className="mt-2 text-sm opacity-75">
            Managing content for: <span className="font-medium">{selectedCourse.title}</span>
          </p>
        ) : (
          <p className="mt-2 text-amber-200 text-sm">
            ⚠️ Please select a course context from your Profile page to view knowledge base content.
          </p>
        )}
      </div>

      {selectedCourse && selectedCourse.course_id ? (
        <>
          {/* Vectorization Management Section */}
          <VectorizationManager courseId={selectedCourse.course_id} />
          
          {/* Knowledge Base Content Dashboard */}
          <KnowledgeBaseDashboard courseId={selectedCourse.course_id} />
        </>
      ) : (
        <div className="card text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Course Selected</h3>
          <p className="text-gray-600">
            Please select a course context from your Profile page to view and manage your knowledge base content.
          </p>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
