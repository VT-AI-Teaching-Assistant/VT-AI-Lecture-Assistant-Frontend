export const YOUTUBE_LECTURES_STORAGE_KEY = 'vt-ai-youtube-lectures';

export type LocalYoutubeLecture = {
  id: string;
  courseId: number;
  title: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  createdAt: string;
};

const ALLOWED_YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'music.youtube.com',
]);

function normalizeHost(hostname: string): string {
  return hostname.trim().toLowerCase();
}

export function extractYouTubeVideoId(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl.trim());
    const host = normalizeHost(parsed.hostname);

    if (!ALLOWED_YOUTUBE_HOSTS.has(host)) return null;

    if (host.includes('youtu.be')) {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id || null;
    }

    const vParam = parsed.searchParams.get('v');
    if (vParam) return vParam;

    const segments = parsed.pathname.split('/').filter(Boolean);
    const patterns = ['embed', 'shorts', 'live'];
    for (const pattern of patterns) {
      const index = segments.indexOf(pattern);
      if (index >= 0 && segments[index + 1]) return segments[index + 1];
    }

    return null;
  } catch {
    return null;
  }
}

export function isLikelyValidYouTubeId(id: string): boolean {
  return /^[A-Za-z0-9_-]{11}$/.test(id);
}

export function toCanonicalYouTubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function readLocalYoutubeLectures(): LocalYoutubeLecture[] {
  try {
    const raw = localStorage.getItem(YOUTUBE_LECTURES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalYoutubeLecture[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLocalYoutubeLectures(lectures: LocalYoutubeLecture[]): void {
  localStorage.setItem(YOUTUBE_LECTURES_STORAGE_KEY, JSON.stringify(lectures));
}
