import { z } from 'zod'

// TMDB API base URL
const TMDB_API_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

// Zod schemas for TMDB API responses
export const TMDBMovieSchema = z.object({
  adult: z.boolean(),
  backdrop_path: z.string().nullish(),
  id: z.number(),
  title: z.string(),
  original_title: z.string().nullish(),
  overview: z.string().nullish(),
  poster_path: z.string().nullish(),
  //   media_type: z.literal('movie'),
  original_language: z.string().nullish(),
  genre_ids: z.array(z.number()).nullish(),
  popularity: z.number().optional(),
  release_date: z.string().optional(),
  video: z.boolean().optional(),
  vote_average: z.number(),
  vote_count: z.number(),
})

export const TMDBTVSchema = z.object({
  adult: z.boolean(),
  backdrop_path: z.string().nullish(),
  id: z.number(),
  name: z.string(),
  original_name: z.string().nullish(),
  overview: z.string().nullish(),
  poster_path: z.string().nullish(),
  //   media_type: z.literal('tv'),
  original_language: z.string().nullish(),
  genre_ids: z.array(z.number()).nullish(),
  popularity: z.number(),
  first_air_date: z.string().nullish(),
  vote_average: z.number(),
  vote_count: z.number(),
  original_country: z.array(z.string().nullish()).nullish(),
})

// Extended schemas for detailed information
export const TMDBGenreSchema = z.object({
  id: z.number(),
  name: z.string(),
})

export const TMDBProductionCompanySchema = z.object({
  id: z.number(),
  logo_path: z.string().nullish(),
  name: z.string(),
  origin_country: z.string(),
})

export const TMDBProductionCountrySchema = z.object({
  iso_3166_1: z.string(),
  name: z.string(),
})

export const TMDBSpokenLanguageSchema = z.object({
  english_name: z.string(),
  iso_639_1: z.string(),
  name: z.string(),
})

export const TMDBMovieDetailsSchema = TMDBMovieSchema.extend({
  belongs_to_collection: z
    .object({
      id: z.number(),
      name: z.string(),
      poster_path: z.string().nullish(),
      backdrop_path: z.string().nullish(),
    })
    .nullish(),
  budget: z.number().optional(),
  genres: z.array(TMDBGenreSchema).optional(),
  homepage: z.string().nullish(),
  imdb_id: z.string().nullish(),
  production_companies: z.array(TMDBProductionCompanySchema).optional(),
  production_countries: z.array(TMDBProductionCountrySchema).optional(),
  revenue: z.number().optional(),
  runtime: z.number().nullish(),
  spoken_languages: z.array(TMDBSpokenLanguageSchema).optional(),
  status: z.string().optional(),
  tagline: z.string().nullish(),
})

export const TMDBTVDetailsSchema = TMDBTVSchema.extend({
  created_by: z
    .array(
      z.object({
        id: z.number(),
        credit_id: z.string(),
        name: z.string(),
        gender: z.number().nullish(),
        profile_path: z.string().nullish(),
      })
    )
    .optional(),
  episode_run_time: z.array(z.number()).optional(),
  genres: z.array(TMDBGenreSchema).optional(),
  homepage: z.string().nullish(),
  in_production: z.boolean().optional(),
  languages: z.array(z.string()).optional(),
  last_air_date: z.string().nullish(),
  last_episode_to_air: z
    .object({
      id: z.number(),
      name: z.string(),
      overview: z.string(),
      vote_average: z.number(),
      vote_count: z.number(),
      air_date: z.string(),
      episode_number: z.number(),
      production_code: z.string(),
      runtime: z.number().nullish(),
      season_number: z.number(),
      show_id: z.number(),
      still_path: z.string().nullish(),
    })
    .nullish(),
  networks: z
    .array(
      z.object({
        id: z.number(),
        logo_path: z.string().nullish(),
        name: z.string(),
        origin_country: z.string(),
      })
    )
    .optional(),
  number_of_episodes: z.number().optional(),
  number_of_seasons: z.number().optional(),
  origin_country: z.array(z.string()).optional(),
  production_companies: z.array(TMDBProductionCompanySchema).optional(),
  production_countries: z.array(TMDBProductionCountrySchema).optional(),
  seasons: z
    .array(
      z.object({
        air_date: z.string().nullish(),
        episode_count: z.number(),
        id: z.number(),
        name: z.string(),
        overview: z.string(),
        poster_path: z.string().nullish(),
        season_number: z.number(),
        vote_average: z.number(),
      })
    )
    .optional(),
  spoken_languages: z.array(TMDBSpokenLanguageSchema).optional(),
  status: z.string().optional(),
  tagline: z.string().nullish(),
  type: z.string().optional(),
})

// Cast and Crew schemas
export const TMDBCastMemberSchema = z.object({
  adult: z.boolean(),
  gender: z.number().nullish(),
  id: z.number(),
  known_for_department: z.string(),
  name: z.string(),
  original_name: z.string(),
  popularity: z.number(),
  profile_path: z.string().nullish(),
  cast_id: z.number().optional(),
  character: z.string(),
  credit_id: z.string(),
  order: z.number(),
})

export const TMDBCrewMemberSchema = z.object({
  adult: z.boolean(),
  gender: z.number().nullish(),
  id: z.number(),
  known_for_department: z.string(),
  name: z.string(),
  original_name: z.string(),
  popularity: z.number(),
  profile_path: z.string().nullish(),
  credit_id: z.string(),
  department: z.string(),
  job: z.string(),
})

export const TMDBCreditsSchema = z.object({
  id: z.number(),
  cast: z.array(TMDBCastMemberSchema),
  crew: z.array(TMDBCrewMemberSchema),
})

// Episode and Season schemas
export const TMDBEpisodeSchema = z.object({
  air_date: z.string().nullish(),
  episode_number: z.number(),
  id: z.number(),
  name: z.string(),
  overview: z.string(),
  production_code: z.string().nullish(),
  runtime: z.number().nullish(),
  season_number: z.number(),
  show_id: z.number(),
  still_path: z.string().nullish(),
  vote_average: z.number(),
  vote_count: z.number(),
  crew: z.array(TMDBCrewMemberSchema).optional(),
  guest_stars: z.array(TMDBCastMemberSchema).optional(),
})

export const TMDBSeasonDetailsSchema = z.object({
  _id: z.string(),
  air_date: z.string().nullish(),
  episodes: z.array(TMDBEpisodeSchema),
  name: z.string(),
  overview: z.string(),
  id: z.number(),
  poster_path: z.string().nullish(),
  season_number: z.number(),
  vote_average: z.number().optional(),
})

export const TMDBPersonSchema = z.object({
  adult: z.boolean(),
  id: z.number(),
  name: z.string(),
  original_name: z.string().nullish(),
  media_type: z.literal('person'),
  popularity: z.number(),
  gender: z.number().nullish(),
  known_for_department: z.string().nullish(),
  profile_path: z.string().nullish(),
  known_for: z
    .array(z.union([TMDBMovieSchema, TMDBTVSchema]).optional())
    .optional(),
})

const MultiResultItemsSchema = z.array(
  z.union([TMDBMovieSchema, TMDBTVSchema, TMDBPersonSchema])
)

export const TMDBSearchResultSchema = z.object({
  page: z.number(),
  results: MultiResultItemsSchema,
  total_pages: z.number(),
  total_results: z.number(),
})

export type TMDBMovie = z.infer<typeof TMDBMovieSchema>
export type TMDBTV = z.infer<typeof TMDBTVSchema>
export type TMDBPerson = z.infer<typeof TMDBPersonSchema>
export type TMDBMovieDetails = z.infer<typeof TMDBMovieDetailsSchema>
export type TMDBTVDetails = z.infer<typeof TMDBTVDetailsSchema>
export type TMDBGenre = z.infer<typeof TMDBGenreSchema>
export type TMDBProductionCompany = z.infer<typeof TMDBProductionCompanySchema>
export type TMDBCastMember = z.infer<typeof TMDBCastMemberSchema>
export type TMDBCrewMember = z.infer<typeof TMDBCrewMemberSchema>
export type TMDBCredits = z.infer<typeof TMDBCreditsSchema>
export type TMDBEpisode = z.infer<typeof TMDBEpisodeSchema>
export type TMDBSeasonDetails = z.infer<typeof TMDBSeasonDetailsSchema>
export type TMDBSearchResult = z.infer<typeof TMDBSearchResultSchema>
export type TMDBSearchResultItems = z.infer<typeof MultiResultItemsSchema>
export type TMDBSearchResultItem = z.infer<
  typeof MultiResultItemsSchema
>[number]

export class TMDBService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || ''
    if (!this.apiKey) {
      console.warn(
        'TMDB API key not found. Search functionality will not work.'
      )
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error('TMDB API key not configured')
    }

    const url = new URL(`${TMDB_API_BASE}${endpoint}`)

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })

    const response = await fetch(url.toString(), {
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer ' + this.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`
      )
    }

    return response.json()
  }

  async searchMulti(query: string, page = 1): Promise<TMDBSearchResult> {
    const data = await this.makeRequest('/search/multi', {
      query: encodeURIComponent(query),
      page: page.toString(),
    })

    return TMDBSearchResultSchema.parse(data)
  }

  async searchMovies(query: string, page = 1): Promise<TMDBSearchResult> {
    const data = await this.makeRequest('/search/movie', {
      query: encodeURIComponent(query),
      page: page.toString(),
    })

    return TMDBSearchResultSchema.parse(data)
  }

  async searchTV(query: string, page = 1): Promise<TMDBSearchResult> {
    const data = await this.makeRequest('/search/tv', {
      query: encodeURIComponent(query),
      page: page.toString(),
    })

    return TMDBSearchResultSchema.parse(data)
  }

  async getMovieDetails(id: number): Promise<TMDBMovie> {
    const data = await this.makeRequest(`/movie/${id}`)
    return TMDBMovieSchema.parse(data)
  }

  async getTVDetails(id: number): Promise<TMDBTV> {
    const data = await this.makeRequest(`/tv/${id}`)
    return TMDBTVSchema.parse(data)
  }

  async getMovieDetailsExtended(id: number): Promise<TMDBMovieDetails> {
    const data = await this.makeRequest(`/movie/${id}`)
    return TMDBMovieDetailsSchema.parse(data)
  }

  async getTVDetailsExtended(id: number): Promise<TMDBTVDetails> {
    const data = await this.makeRequest(`/tv/${id}`)
    return TMDBTVDetailsSchema.parse(data)
  }

  async getMovieCredits(id: number): Promise<TMDBCredits> {
    const data = await this.makeRequest(`/movie/${id}/credits`)
    return TMDBCreditsSchema.parse(data)
  }

  async getTVCredits(id: number): Promise<TMDBCredits> {
    const data = await this.makeRequest(`/tv/${id}/credits`)
    return TMDBCreditsSchema.parse(data)
  }

  async getTVSeasonDetails(
    tvId: number,
    seasonNumber: number
  ): Promise<TMDBSeasonDetails> {
    const data = await this.makeRequest(`/tv/${tvId}/season/${seasonNumber}`)
    return TMDBSeasonDetailsSchema.parse(data)
  }

  async getTVEpisodeDetails(
    tvId: number,
    seasonNumber: number,
    episodeNumber: number
  ): Promise<TMDBEpisode> {
    const data = await this.makeRequest(
      `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`
    )
    return TMDBEpisodeSchema.parse(data)
  }

  // Helper methods for image URLs
  static getImageUrl(
    path: string | null,
    size:
      | 'w92'
      | 'w154'
      | 'w185'
      | 'w342'
      | 'w500'
      | 'w780'
      | 'original' = 'w500'
  ): string | null {
    if (!path) return null
    return `${TMDB_IMAGE_BASE}/${size}${path}`
  }

  static getPosterUrl(
    path: string | null,
    size:
      | 'w92'
      | 'w154'
      | 'w185'
      | 'w342'
      | 'w500'
      | 'w780'
      | 'original' = 'w342'
  ): string | null {
    return this.getImageUrl(path, size)
  }

  static getBackdropUrl(
    path: string | null,
    size: 'w300' | 'w780' | 'w1280' | 'original' = 'w780'
  ): string | null {
    return this.getImageUrl(path, size as any)
  }
}

// Export singleton instance
export const tmdbService = new TMDBService()

// Error classes for better error handling
export class TMDBError extends Error {
  constructor(
    message: string,
    public code: string = 'TMDB_ERROR',
    public status: number = 500
  ) {
    super(message)
    this.name = 'TMDBError'
  }
}

export class TMDBNotFoundError extends TMDBError {
  constructor(message = 'Resource not found') {
    super(message, 'NOT_FOUND', 404)
  }
}

export class TMDBRateLimitError extends TMDBError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 'RATE_LIMITED', 429)
  }
}
