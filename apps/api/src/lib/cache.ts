// In-memory TTL cache for the standalone API. Replaces the two Next.js
// mechanisms the data layer relied on: React's cache() (request memoization)
// and fetch(..., { next: { revalidate } }) (HTTP cache). Because nearly every
// expensive data function is wrapped with cache(), a single process-wide TTL
// memo of those functions covers the upstream fetches they make.

const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface Entry {
  value: Promise<unknown>;
  expires: number;
}

/**
 * Drop-in replacement for React's `cache()`: returns a memoized version of an
 * async function, keyed by its JSON-serialized arguments, with a TTL. Preserves
 * the function's exact type (like React's own cache typing) so call sites keep
 * their parameter/return types. The in-flight promise is cached so concurrent
 * identical calls dedupe; a rejected promise is evicted so failures aren't cached.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  ttlMs: number = DEFAULT_TTL_MS
): T {
  const store = new Map<string, Entry>();

  const memoized = (...args: Parameters<T>): ReturnType<T> => {
    const key = args.length ? JSON.stringify(args) : '';
    const now = Date.now();
    const hit = store.get(key);

    if (hit && hit.expires > now) {
      return hit.value as ReturnType<T>;
    }

    const value = fn(...args);
    store.set(key, { value, expires: now + ttlMs });
    value.catch(() => {
      if (store.get(key)?.value === value) {
        store.delete(key);
      }
    });

    return value as ReturnType<T>;
  };

  return memoized as unknown as T;
}
