# Comick Source API Overview

Primary source: `https://comick-source-api.notaspider.dev`

## Core Endpoints

### `GET /api/sources`

Use to discover available upstream sources.

Example response shape:

```json
{
  "sources": [
    {
      "id": "mangapark",
      "name": "MangaPark",
      "baseUrl": "https://mangapark.io",
      "description": "MangaPark - https://mangapark.io"
    }
  ]
}
```

### `POST /api/search`

Use for title search within one source or across all sources.

Request body:

```json
{
  "query": "solo leveling",
  "source": "mangapark"
}
```

Use `"all"` for `source` only when the UI intentionally wants merged results.

Response shape:

```json
{
  "results": [
    {
      "id": "343921",
      "title": "Solo Leveling",
      "url": "https://mangapark.io/title/75577-en-solo-leveling",
      "coverImage": "https://...",
      "latestChapter": 179,
      "lastUpdated": "2 days ago"
    }
  ],
  "source": "MangaPark"
}
```

### `POST /api/chapters`

Use after a search result or known source title URL is selected.

Request body:

```json
{
  "url": "https://mangapark.io/title/75577-en-solo-leveling",
  "source": "mangapark"
}
```

The `source` field is optional in the docs, but prefer sending it when known.

Response shape:

```json
{
  "chapters": [
    {
      "id": "1",
      "number": 1,
      "title": "Chapter 1",
      "url": "https://..."
    }
  ],
  "source": "MangaPark",
  "totalChapters": 179
}
```

### `GET /api/health`

Use when debugging whether empty results are product bugs or upstream source failures.

Response shape:

```json
{
  "sources": {
    "mangapark": {
      "status": "healthy",
      "message": "Source is operational",
      "responseTime": 1234,
      "lastChecked": "2025-01-08T..."
    }
  }
}
```

### `GET /api/frontpage`

Use to discover which sources expose frontpage sections and which section IDs are valid.

Response shape:

```json
{
  "sources": [
    {
      "sourceId": "comix",
      "sourceName": "Comix",
      "availableSections": [
        {
          "id": "trending",
          "title": "Most Recent Popular",
          "type": "trending",
          "supportsTimeFilter": true,
          "availableTimeFilters": [1, 7, 30, 90, 180, 365]
        }
      ]
    }
  ],
  "sourceIds": ["comix"]
}
```

### `POST /api/frontpage`

Use to fetch source-specific homepage sections only after discovering supported sections from `GET /api/frontpage`.

Request body:

```json
{
  "source": "comix",
  "section": "trending",
  "page": 1,
  "limit": 30,
  "days": 7
}
```

Response shape:

```json
{
  "source": "comix",
  "sourceName": "Comix",
  "section": {
    "id": "trending",
    "title": "Most Recent Popular",
    "type": "trending",
    "items": [
      {
        "id": "ylgn",
        "title": "Evolution Begins With A Big Tree",
        "url": "https://comix.to/title/ylgn-evolution-begins-with-a-big-tree",
        "coverImage": "https://...",
        "latestChapter": 481,
        "rating": 8.2,
        "followers": "2773"
      }
    ],
    "supportsPagination": false,
    "supportsTimeFilter": true
  },
  "fetchedAt": 1704700000000
}
```

## Integration Notes

- Search and chapter endpoints provide source discovery and chapter list data, but may not include complete manga metadata for your product. A source adapter may still need source-specific HTML scraping or follow-up fetches.
- Treat `result.url` as the stable input for chapter lookups.
- Preserve both `sourceId` and upstream title URL in product models.
- Do not assume source title IDs or slugs are unique across different sources.
