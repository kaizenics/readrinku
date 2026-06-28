import { useQuery } from '@tanstack/react-query';
import type { ContentRating, MangaStatus } from '@rinku/core';

// Base URL of the readrinku web app, which hosts the manga API (the server-only
// data layer over HTTP). Override per-environment with EXPO_PUBLIC_API_URL, e.g.
// your machine's LAN IP for a physical device, or the deployed URL.
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

// Mirrors the slim payload returned by apps/web/app/api/home/route.ts.
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
