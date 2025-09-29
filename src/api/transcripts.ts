export const API_BASE = 'http://localhost:3000/api';
export const TOKEN = 'dummy'; // Replace with real JWT in production

export type TranscriptSummary = { id: number; name: string; firstSentence: string };
export type TranscriptText = { id: number; name: string; text: string };

const authHeaders = () => ({
  'Authorization': `Bearer ${TOKEN}`
});

export async function fetchTranscriptSummaries(courseId: number): Promise<TranscriptSummary[]> {
  const res = await fetch(`${API_BASE}/transcripts/course/${courseId}`, {
    headers: authHeaders()
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Failed to load transcripts (${res.status})`);
  }
  return res.json();
}

export async function fetchTranscriptText(transcriptId: number): Promise<TranscriptText> {
  const res = await fetch(`${API_BASE}/transcripts/${transcriptId}/text`, {
    headers: authHeaders()
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Failed to load transcript (${res.status})`);
  }
  return res.json();
}

export async function uploadTranscript(params: { title: string; rawText: string; courseId: number; instructorId: number }): Promise<any> {
  const res = await fetch(`${API_BASE}/transcripts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Failed to upload transcript (${res.status})`);
  }
  return res.json();
}


