import { apiService } from '../services/ApiService';

export type TranscriptSummary = { id: number; name: string; firstSentence: string };
export type TranscriptText = { id: number; name: string; text: string };

export async function fetchTranscriptSummaries(courseId: number): Promise<TranscriptSummary[]> {
  const response = await apiService.get<{ success: boolean; data: any[] }>(`/transcripts/course/${courseId}`);
  
  // Backend returns Transcript entities, map to TranscriptSummary format
  const transcripts = response.data || [];
  return transcripts.map(transcript => ({
    id: transcript.transcriptId,
    name: transcript.title,
    firstSentence: transcript.rawText ? transcript.rawText.substring(0, 100) + '...' : 'No content available'
  }));
}

export async function fetchTranscriptText(transcriptId: number): Promise<TranscriptText> {
  const response = await apiService.get<{ success: boolean; data: TranscriptText }>(`/transcripts/${transcriptId}/text`);
  return response.data;
}

export async function uploadTranscript(params: { title: string; rawText: string; courseId: number }): Promise<any> {
  const response = await apiService.post<{ success: boolean; data: any }>('/transcripts', {
    // Backend DTO expects camelCase field names
    // instructor_id is extracted from JWT token on backend
    courseId: params.courseId,
    title: params.title,
    rawText: params.rawText
  });
  
  // Return transcript_id as id for backwards compatibility
  if (response.data) {
    return {
      ...response.data,
      id: response.data.transcript_id
    };
  }
  return response;
}

/**
 * Fetch notes/summary for a specific transcript
 * @param transcriptId The ID of the transcript
 * @returns Note data or status if not yet generated
 */
export async function fetchTranscriptNotes(transcriptId: number): Promise<any> {
  const response = await apiService.get<{ success: boolean; data: any }>(`/notes/${transcriptId}`);
  return response.data;
}


