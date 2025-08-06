import {
  AppendToResponse,
  Movie,
  MovieDetails,
  MovieWithMediaType,
  Search,
  TV,
  TvShowDetails,
  TVWithMediaType,
} from 'tmdb-ts'

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
  watchedEpisodes?: WatchedEpisode[]
}

export type WatchStatus =
  | 'PLANNED'
  | 'WATCHING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'DROPPED'

export type EpisodeWatchStatus = 'UNWATCHED' | 'WATCHED' | 'SKIPPED'

export interface WatchedEpisode {
  id: string
  seasonNumber: number
  episodeNumber: number
  status: EpisodeWatchStatus
  watchedAt: Date | null
  watchedItemId: string
  createdAt: Date
  updatedAt: Date
}

export interface QueueItem {
  id: string
  userId: string
  contentId: string
  contentType: 'MOVIE' | 'TV'
  position: number
  watched: boolean
  addedAt: Date
  updatedAt: Date
  seasonNumber: number | null
  episodeNumber: number | null
  episodeName: string | null
  title: string
  poster: string | null
  releaseDate: Date | null
  tmdbId: number
}

export interface Note {
  id: string
  content: string
  timestamp: string | null
  noteType: 'GENERAL' | 'EPISODE'
  seasonNumber: number | null
  episodeNumber: number | null
  createdAt: Date
  isPublic: boolean
  hasSpoilers: boolean
  updatedAt: Date
  userId: string
  watchedItemId: string
}

export interface NoteWithMedia extends Note {
  watchedItem: {
    id: string
    tmdbId: number
    mediaType: 'MOVIE' | 'TV'
    title: string
    poster: string | null
    releaseDate: Date | null
  }
}

export interface UserStats {
  totalItems: number
  currentlyWatching: number
  completedItems: number
  totalNotes: number
  totalHoursWatched?: number
}

export interface ExtendedMovieDetails
  extends AppendToResponse<MovieDetails, 'credits'[], 'movie'> {
  media_type: 'movie'
}

export interface ExtendedTvShowDetails
  extends AppendToResponse<TvShowDetails, 'credits'[], 'tvShow'> {
  media_type: 'tv'
}

export interface MovieSearchResult extends Search<Movie> {
  results: MovieWithMediaType[]
}

export interface TvSearchResult extends Search<TV> {
  results: TVWithMediaType[]
}

export type SearchResult = MovieSearchResult | TvSearchResult

// Helper type for media items only (excluding person results)
export type TMDBMediaItem = ExtendedMovieDetails | ExtendedTvShowDetails

// Component prop types
export interface MediaSearchProps {
  onAddMedia: (media: TVWithMediaType | MovieWithMediaType) => void
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
  watchedEpisodes?: WatchedEpisode[]
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

export interface CreateQueueItemData {
  contentId: string
  contentType: 'MOVIE' | 'TV'
  title: string
  poster?: string | null
  releaseDate?: Date | null
  tmdbId: number
  seasonNumber?: number | null
  episodeNumber?: number | null
  episodeName?: string | null
}

export interface UpdateQueueItemData {
  position?: number
  watched?: boolean
}

export interface ReorderQueueData {
  itemId: string
  newPosition: number
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
  session?: {
    userId: string
  }
  req?: {
    ip?: string
    headers: Record<string, string | string[] | undefined>
    connection?: { remoteAddress?: string }
    socket?: { remoteAddress?: string }
  }
  rateLimit?: {
    remaining: number
    resetTime: number
  }
}

export interface TRPCMiddlewareOpts {
  ctx: TRPCContext
  next: () => Promise<unknown>
}

// Error types
export interface ErrorDetails {
  field?: string
  code?: string
  [key: string]: unknown
}

// Navigation types
export interface NavigationItem {
  name: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  subItems?: NavigationItem[]
  active?: boolean
  badgeKey?: 'queue' | 'library' | 'notes'
  tutorial?: {
    id: string
    message: string
    order: number
  }
}

// Common types that are duplicated across the codebase
export type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all'

// Re-export search types from search.ts for backwards compatibility
export type { SortOption, SortDirection, FilterState } from './search'
