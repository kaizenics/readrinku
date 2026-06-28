import { serve } from '@hono/node-server';
import type { SourceMangaPreview } from '@rinku/core';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { getMangaInfoBySlug } from './data/manga-info';
import {
  browseGenreManga,
  browseSourceManga,
  getArchiveSourceManga,
  getFeaturedSourceManga,
  getRecentSourceManga,
  getSearchSuggestions,
  getSourceChapterPages,
  getSpotlightSourceManga,
} from './data/source';

const app = new Hono();

// Public read API — mobile (and optionally web) fetch over HTTP. Native clients
// ignore CORS, but this keeps react-native-web / browsers happy too.
app.use('*', cors());

// Slim card payload (matches what the mobile MangaCard renders).
function toCard(manga: SourceMangaPreview) {
  return {
    id: manga.id,
    title: manga.title,
    image: manga.image,
    chapterCount: manga.chapterCount,
    lastChapterLabel: manga.lastChapterLabel,
    genres: manga.genres,
    contentRating: manga.contentRating,
    status: manga.status,
    synopsis: manga.synopsis,
  };
}

app.get('/health', (c) => c.json({ ok: true }));

// Homepage shelves.
app.get('/api/home', async (c) => {
  const [featured, latest, spotlight, archive] = await Promise.all([
    getFeaturedSourceManga(10),
    getRecentSourceManga(6),
    getSpotlightSourceManga(6),
    getArchiveSourceManga(6),
  ]);
  return c.json({
    featured: featured.map(toCard),
    latest: latest.map(toCard),
    spotlight: spotlight.map(toCard),
    archive: archive.map(toCard),
  });
});

// Browse / search (q drives the aggregated search path inside browseSourceManga).
app.get('/api/browse', async (c) => {
  const q = c.req.query('q') || undefined;
  const genre = c.req.query('genre') || undefined;
  const sort = c.req.query('sort') || undefined;
  const page = Number(c.req.query('page')) || 1;
  const source = c.req.query('source') || 'all';
  const familySafe = c.req.query('safe') !== '0';
  const result = await browseSourceManga({ q, genre, sort, page }, source, familySafe);
  return c.json({ items: result.items.map(toCard), total: result.total });
});

// Genre listing.
app.get('/api/genre/:slug', async (c) => {
  const page = Number(c.req.query('page')) || 1;
  const familySafe = c.req.query('safe') !== '0';
  const result = await browseGenreManga(c.req.param('slug'), { page }, familySafe);
  return c.json({ items: result.items.map(toCard), total: result.total });
});

// Header typeahead / search suggestions.
app.get('/api/search', async (c) => {
  const q = c.req.query('q') ?? '';
  const limit = Number(c.req.query('limit')) || 8;
  const result = await getSearchSuggestions(q, limit);
  return c.json({ items: result.items.map(toCard), total: result.total });
});

// Manga detail (mirrors the web /api/manga/[slug] shape).
app.get('/api/manga/:slug', async (c) => {
  const result = await getMangaInfoBySlug(c.req.param('slug'));
  if (!result) {
    return c.json({ message: 'Manga not found.' }, 404);
  }
  const { manga, sourceInfo, source, display } = result;
  return c.json({
    source,
    provider: sourceInfo.sourceId,
    manga: {
      id: manga.id,
      slug: manga.slug,
      sourceUrl: manga.sourceUrl ?? null,
      title: display.title,
      altTitles: display.altTitles,
      tagline: manga.tagline,
      synopsis: manga.synopsis,
      coverImage: display.coverImage,
      authors: manga.authors,
      genres: display.genres,
      status: manga.status,
      contentRating: manga.contentRating,
      readingDirection: manga.readingDirection,
      updatedAt: manga.updatedAt,
      chapterCount: display.chapterCount,
    },
    chapters: sourceInfo.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      chapter: chapter.chapter,
      releaseDate: chapter.releaseDate,
      pageCount: chapter.pageCount,
      readable: chapter.readable,
      sourceUrl: chapter.url,
    })),
  });
});

// Chapter pages (for the reader).
app.get('/api/chapter', async (c) => {
  const url = c.req.query('url');
  const sourceId = c.req.query('sourceId') || undefined;
  if (!url) {
    return c.json({ message: 'Missing ?url' }, 400);
  }
  const pages = await getSourceChapterPages(url, sourceId);
  return c.json({ pages });
});

const port = Number(process.env.PORT) || 3001;
serve({ fetch: app.fetch, port });
// eslint-disable-next-line no-console
console.log(`@rinku/api listening on http://localhost:${port}`);
