---
name: comick-source-api
description: Integrate, debug, or extend the Comick Source API at `https://comick-source-api.notaspider.dev` for multi-source manga/manhwa data. Use when Codex needs to add or update source adapters, discover available sources, wire search/chapters/frontpage endpoints, model source-aware route IDs, configure remote image hosts, or troubleshoot source-specific API behavior in this repo.
---

# Comick Source API

Use this skill when working on the repo's multi-source manga data layer.

## Quick Workflow

1. Read [references/api-overview.md](references/api-overview.md) before coding against a Comick Source API endpoint you have not touched yet.
2. Read [references/repo-integration.md](references/repo-integration.md) before adding a new source to this repo.
3. Discover source capabilities from the API before hardcoding assumptions:
   - `GET /api/sources` for source list
   - `GET /api/frontpage` for source frontpage support
   - `GET /api/health` when debugging empty or inconsistent results
4. Keep source identity explicit across the app:
   - preserve upstream `sourceId`
   - avoid assuming manga slugs are globally unique
   - use the repo's source-aware route ID helpers instead of plain slugs when wiring routes or saved state
5. Add new sources through the adapter/registry flow, not by branching inside one giant source file.

## Repo Rules

- Put one source adapter per source under `lib/data/sources/`.
- Register adapters centrally so shared data access stays source-agnostic.
- Keep search, chapter lookup, homepage/frontpage loading, and chapter page extraction inside the adapter.
- Update `next.config.ts` image `remotePatterns` through the source definition, not with one-off edits.
- When touching saved history, library, or reading progress, preserve compatibility with old IDs if the route format changes.

## Endpoint Usage

- Use `POST /api/search` for title discovery.
- Use `POST /api/chapters` for chapter listings from a source title URL.
- Use `GET /api/frontpage` to discover which frontpage sections a source supports.
- Use `POST /api/frontpage` only after confirming the section exists for that source.
- Use `source: "all"` only when the product explicitly wants cross-source aggregation.

## References

- API details: [references/api-overview.md](references/api-overview.md)
- Repo integration points: [references/repo-integration.md](references/repo-integration.md)
