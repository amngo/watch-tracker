// Core domain types
export interface WatchedItem {
  id: string
  tmdbId: number
  mediaType: 'MOVIE' | 'TV'
  title: string
  poster: string | null
  releaseDate: Date | null
  status: WatchStatus
  rating: number | null
  currentEpisode: number | null
  totalEpisodes: number | null
  currentSeason: number | null
  totalSeasons: number | null
  currentRuntime: number | null
  totalRuntime: number | null
  createdAt: Date
  updatedAt: Date
  startDate: Date | null
  finishDate: Date | null
  notes: Note[]
  _count: { notes: number }
  progress: number
}

export type WatchStatus =
  | 'PLANNED'
  | 'WATCHING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'DROPPED'

export interface Note {
  id: string
  content: string
  timestamp: string | null
  createdAt: Date
  isPublic: boolean
  hasSpoilers: boolean
  updatedAt: Date
  userId: string
  watchedItemId: string
}

export interface UserStats {
  totalItems: number
  currentlyWatching: number
  completedItems: number
  totalNotes: number
  totalHoursWatched?: number
}

// TMDB API types (these match TMDB's actual response format)
export interface TMDBMovieItem {
  id: number
  media_type: 'movie'
  title: string
  poster_path?: string | null
  release_date?: string
  overview?: string | null
  vote_average: number
  adult: boolean
  vote_count: number
}

export interface TMDBTVItem {
  id: number
  media_type: 'tv'
  name: string
  poster_path?: string | null
  first_air_date?: string | null
  overview?: string | null
  vote_average: number
  adult: boolean
  vote_count: number
}

export interface TMDBPersonItem {
  id: number
  media_type: 'person'
  name: string
  profile_path?: string | null
  popularity: number
  adult: boolean
  gender?: number | null
  known_for_department?: string | null
  // Person items don't have vote_average, so we make it optional for the union
  vote_average?: never
}

export type TMDBSearchResultItem = TMDBMovieItem | TMDBTVItem | TMDBPersonItem

// Helper type for media items only (excluding person results)
export type TMDBMediaItem = TMDBMovieItem | TMDBTVItem

export interface TMDBSearchResponse {
  page: number
  results: TMDBSearchResultItem[]
  total_pages: number
  total_results: number
}

// Component prop types
export interface MediaSearchProps {
  onAddMedia: (media: TMDBMediaItem) => void
  className?: string
}

export interface WatchedItemCardProps {
  item: WatchedItem
  onUpdate: (id: string, data: Partial<WatchedItem>) => Promise<void> | void
  onDelete: (id: string) => Promise<void> | void
}

export interface DashboardLayoutProps {
  children: React.ReactNode
  stats?: UserStats
}

// Form data types
export interface CreateWatchedItemData {
  tmdbId: number
  mediaType: 'MOVIE' | 'TV'
  title: string
  poster?: string | null
  releaseDate?: Date
  totalRuntime?: number
  totalEpisodes?: number
  totalSeasons?: number
}

export interface UpdateWatchedItemData {
  status?: WatchStatus
  rating?: number | null
  currentEpisode?: number | null
  currentSeason?: number | null
  currentRuntime?: number | null
  startDate?: Date | null
  finishDate?: Date | null
  progress?: number
}

export interface CreateNoteData {
  content: string
  watchedItemId: string
}

export interface UpdateProfileData {
  displayName?: string
  bio?: string
  isPublic?: boolean
}

// API response types
export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Rate limiting types
export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator: (ctx: TRPCContext) => string
}

export interface TRPCContext {
  user?: {
    id: string
    email: string
  }
  req?: {
    ip?: string
    headers: Record<string, string | string[] | undefined>
  }
  rateLimit?: {
    remaining: number
    resetTime: number
  }
}

export interface TRPCMiddlewareOpts {
  ctx: TRPCContext
  next: () => Promise<any>
}

// Error types
export interface ErrorDetails {
  field?: string
  code?: string
  [key: string]: any
}

// Navigation types
export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
}

// Extended TMDB types for detailed pages
export interface TMDBGenre {
  id: number
  name: string
}

export interface TMDBProductionCompany {
  id: number
  logo_path?: string | null
  name: string
  origin_country: string
}

export interface TMDBCastMember {
  id: number
  name: string
  character: string
  profile_path?: string | null
  order: number
  known_for_department: string
}

export interface TMDBCrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path?: string | null
  known_for_department: string
}

export interface TMDBCredits {
  cast: TMDBCastMember[]
  crew: TMDBCrewMember[]
}

export interface TMDBMovieDetailsExtended extends TMDBMovieItem {
  belongs_to_collection?: {
    id: number
    name: string
    poster_path?: string | null
    backdrop_path?: string | null
  } | null
  budget?: number
  genres?: TMDBGenre[]
  homepage?: string | null
  imdb_id?: string | null
  production_companies?: TMDBProductionCompany[]
  revenue?: number
  runtime?: number | null
  status?: string
  tagline?: string | null
  backdrop_path?: string | null
  credits?: TMDBCredits
}

export interface TMDBTVDetailsExtended extends TMDBTVItem {
  created_by?: Array<{
    id: number
    name: string
    profile_path?: string | null
  }>
  episode_run_time?: number[]
  genres?: TMDBGenre[]
  homepage?: string | null
  number_of_episodes?: number
  number_of_seasons?: number
  last_air_date?: string | null
  seasons?: Array<{
    air_date?: string | null
    episode_count: number
    id: number
    name: string
    overview: string
    poster_path?: string | null
    season_number: number
  }>
  status?: string
  tagline?: string | null
  type?: string
  backdrop_path?: string | null
  credits?: TMDBCredits
  networks?: Array<{
    id: number
    name: string
    logo_path?: string | null
    origin_country: string
  }>
}
