// The data layer was written for Next.js, whose fetch accepts a `next` option.
// Standard fetch ignores it at runtime; this ambient augmentation just keeps
// TypeScript happy. Caching is handled by cache() in src/lib/cache.ts.
declare global {
  interface RequestInit {
    next?: { revalidate?: number | false; tags?: string[] };
  }
}

export {};
