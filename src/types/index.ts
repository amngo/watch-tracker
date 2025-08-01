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

export type TMDBSearchResultItem = TMDBMovieItem | TMDBTVItem

// Helper type for media items only (excluding person results)
export type TMDBMediaItem = TMDBMovieItem | TMDBTVItem

// Episode and Season types
export interface TMDBEpisodeItem {
  air_date: string | null
  episode_number: number
  id: number
  name: string
  overview: string
  production_code: string | null
  runtime: number | null
  season_number: number
  show_id: number
  still_path: string | null
  vote_average: number
  vote_count: number
  crew?: Array<{
    adult: boolean
    gender: number | null
    id: number
    known_for_department: string
    name: string
    original_name: string
    popularity: number
    profile_path: string | null
    credit_id: string
    department: string
    job: string
  }>
  guest_stars?: Array<{
    adult: boolean
    gender: number | null
    id: number
    known_for_department: string
    name: string
    original_name: string
    popularity: number
    profile_path: string | null
    cast_id?: number
    character: string
    credit_id: string
    order: number
  }>
}

export interface TMDBSeasonDetailsItem {
  _id: string
  air_date: string | null
  episodes: TMDBEpisodeItem[]
  name: string
  overview: string
  id: number
  poster_path: string | null
  season_number: number
  vote_average?: number
}

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
