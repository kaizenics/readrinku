# Repo Integration Notes

Use these paths when adding or changing sources in this repo:

## Main Files

- `lib/data/sources/source-config.ts`
  Add source metadata and allowed remote image patterns here.

- `lib/data/sources/types.ts`
  Shared adapter contracts for browse, title lookup, and chapter page loading.

- `lib/data/sources/registry.ts`
  Register each adapter here.

- `lib/data/sources/route-id.ts`
  Source-aware route and saved-state ID helpers. Use these instead of plain slugs.

- `lib/data/source.ts`
  Shared source facade used by pages and components. Keep this source-agnostic.

- `lib/data/manga-info.ts`
  Maps source data into the app's local `Manga` shape and reader flow.

- `next.config.ts`
  Remote image hosts are derived from source definitions. Update definitions, not one-off hardcoded host lists.

## Adapter Checklist

When adding a new source adapter:

1. Add the source definition.
2. Implement a new adapter file under `lib/data/sources/`.
3. Register the adapter.
4. Normalize results through the shared `lib/data/source.ts` layer.
5. Confirm that manga IDs remain source-aware.
6. Verify that reader history, library state, and saved progress still match existing entries.
7. Add any required remote image hosts through the source definition.

## Product Rules

- Keep per-source logic inside adapters, not pages.
- Avoid hardcoding a single source in UI copy, API routes, or route generation.
- Prefer capability discovery from the Comick Source API over hardcoded assumptions for frontpage support and available sections.
- When implementing cross-source search, decide explicitly whether the UX wants one selected source or aggregated `"all"` results.
