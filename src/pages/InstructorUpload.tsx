import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import { uploadTranscript } from '../api/transcripts';
import { getTranscriptionJobStatus, getVideoUploadUrl, startVideoTranscriptionJob } from '../api/videoTranscription';

type TranscriptionState = 'idle' | 'requestingUrl' | 'queued' | 'uploading' | 'processing' | 'completed' | 'failed';

const InstructorUpload = () => {
  const { user } = useAuth();
  const { selectedCourse } = useCourse();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [rawPreview, setRawPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [transcriptionStatus, setTranscriptionStatus] = useState<TranscriptionState>('idle');
  const [transcriptionMessage, setTranscriptionMessage] = useState<string | null>(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [generatedTranscript, setGeneratedTranscript] = useState('');
  const [transcriptionJobId, setTranscriptionJobId] = useState<string | null>(null);
  const [isSavingGenerated, setIsSavingGenerated] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f ?? null);
    setResult(null);
    setError(null);
    if (f) {
      const text = await f.text();
      setRawPreview(text.slice(0, 2000));
    } else {
      setRawPreview('');
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setVideoFile(f ?? null);
    setTranscriptionError(null);
    setTranscriptionMessage(null);
    setGeneratedTranscript('');
    setUploadProgress(0);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  const checkJobStatus = async (jobId: string) => {
    try {
      const status = await getTranscriptionJobStatus(jobId);
      console.log('Transcription job status:', status);

      // Check both mapped status and raw status for safety
      const isCompleted = status.status === 'completed' || status.rawStatus === 'COMPLETED';
      const isFailed = status.status === 'failed' || status.rawStatus === 'FAILED';

      if (isCompleted) {
        if (status.transcript) {
          setGeneratedTranscript(status.transcript);
          setTranscriptionStatus('completed');
          setTranscriptionMessage('Transcription complete. Review and upload when ready.');
          stopPolling();
          return true; // Job is done
        } else {
          // Status is COMPLETED but transcript is missing - might be an error downloading
          setTranscriptionStatus('failed');
          setTranscriptionError('Transcription job completed but transcript text is missing. The transcript may have failed to download from storage.');
          stopPolling();
          return true; // Job is done (but with error)
        }
      } else if (isFailed) {
        setTranscriptionStatus('failed');
        setTranscriptionError(status.errorMessage || 'Transcription job failed.');
        stopPolling();
        return true; // Job is done
      } else {
        // Still in progress
        setTranscriptionStatus(status.status);
        return false; // Job still in progress
      }
    } catch (err) {
      console.error('Error checking transcription status:', err);
      setTranscriptionStatus('failed');
      const errorMessage = err instanceof Error ? err.message : 'Unable to check transcription status.';
      setTranscriptionError(errorMessage);
      stopPolling();
      return true; // Stop polling on error
    }
  };

  const pollTranscriptionJob = (jobId: string) => {
    stopPolling();

    // Check immediately
    checkJobStatus(jobId).then((isDone) => {
      if (!isDone) {
        // If not done, start polling every 5 seconds
        pollIntervalRef.current = setInterval(async () => {
          await checkJobStatus(jobId);
        }, 5000);
      }
    });
  };

  const ensureCourseContext = () => {
    if (!selectedCourse) {
      throw new Error('Please select a course context first from your Profile page.');
    }
    if (!selectedCourse.course_id) {
      throw new Error('Course ID is missing. Please reselect your course context from the Profile page.');
    }
    return selectedCourse.course_id;
  };

  const handleVideoTranscription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const courseId = ensureCourseContext();
      if (!user) {
        throw new Error('User information not available. Please log in again.');
      }
      if (!videoFile) {
        throw new Error('Please select a video file (mp4, mov, or webm).');
      }

      const resolvedTitle = videoTitle.trim() || videoFile.name.replace(/\.[^/.]+$/, '');

      setTranscriptionError(null);
      setTranscriptionMessage('Requesting secure upload URL…');
      setTranscriptionStatus('requestingUrl');
      setGeneratedTranscript('');
      setUploadProgress(0);
      setResult(null);
      setError(null);

      const { uploadUrl, fileUrl } = await getVideoUploadUrl({
        fileName: videoFile.name,
        fileType: videoFile.type || 'video/mp4',
        courseId
      });

      setTranscriptionMessage('Uploading video to S3…');
      setTranscriptionStatus('uploading');
      await axios.put(uploadUrl, videoFile, {
        headers: {
          'Content-Type': videoFile.type || 'video/mp4'
        },
        onUploadProgress: (event) => {
          if (event.total) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        }
      });
      setUploadProgress(100);

      setTranscriptionMessage('Starting transcription job…');
      const { jobId } = await startVideoTranscriptionJob({
        fileUrl,
        title: resolvedTitle,
        courseId
      });
      setTranscriptionJobId(jobId);
      setTranscriptionStatus('processing');
      setTranscriptionMessage('Transcription in progress. This may take a few minutes…');

      pollTranscriptionJob(jobId);
    } catch (err) {
      stopPolling();
      setTranscriptionStatus('failed');
      setTranscriptionError(err instanceof Error ? err.message : 'Unable to process video transcription.');
    }
  };

  const handleSaveGeneratedTranscript = async () => {
    try {
      const courseId = ensureCourseContext();
      if (!generatedTranscript.trim()) {
        throw new Error('No transcript available. Please wait for the transcription to finish.');
      }

      setIsSavingGenerated(true);
      setTranscriptionError(null);
      const resolvedTitle = videoTitle.trim() || `Video Lecture ${new Date().toLocaleDateString()}`;

      await uploadTranscript({
        courseId,
        title: resolvedTitle,
        rawText: generatedTranscript
      });
      setTranscriptionMessage('Transcript uploaded successfully!');
      setTranscriptionStatus('completed');
    } catch (err) {
      setTranscriptionError(err instanceof Error ? err.message : 'Unable to upload generated transcript.');
    } finally {
      setIsSavingGenerated(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate course context
    if (!selectedCourse) {
      setError('Please select a course context first from your Profile page');
      return;
    }

    // Validate course ID
    if (!selectedCourse.course_id) {
      setError('Course ID is missing. Please reselect your course context from the Profile page.');
      return;
    }

    // Validate user
    if (!user) {
      setError('User information not available. Please log in again.');
      return;
    }

    if (!file) {
      setError('Please select a .txt file');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a lecture title');
      return;
    }

    setIsSubmitting(true);
    setResult(null);
    setError(null);
    try {
      const rawText = await file.text();
      console.log('InstructorUpload - selectedCourse:', selectedCourse);
      console.log('InstructorUpload - sending courseId:', selectedCourse.course_id);

      // instructor_id is now extracted from JWT token on backend
      const data = await uploadTranscript({
        courseId: selectedCourse.course_id, // Use numeric course_id from selectedCourse
        title: title.trim(),
        rawText
      });
      setResult(`Transcript uploaded successfully! ID: ${data?.id || 'unknown'}`);
      // Clear form
      setTitle('');
      setFile(null);
      setRawPreview('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-vt-maroon to-vt-orange text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold">Instructor Portal</h1>
        <p className="mt-2 opacity-90">Upload lecture transcripts or generate them from lecture videos</p>
      </div>

      <div className="card">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Upload Transcript (.txt)</h2>
          {selectedCourse ? (
            <p className="text-gray-600 text-sm">
              Uploading to: <span className="font-medium text-vt-maroon">{selectedCourse.title}</span>
            </p>
          ) : (
            <p className="text-amber-600 text-sm">⚠️ Please select a course context from your Profile page first.</p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lecture Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vt-maroon focus:border-transparent"
              placeholder="Lecture 2: Intro to ML"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transcript File (.txt)</label>
            <input
              type="file"
              accept=".txt,text/plain"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-vt-maroon file:text-white hover:file:bg-red-800"
            />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Uploading…' : 'Upload Transcript'}
            </button>
            {user?.role === 'instructor' && (
              <span className="text-xs text-gray-500">Signed in as {user.name}</span>
            )}
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {result && <div className="text-green-700 text-sm">{result}</div>}
        </form>
      </div>

      <div className="card">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Generate Transcript from Video</h2>
          <p className="text-sm text-gray-600">
            Upload a lecture recording. We will push it to S3, run transcription, and let you review the text before saving.
          </p>
        </div>
        <form onSubmit={handleVideoTranscription} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lecture Title</label>
            <input
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vt-maroon focus:border-transparent"
              placeholder="Lecture 5: Distributed Systems Deep Dive"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lecture Video</label>
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              onChange={handleVideoFileChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-vt-maroon file:text-white hover:file:bg-red-800"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={transcriptionStatus === 'uploading' || transcriptionStatus === 'processing'}
              className="btn-secondary"
            >
              {transcriptionStatus === 'uploading'
                ? 'Uploading…'
                : transcriptionStatus === 'processing'
                  ? 'Transcribing…'
                  : 'Upload & Transcribe'}
            </button>
            <button
              type="button"
              onClick={handleSaveGeneratedTranscript}
              disabled={!generatedTranscript || isSavingGenerated}
              className="btn-primary disabled:opacity-60"
            >
              {isSavingGenerated ? 'Saving…' : 'Save Transcript'}
            </button>
          </div>
          {transcriptionStatus === 'uploading' && (
            <div className="text-sm text-gray-600">
              Uploading video… {uploadProgress}%
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-vt-maroon h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
          {transcriptionMessage && <div className="text-sm text-gray-600">{transcriptionMessage}</div>}
          {transcriptionError && <div className="text-sm text-red-600">{transcriptionError}</div>}
        </form>
      </div>

      {rawPreview && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview (first 2000 chars)</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 max-h-64 overflow-auto border border-gray-100 rounded-md p-3">{rawPreview}</pre>
        </div>
      )}

      {generatedTranscript && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Generated Transcript</h3>
            {transcriptionStatus === 'processing' && <span className="text-xs text-amber-600">Still processing…</span>}
          </div>
          <textarea
            value={generatedTranscript}
            onChange={(e) => setGeneratedTranscript(e.target.value)}
            className="w-full h-64 text-sm text-gray-800 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-vt-maroon focus:border-transparent"
          />
          <p className="text-xs text-gray-500">You can edit this text before saving it as a transcript.</p>
        </div>
      )}
    </div>
  );
};

export default InstructorUpload;
