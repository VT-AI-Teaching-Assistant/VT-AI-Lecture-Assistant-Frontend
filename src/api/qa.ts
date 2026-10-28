// QA API Service for frontend

import { apiService } from '../services/ApiService';

export interface QaRequest {
  question: string;
  courseId: number;
  courseName?: string;
}

export interface SourceInfo {
  sourceType: string;
  title: string | null;
  sourceId: string | null;
  courseId: string | null;
  fileName: string | null;
  chunkIndex: number | null;
  relevanceScore: number | null;
  excerpt: string | null;
  url: string | null;
}

export interface QaResponse {
  answer: string;
  question: string;
  courseId: number;
  timestamp: number;
  sources: SourceInfo[] | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

/** `meta` event of POST /qa/ask/stream: sent once retrieval is done, before any text. */
export interface QaStreamMeta {
  rid: string | null;
  modelUsed: string | null;
  sources: SourceInfo[];
}

/** `done` event of POST /qa/ask/stream. */
export interface QaStreamDone {
  stopReason: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
}

export interface QaStreamHandlers {
  onMeta?: (meta: QaStreamMeta) => void;
  onDelta: (text: string) => void;
  onDone?: (done: QaStreamDone) => void;
  /** The server reported an error after the stream started (any text so far stays valid). */
  onError?: (message: string) => void;
}

/** A streamed request failed. `textReceived` says whether any answer text had arrived. */
export class QaStreamError extends Error {
  constructor(message: string, public readonly textReceived: boolean) {
    super(message);
    this.name = 'QaStreamError';
  }
}

/**
 * Reads a Server-Sent Events body, calling onEvent(event, data) per event.
 * Exported for tests.
 */
export async function readSseStream(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: string, data: string) => void
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const dispatch = (block: string) => {
    let event = 'message';
    const data: string[] = [];
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) {
        event = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        data.push(line.slice(5).replace(/^ /, ''));
      }
    }
    if (data.length > 0) {
      onEvent(event, data.join('\n'));
    }
  };

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
    let end: number;
    while ((end = buffer.indexOf('\n\n')) !== -1) {
      dispatch(buffer.slice(0, end));
      buffer = buffer.slice(end + 2);
    }
  }
  if (buffer.trim()) {
    dispatch(buffer);
  }
}

export class QaApiService {
  private static instance: QaApiService;

  private constructor() {}

  public static getInstance(): QaApiService {
    if (!QaApiService.instance) {
      QaApiService.instance = new QaApiService();
    }
    return QaApiService.instance;
  }

  // QA requests can take longer due to:
  // 1. Embedding generation
  // 2. Vector search
  // 3. LLM response generation (Claude)
  // Use 120 second timeout for chat operations
  private readonly QA_TIMEOUT = 120000; // 120 seconds

  async askQuestion(question: string, courseId: number, courseName?: string): Promise<QaResponse> {
    try {
      const request: QaRequest = {
        question,
        courseId,
        ...(courseName ? { courseName } : {})
      };

      const response = await apiService.post<ApiResponse<QaResponse>>(
        '/qa/ask',
        request,
        { timeout: this.QA_TIMEOUT }
      );

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to get answer');
      }
    } catch (error) {
      console.error('QA API error:', error);
      throw error;
    }
  }

  /**
   * Streaming variant of askQuestion: POST /qa/ask/stream, with the answer arriving as
   * Server-Sent Events (meta, delta..., done or error).
   *
   * Uses fetch rather than axios (axios can't stream in the browser, and EventSource
   * can't POST or send an Authorization header), so the 401 refresh-and-retry that
   * axios does is done here: on 401/403 it refreshes the token once and retries.
   *
   * Resolves once the stream ends with `done` or `error`. Throws QaStreamError if the
   * request fails or the stream is cut off; an aborted `signal` rejects with AbortError.
   */
  async askQuestionStream(
    question: string,
    courseId: number,
    courseName: string | undefined,
    handlers: QaStreamHandlers,
    signal?: AbortSignal
  ): Promise<void> {
    const request: QaRequest = { question, courseId, ...(courseName ? { courseName } : {}) };

    const send = (token: string | null) =>
      fetch(`${apiService.getBaseURL()}/qa/ask/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream, application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(request),
        credentials: 'include',
        signal,
      });

    let response = await send(apiService.getToken());
    if (response.status === 401 || response.status === 403) {
      response = await send(await apiService.refreshAccessToken());
    }

    const contentType = response.headers.get('Content-Type') || '';
    if (!response.ok || !response.body || !contentType.includes('text/event-stream')) {
      throw new QaStreamError(`QA stream request failed (HTTP ${response.status})`, false);
    }

    let textReceived = false;
    let finished = false;
    await readSseStream(response.body, (event, data) => {
      const payload = JSON.parse(data);
      switch (event) {
        case 'meta':
          handlers.onMeta?.({
            rid: payload.rid ?? null,
            modelUsed: payload.modelUsed ?? null,
            sources: payload.sources ?? [],
          });
          break;
        case 'delta':
          if (typeof payload.text === 'string') {
            textReceived = true;
            handlers.onDelta(payload.text);
          }
          break;
        case 'done':
          finished = true;
          handlers.onDone?.(payload);
          break;
        case 'error':
          finished = true;
          handlers.onError?.(payload.message || 'Sorry, I encountered an error. Please try again.');
          break;
      }
    });

    if (!finished) {
      throw new QaStreamError('The answer was cut off before it finished', textReceived);
    }
  }
}

export const qaApiService = QaApiService.getInstance();
