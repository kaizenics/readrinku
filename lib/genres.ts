// Curated manga genres shown in the header dropdown. Each slug maps to a
// KaliScan genre listing page (https://kaliscan.com/genres/{slug}) that backs
// our /genre/{slug} route.
export interface MangaGenre {
  label: string
  slug: string
  /** Requires an 18+ confirmation before the listing is shown. */
  adult?: boolean
}

export const mangaGenres: readonly MangaGenre[] = [
  { label: "Action", slug: "action" },
  { label: "Adult", slug: "adult", adult: true },
  { label: "Adventure", slug: "adventure" },
  { label: "Boys Love", slug: "yaoi" },
  { label: "Comedy", slug: "comedy" },
  { label: "Cooking", slug: "cooking" },
  { label: "Demons", slug: "demons" },
  { label: "Drama", slug: "drama" },
  { label: "Ecchi", slug: "ecchi" },
  { label: "Fantasy", slug: "fantasy" },
  { label: "Game", slug: "game" },
  { label: "Gender Bender", slug: "gender-bender" },
  { label: "Girls Love", slug: "yuri" },
  { label: "Harem", slug: "harem" },
  { label: "Historical", slug: "historical" },
  { label: "Horror", slug: "horror" },
  { label: "Isekai", slug: "isekai" },
  { label: "Josei", slug: "josei" },
  { label: "Magic", slug: "magic" },
  { label: "Martial Arts", slug: "martial-arts" },
  { label: "Mature", slug: "mature" },
  { label: "Mecha", slug: "mecha" },
  { label: "Medical", slug: "medical" },
  { label: "Military", slug: "military" },
  { label: "Music", slug: "music" },
  { label: "Mystery", slug: "mystery" },
  { label: "Psychological", slug: "psychological" },
  { label: "Reincarnation", slug: "reincarnation" },
  { label: "Romance", slug: "romance" },
  { label: "School", slug: "school-life" },
  { label: "Sci-Fi", slug: "sci-fi" },
  { label: "Seinen", slug: "seinen" },
  { label: "Shoujo", slug: "shoujo" },
  { label: "Shounen", slug: "shounen" },
  { label: "Slice of Life", slug: "slice-of-life" },
  { label: "Sports", slug: "sports" },
  { label: "Super Power", slug: "super-power" },
  { label: "Supernatural", slug: "supernatural" },
  { label: "Thriller", slug: "thriller" },
  { label: "Time Travel", slug: "time-travel" },
  { label: "Tragedy", slug: "tragedy" },
  { label: "Vampire", slug: "vampire" },
  { label: "Villainess", slug: "villainess" },
  { label: "Webtoons", slug: "webtoons" },
  { label: "Zombies", slug: "zombies" },
]

export function findGenre(slug: string): MangaGenre | undefined {
  return mangaGenres.find((genre) => genre.slug === slug)
}
