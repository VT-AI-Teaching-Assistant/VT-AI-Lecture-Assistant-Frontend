import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTranscriptSummaries, TranscriptSummary } from '../api/transcripts';

type LectureItem = {
  id: number;
  title: string;
  description: string;
  date: string;
  duration: string;
  completed: boolean;
};

const Lectures = () => {
  const COURSE_ID = 1; // as per current portal mock course
  const [summaries, setSummaries] = useState<TranscriptSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchTranscriptSummaries(COURSE_ID)
      .then(setSummaries)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const total = useMemo(() => summaries?.length ?? 0, [summaries]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-vt-maroon to-vt-orange text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold">Course Lectures</h1>
        <p className="mt-2 opacity-90">Access lecture notes, recordings, and quizzes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Lectures</p>
              <p className="text-3xl font-bold text-vt-maroon">{total}</p>
            </div>
            <svg className="h-12 w-12 text-vt-maroon opacity-20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">3</p>
            </div>
            <svg className="h-12 w-12 text-green-600 opacity-20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <path d="m9 11 3 3L22 4"></path>
            </svg>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-3xl font-bold text-blue-600">0</p>
            </div>
            <svg className="h-12 w-12 text-blue-600 opacity-20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M8 2v4"></path>
              <path d="M16 2v4"></path>
              <rect width="18" height="18" x="3" y="4" rx="2"></rect>
              <path d="M3 10h18"></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">All Lectures</h2>
          <p className="text-gray-600 mt-1">CS 3114 - Data Structures and Algorithms</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {loading && (
            <div className="p-6 text-gray-600">Loading transcripts…</div>
          )}
          {error && (
            <div className="p-6 text-red-600">{error}</div>
          )}
          {!loading && !error && summaries && summaries.length === 0 && (
            <div className="p-6 text-gray-600">No transcripts found for this course.</div>
          )}
          {!loading && !error && summaries && summaries.map((t) => (
            <div key={t.id} className="p-6 transition-all duration-200 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-3">{t.firstSentence}</p>
                </div>
                <div className="flex items-center space-x-3 ml-6">
                  <Link
                    to={`/lectures/${t.id}/notes`}
                    className="flex items-center space-x-2 px-4 py-2 bg-vt-maroon text-white rounded-lg hover:bg-red-800 transition-colors duration-200"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                      <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                      <path d="M10 9H8"></path>
                      <path d="M16 13H8"></path>
                      <path d="M16 17H8"></path>
                    </svg>
                    <span>Notes</span>
                  </Link>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <path d="M12 17h.01"></path>
                    </svg>
                    <span>Quiz</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Lectures;
