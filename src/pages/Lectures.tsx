import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import YouTube, { YouTubeProps } from 'react-youtube';
import { fetchTranscriptSummaries, TranscriptSummary } from '../api/transcripts';
import { useCourse } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import Students from '../components/Students';
import { LocalYoutubeLecture, readLocalYoutubeLectures } from '../utils/youtube';

const Lectures = () => {
  const { selectedCourse } = useCourse();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'lectures' | 'students'>('lectures');
  const COURSE_ID = selectedCourse?.course_id || 1; // Use numeric course_id from selectedCourse
  const [summaries, setSummaries] = useState<TranscriptSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [youtubeLectures, setYoutubeLectures] = useState<LocalYoutubeLecture[]>([]);
  const [selectedYoutubeLecture, setSelectedYoutubeLecture] = useState<LocalYoutubeLecture | null>(null);
  const [youtubeLoadError, setYoutubeLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCourse && activeTab === 'lectures') {
      console.log('Lectures - selectedCourse:', selectedCourse);
      console.log('Lectures - fetching transcripts for courseId:', COURSE_ID);
      setLoading(true);
      setError(null);
      fetchTranscriptSummaries(COURSE_ID)
        .then((data) => {
          console.log('Lectures - received transcripts:', data);
          setSummaries(data);
        })
        .catch((e) => {
          console.error('Lectures - error fetching transcripts:', e);
          setError(e instanceof Error ? e.message : 'Failed to load');
        })
        .finally(() => setLoading(false));
    }
  }, [selectedCourse, COURSE_ID, activeTab]);

  useEffect(() => {
    if (!selectedCourse || activeTab !== 'lectures') return;

    const allLocalYoutubeLectures = readLocalYoutubeLectures();
    const courseYoutubeLectures = allLocalYoutubeLectures
      .filter((lecture) => lecture.courseId === selectedCourse.course_id)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    setYoutubeLectures(courseYoutubeLectures);
    setSelectedYoutubeLecture(courseYoutubeLectures[0] || null);
    setYoutubeLoadError(null);
  }, [selectedCourse, activeTab]);

  const total = useMemo(() => summaries?.length ?? 0, [summaries]);
  const totalWithYoutube = total + youtubeLectures.length;

  const youtubePlayerOpts: YouTubeProps['opts'] = {
    width: '100%',
    height: '420',
    playerVars: {
      autoplay: 0,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
    },
  };

  const renderLecturesContent = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Lectures</p>
              <p className="text-3xl font-bold text-vt-maroon">{totalWithYoutube}</p>
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
          <h2 className="text-xl font-bold text-gray-900">Video Lectures (Temporary)</h2>
          <p className="text-gray-600 mt-1">
            YouTube links added from Instructor Upload. Stored locally in this browser for testing.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {youtubeLectures.length === 0 && (
            <div className="text-gray-600">
              No local YouTube lectures found for this course yet.
            </div>
          )}

          {youtubeLectures.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {youtubeLectures.map((lecture) => (
                  <button
                    key={lecture.id}
                    onClick={() => {
                      setSelectedYoutubeLecture(lecture);
                      setYoutubeLoadError(null);
                    }}
                    className={`text-left border rounded-lg p-3 transition-colors ${
                      selectedYoutubeLecture?.id === lecture.id
                        ? 'border-vt-maroon bg-red-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{lecture.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Added {new Date(lecture.createdAt).toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>

              {selectedYoutubeLecture && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedYoutubeLecture.title}</h3>
                  <div className="rounded-lg overflow-hidden border border-gray-200 bg-black">
                    <YouTube
                      videoId={selectedYoutubeLecture.youtubeVideoId}
                      opts={youtubePlayerOpts}
                      className="w-full"
                      onError={() => {
                        setYoutubeLoadError(
                          'Unable to load this video. It may be private, region-restricted, or embedding may be disabled.'
                        );
                      }}
                    />
                  </div>
                  {youtubeLoadError && <div className="text-sm text-red-600">{youtubeLoadError}</div>}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">All Lectures</h2>
          <p className="text-gray-600 mt-1">
            {selectedCourse ? `${selectedCourse.code} - ${selectedCourse.title}` : 'Course Lectures'}
          </p>
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
    </>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-vt-maroon to-vt-orange text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold">Course Management</h1>
        <p className="mt-2 opacity-90">
          {selectedCourse 
            ? `Manage lectures and students for ${selectedCourse.code} - ${selectedCourse.title}`
            : 'Manage course content and students'
          }
        </p>
        {selectedCourse && (
          <div className="mt-3 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm inline-block">
            Current Course: {selectedCourse.code}
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('lectures')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'lectures'
                  ? 'border-vt-maroon text-vt-maroon'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                <span>Lectures</span>
              </div>
            </button>
            {user?.role === 'instructor' && (
              <button
                onClick={() => setActiveTab('students')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'students'
                    ? 'border-vt-maroon text-vt-maroon'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span>Students</span>
                </div>
              </button>
            )}
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'lectures' && renderLecturesContent()}
          {activeTab === 'students' && user?.role === 'instructor' && <Students />}
        </div>
      </div>
    </div>
  );
};

export default Lectures;
