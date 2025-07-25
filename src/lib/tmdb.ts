import { z } from 'zod'

// TMDB API base URL
const TMDB_API_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

// Zod schemas for TMDB API responses
export const TMDBMovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  overview: z.string().optional(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  release_date: z.string().optional(),
  runtime: z.number().optional(),
  genres: z.array(z.object({
    id: z.number(),
    name: z.string(),
  })).optional(),
  vote_average: z.number().optional(),
  vote_count: z.number().optional(),
})

export const TMDBTVSchema = z.object({
  id: z.number(),
  name: z.string(),
  overview: z.string().optional(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  first_air_date: z.string().optional(),
  number_of_seasons: z.number().optional(),
  number_of_episodes: z.number().optional(),
  genres: z.array(z.object({
    id: z.number(),
    name: z.string(),
  })).optional(),
  vote_average: z.number().optional(),
  vote_count: z.number().optional(),
})

export const TMDBSearchResultSchema = z.object({
  page: z.number(),
  results: z.array(z.union([
    TMDBMovieSchema.extend({ media_type: z.literal('movie') }),
    TMDBTVSchema.extend({ media_type: z.literal('tv') }),
  ])),
  total_pages: z.number(),
  total_results: z.number(),
})

export type TMDBMovie = z.infer<typeof TMDBMovieSchema>
export type TMDBTV = z.infer<typeof TMDBTVSchema>
export type TMDBSearchResult = z.infer<typeof TMDBSearchResultSchema>

class TMDBService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || ''
    if (!this.apiKey) {
      console.warn('TMDB API key not found. Search functionality will not work.')
    }
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error('TMDB API key not configured')
    }

    const url = new URL(`${TMDB_API_BASE}${endpoint}`)
    url.searchParams.set('api_key', this.apiKey)
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`)
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
  static getImageUrl(path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
    if (!path) return null
    return `${TMDB_IMAGE_BASE}/${size}${path}`
  }

  static getPosterUrl(path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w342'): string | null {
    return this.getImageUrl(path, size)
  }

  static getBackdropUrl(path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w780'): string | null {
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