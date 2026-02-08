import React, { useState, useEffect, useCallback } from 'react';
import { useCourse } from '../context/CourseContext';
import { apiService } from '../services/ApiService';

interface CourseConfig {
  is_qa_enabled: boolean;
}

const Settings = () => {
  const { selectedCourse } = useCourse();
  const [config, setConfig] = useState<CourseConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    if (!selectedCourse?.course_id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get<{ success: boolean; data: CourseConfig; message: string }>(
        `/courses/${selectedCourse.course_id}/config`
      );
      if (response.success) {
        setConfig(response.data);
      }
    } catch (err: any) {
      console.error('Error loading course config:', err);
      setError('Failed to load course settings.');
    } finally {
      setLoading(false);
    }
  }, [selectedCourse?.course_id]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleToggleQa = async () => {
    if (!selectedCourse?.course_id || !config) return;
    const newValue = !config.is_qa_enabled;
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      const response = await apiService.put<{ success: boolean; data: CourseConfig; message: string }>(
        `/courses/${selectedCourse.course_id}/config`,
        { is_qa_enabled: newValue }
      );
      if (response.success) {
        setConfig(response.data);
        setSuccessMessage(
          newValue
            ? 'AI Chat Service has been enabled for this course.'
            : 'AI Chat Service has been disabled for this course.'
        );
      }
    } catch (err: any) {
      console.error('Error updating course config:', err);
      setError('Failed to update setting. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (!selectedCourse) {
    return (
      <div className="max-w-2xl mx-auto">
        <p className="text-gray-500">Please select a course first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Course Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure settings for {selectedCourse.code} — {selectedCourse.title}
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vt-maroon"></div>
          <span className="ml-3 text-gray-500">Loading settings...</span>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          <div className="px-6 py-5 flex items-center justify-between">
            <div className="flex-1 mr-4">
              <h3 className="text-base font-medium text-gray-900">AI Chat Service</h3>
              <p className="mt-1 text-sm text-gray-500">
                When enabled, students can ask AI-powered questions about course content.
                When disabled, students will see a message that the service is turned off.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={config?.is_qa_enabled ?? true}
              disabled={saving}
              onClick={handleToggleQa}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-vt-maroon focus:ring-offset-2 ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              } ${config?.is_qa_enabled ? 'bg-vt-maroon' : 'bg-gray-200'}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  config?.is_qa_enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
