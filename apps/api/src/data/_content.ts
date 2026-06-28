// Adult / content-rating helpers used by the data layer. Copied from the web's
// lib/readrinku.ts (the pure domain logic) so the API has no dependency on the
// web app. Keep in sync with the web copy until both share @rinku/core.
import type { ContentRating } from '@rinku/core';

// Genres that mark a title as explicitly 18+. Substrings catch variants
// (erotic->Erotica, porn->Pornographic, doujin->Doujinshi).
export const ADULT_GENRE_HINTS = [
  'adult',
  'smut',
  'hentai',
  'erotic',
  'porn',
  'doujin',
  '18+',
];

// Non-18+ genres whose label contains an adult hint as a substring (e.g.
// MyAnimeList's "Adult Cast" = grown-up characters, not explicit content).
const NOT_ADULT_GENRES = new Set(['adult cast']);

function hasAdultGenre(genres: readonly string[] | undefined) {
  return (genres ?? []).some((genre) => {
    const value = genre.toLowerCase().trim();
    if (NOT_ADULT_GENRES.has(value)) {
      return false;
    }
    return ADULT_GENRE_HINTS.some((hint) => value.includes(hint));
  });
}

export function isAdultContent(
  contentRating: ContentRating | string | undefined,
  genres: readonly string[] | undefined
) {
  return contentRating === 'mature' || hasAdultGenre(genres);
}

export function hasAdultTitle(title: string, altTitles: readonly string[] = []) {
  return [title, ...altTitles].some((value) => {
    const text = (value ?? '').toLowerCase();
    return ADULT_GENRE_HINTS.some((hint) => text.includes(hint));
  });
}

export function deriveContentRating(
  genres: readonly string[] | undefined
): ContentRating {
  if (hasAdultGenre(genres)) {
    return 'mature';
  }
  if ((genres ?? []).some((genre) => genre.toLowerCase().includes('teen'))) {
    return 'teen';
  }
  return 'everyone';
}
