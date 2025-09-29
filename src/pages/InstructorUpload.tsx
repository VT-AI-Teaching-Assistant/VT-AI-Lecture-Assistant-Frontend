import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { uploadTranscript } from '../api/transcripts';

const InstructorUpload = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [rawPreview, setRawPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const data = await uploadTranscript({
        courseId: 1,
        instructorId: 1,
        title: title.trim(),
        rawText
      });
      setResult('Transcript uploaded successfully (id: ' + (data?.id ?? 'unknown') + ').');
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
        <p className="mt-2 opacity-90">Upload lecture transcripts for your course</p>
      </div>

      <div className="card">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Upload Transcript (.txt)</h2>
          <p className="text-gray-600 text-sm">Course ID and Instructor ID are set to 1.</p>
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

      {rawPreview && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview (first 2000 chars)</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 max-h-64 overflow-auto border border-gray-100 rounded-md p-3">{rawPreview}</pre>
        </div>
      )}
    </div>
  );
};

export default InstructorUpload;


