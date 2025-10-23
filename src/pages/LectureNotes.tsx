import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTranscriptText, TranscriptText } from '../api/transcripts';
import { formatMarkdown } from '../utils/markdownFormatter';
import {
  ArrowLeftIcon,
  PrinterIcon,
  DocumentDuplicateIcon,
  CalendarIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

type RouteParams = {
  id: string;
};

const LectureNotes = () => {
  const { id } = useParams<RouteParams>();
  const navigate = useNavigate();
  const [data, setData] = useState<TranscriptText | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const transcriptId = useMemo(() => parseInt(id ?? '', 10), [id]);

  useEffect(() => {
    if (!Number.isFinite(transcriptId)) return;
    setLoading(true);
    setError(null);
    fetchTranscriptText(transcriptId)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load transcript'))
      .finally(() => setLoading(false));
  }, [transcriptId]);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <AcademicCapIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to load transcript</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => navigate('/lectures')}
          className="btn-primary"
        >
          Back to Lectures
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <AcademicCapIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{loading ? 'Loading…' : 'Lecture Not Found'}</h2>
        {!loading && <p className="text-gray-600 mb-6">The requested lecture notes could not be found.</p>}
        <button
          onClick={() => navigate('/lectures')}
          className="btn-primary"
        >
          Back to Lectures
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = (): void => {
    window.print();
  };

  const handleCopyNotes = (): void => {
    void navigator.clipboard.writeText(data.text);
    // eslint-disable-next-line no-alert
    alert('Notes copied to clipboard!');
  };


  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => navigate('/lectures')}
          className="flex items-center text-vt-maroon hover:text-vt-maroon/80 mb-4 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Lectures
        </button>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {data.name}
            </h1>
            
            <div className="flex items-center text-sm text-gray-600"></div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopyNotes}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
              Copy
            </button>
            
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print
            </button>
          </div>
        </div>
      </div>

      <div className="card print:shadow-none print:border-none">
        <div className="prose prose-gray max-w-none">
          <div className="space-y-2">
            {formatMarkdown(data.text)}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none,
          .print\\:shadow-none * {
            visibility: visible;
          }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 1in;
          }
        }
      `}</style>
    </div>
  );
};

export default LectureNotes;
