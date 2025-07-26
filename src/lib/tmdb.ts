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
  media_type: z.literal('movie'),
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
  media_type: z.literal('tv'),
  original_language: z.string().nullish(),
  genre_ids: z.array(z.number()).nullish(),
  popularity: z.number(),
  first_air_date: z.string().nullish(),
  vote_average: z.number(),
  vote_count: z.number(),
  original_country: z.array(z.string().nullish()).nullish(),
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
  z.discriminatedUnion('media_type', [
    TMDBMovieSchema,
    TMDBTVSchema,
    TMDBPersonSchema,
  ])
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
export type TMDBSearchResult = z.infer<typeof TMDBSearchResultSchema>
export type TMDBSearchResultItems = z.infer<typeof MultiResultItemsSchema>
export type TMDBSearchResultItem = z.infer<
  typeof MultiResultItemsSchema
>[number]

class TMDBService {
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
