import { useQuery } from '@tanstack/react-query';
import type { ContentRating, MangaPage, MangaStatus, ReadingDirection } from '@rinku/core';

// Base URL of the standalone @rinku/api server (Hono, hosted off Vercel).
// Defaults to the local dev port; override with EXPO_PUBLIC_API_URL for a
// physical device (your machine's LAN IP) or the deployed API URL.
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001'
).replace(/\/$/, '');

// Slim card payload returned by the list endpoints.
export interface MangaCard {
  id: string;
  title: string;
  image: string | null;
  chapterCount: number;
  lastChapterLabel: string;
  genres: string[];
  contentRating: ContentRating;
  status: MangaStatus;
  synopsis: string;
}

export interface HomeResponse {
  featured: MangaCard[];
  latest: MangaCard[];
  spotlight: MangaCard[];
  archive: MangaCard[];
}

export interface MangaListResponse {
  items: MangaCard[];
  total: number;
}

export interface MangaDetailChapter {
  id: string;
  title: string;
  chapter: string | null;
  releaseDate: string | null;
  pageCount: number;
  readable: boolean;
  sourceUrl: string;
}

export interface MangaDetail {
  source: string;
  provider: string;
  manga: {
    id: string;
    slug: string;
    sourceUrl: string | null;
    title: string;
    altTitles: string[];
    tagline: string;
    synopsis: string;
    coverImage: string | null;
    authors: string[];
    genres: string[];
    status: MangaStatus;
    contentRating: ContentRating;
    readingDirection: ReadingDirection;
    updatedAt: string;
    chapterCount: number;
  };
  chapters: MangaDetailChapter[];
}

export interface ChapterPagesResponse {
  pages: MangaPage[];
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request to ${path} failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export function useHome() {
  return useQuery({
    queryKey: ['home'],
    queryFn: () => getJson<HomeResponse>('/api/home'),
    staleTime: 5 * 60 * 1000,
  });
}

export interface BrowseParams {
  q?: string;
  genre?: string;
  sort?: string;
  page?: number;
}

export function useBrowse(params: BrowseParams) {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.genre) search.set('genre', params.genre);
  if (params.sort) search.set('sort', params.sort);
  search.set('page', String(params.page ?? 1));

  return useQuery({
    queryKey: ['browse', params],
    queryFn: () => getJson<MangaListResponse>(`/api/browse?${search.toString()}`),
    staleTime: 60 * 1000,
  });
}

export function useGenre(slug: string, page = 1) {
  return useQuery({
    queryKey: ['genre', slug, page],
    queryFn: () =>
      getJson<MangaListResponse>(`/api/genre/${encodeURIComponent(slug)}?page=${page}`),
    enabled: Boolean(slug),
    staleTime: 60 * 1000,
  });
}

export function useSearch(query: string) {
  const q = query.trim();
  return useQuery({
    queryKey: ['search', q],
    queryFn: () => getJson<MangaListResponse>(`/api/search?q=${encodeURIComponent(q)}`),
    enabled: q.length >= 2,
    staleTime: 60 * 1000,
  });
}

export function useMangaDetail(slug: string) {
  return useQuery({
    queryKey: ['manga', slug],
    queryFn: () => getJson<MangaDetail>(`/api/manga/${encodeURIComponent(slug)}`),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
}

export function useChapterPages(url: string, sourceId?: string) {
  return useQuery({
    queryKey: ['chapter', url, sourceId],
    queryFn: () => {
      const search = new URLSearchParams({ url });
      if (sourceId) search.set('sourceId', sourceId);
      return getJson<ChapterPagesResponse>(`/api/chapter?${search.toString()}`);
    },
    enabled: Boolean(url),
    staleTime: 10 * 60 * 1000,
  });
}
