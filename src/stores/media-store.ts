import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'

export interface WatchedItem {
  id: string
  tmdbId: number
  mediaType: 'MOVIE' | 'TV'
  title: string
  poster: string | null
  releaseDate: Date | null
  status: 'WATCHING' | 'COMPLETED' | 'PAUSED' | 'PLANNED' | 'DROPPED'
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
  // Relations
  notes: { id: string; content: string; timestamp: string | null; createdAt: Date; isPublic: boolean; hasSpoilers: boolean; updatedAt: Date; userId: string; watchedItemId: string }[]
  _count: { notes: number }
  // Computed properties
  progress: number
}

export interface MediaStats {
  totalItems: number
  currentlyWatching: number
  completedItems: number
  totalNotes: number
}

export interface SearchResult {
  id: number
  media_type: string
  title?: string
  name?: string
  poster_path?: string | null
  release_date?: string
  first_air_date?: string
  overview?: string | null
  vote_average: number
  adult: boolean
  backdrop_path?: string | null
  original_title?: string | null
  original_name?: string | null
  genre_ids?: number[]
  original_language?: string
  popularity?: number
  vote_count?: number
  video?: boolean
}

export interface MediaStoreState {
  // Data
  watchedItems: WatchedItem[]
  stats: MediaStats | null
  searchResults: SearchResult[]
  
  // Loading states
  itemsLoading: boolean
  statsLoading: boolean
  searchLoading: boolean
  
  // Error states
  itemsError: string | null
  statsError: string | null
  searchError: string | null
  
  // Cache and pagination
  lastUpdated: Date | null
  hasNextPage: boolean
  currentPage: number
  
  // Actions - Data management
  setWatchedItems: (items: WatchedItem[]) => void
  addWatchedItem: (item: WatchedItem) => void
  updateWatchedItem: (id: string, updates: Partial<WatchedItem>) => void
  removeWatchedItem: (id: string) => void
  
  setStats: (stats: MediaStats) => void
  updateStats: (updates: Partial<MediaStats>) => void
  
  setSearchResults: (results: SearchResult[]) => void
  clearSearchResults: () => void
  
  // Actions - Loading states
  setItemsLoading: (loading: boolean) => void
  setStatsLoading: (loading: boolean) => void
  setSearchLoading: (loading: boolean) => void
  
  // Actions - Error states
  setItemsError: (error: string | null) => void
  setStatsError: (error: string | null) => void
  setSearchError: (error: string | null) => void
  
  // Actions - Cache and pagination
  setLastUpdated: () => void
  setHasNextPage: (hasNext: boolean) => void
  setCurrentPage: (page: number) => void
  incrementPage: () => void
  
  // Utility actions
  getItemById: (id: string) => WatchedItem | undefined
  getItemsByStatus: (status: WatchedItem['status']) => WatchedItem[]
  getItemsByType: (type: WatchedItem['mediaType']) => WatchedItem[]
  
  // Bulk operations
  markAsCompleted: (id: string) => void
  markAsWatching: (id: string) => void
  updateProgress: (id: string, progress: number) => void
  
  reset: () => void
  resetErrors: () => void
}

const initialState = {
  // Data
  watchedItems: [],
  stats: null,
  searchResults: [],
  
  // Loading states
  itemsLoading: false,
  statsLoading: false,
  searchLoading: false,
  
  // Error states
  itemsError: null,
  statsError: null,
  searchError: null,
  
  // Cache and pagination
  lastUpdated: null,
  hasNextPage: false,
  currentPage: 1,
}

export const useMediaStore = create<MediaStoreState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
        ...initialState,

        // Data management actions
        setWatchedItems: (items: WatchedItem[]) =>
          set(
            { watchedItems: items, lastUpdated: new Date() },
            false,
            'media/setWatchedItems'
          ),

        addWatchedItem: (item: WatchedItem) =>
          set(
            (state) => ({
              watchedItems: [item, ...state.watchedItems],
              lastUpdated: new Date(),
            }),
            false,
            'media/addWatchedItem'
          ),

        updateWatchedItem: (id: string, updates: Partial<WatchedItem>) =>
          set(
            (state) => ({
              watchedItems: state.watchedItems.map(item =>
                item.id === id ? { ...item, ...updates } : item
              ),
              lastUpdated: new Date(),
            }),
            false,
            'media/updateWatchedItem'
          ),

        removeWatchedItem: (id: string) =>
          set(
            (state) => ({
              watchedItems: state.watchedItems.filter(item => item.id !== id),
              lastUpdated: new Date(),
            }),
            false,
            'media/removeWatchedItem'
          ),

        setStats: (stats: MediaStats) =>
          set({ stats }, false, 'media/setStats'),

        updateStats: (updates: Partial<MediaStats>) =>
          set(
            (state) => ({
              stats: state.stats ? { ...state.stats, ...updates } : null,
            }),
            false,
            'media/updateStats'
          ),

        setSearchResults: (results: SearchResult[]) =>
          set({ searchResults: results }, false, 'media/setSearchResults'),

        clearSearchResults: () =>
          set({ searchResults: [] }, false, 'media/clearSearchResults'),

        // Loading state actions
        setItemsLoading: (loading: boolean) =>
          set({ itemsLoading: loading }, false, 'media/setItemsLoading'),

        setStatsLoading: (loading: boolean) =>
          set({ statsLoading: loading }, false, 'media/setStatsLoading'),

        setSearchLoading: (loading: boolean) =>
          set({ searchLoading: loading }, false, 'media/setSearchLoading'),

        // Error state actions
        setItemsError: (error: string | null) =>
          set({ itemsError: error }, false, 'media/setItemsError'),

        setStatsError: (error: string | null) =>
          set({ statsError: error }, false, 'media/setStatsError'),

        setSearchError: (error: string | null) =>
          set({ searchError: error }, false, 'media/setSearchError'),

        // Cache and pagination actions
        setLastUpdated: () =>
          set({ lastUpdated: new Date() }, false, 'media/setLastUpdated'),

        setHasNextPage: (hasNext: boolean) =>
          set({ hasNextPage: hasNext }, false, 'media/setHasNextPage'),

        setCurrentPage: (page: number) =>
          set({ currentPage: page }, false, 'media/setCurrentPage'),

        incrementPage: () =>
          set(
            (state) => ({ currentPage: state.currentPage + 1 }),
            false,
            'media/incrementPage'
          ),

        // Utility actions
        getItemById: (id: string) => {
          const state = get()
          return state.watchedItems.find(item => item.id === id)
        },

        getItemsByStatus: (status: WatchedItem['status']) => {
          const state = get()
          return state.watchedItems.filter(item => item.status === status)
        },

        getItemsByType: (type: WatchedItem['mediaType']) => {
          const state = get()
          return state.watchedItems.filter(item => item.mediaType === type)
        },

        // Bulk operations
        markAsCompleted: (id: string) =>
          set(
            (state) => ({
              watchedItems: state.watchedItems.map(item =>
                item.id === id
                  ? {
                      ...item,
                      status: 'COMPLETED' as const,
                      progress: 100,
                      finishDate: new Date(),
                    }
                  : item
              ),
              lastUpdated: new Date(),
            }),
            false,
            'media/markAsCompleted'
          ),

        markAsWatching: (id: string) =>
          set(
            (state) => ({
              watchedItems: state.watchedItems.map(item =>
                item.id === id
                  ? {
                      ...item,
                      status: 'WATCHING' as const,
                      startDate: item.startDate || new Date(),
                    }
                  : item
              ),
              lastUpdated: new Date(),
            }),
            false,
            'media/markAsWatching'
          ),

        updateProgress: (id: string, progress: number) =>
          set(
            (state) => ({
              watchedItems: state.watchedItems.map(item => {
                if (item.id !== id) return item

                const clampedProgress = Math.max(0, Math.min(100, progress))
                let newStatus = item.status
                let finishDate = item.finishDate
                let startDate = item.startDate

                if (clampedProgress >= 100) {
                  newStatus = 'COMPLETED'
                  finishDate = new Date()
                } else if (clampedProgress > 0 && item.status === 'PLANNED') {
                  newStatus = 'WATCHING'
                  if (!startDate) {
                    startDate = new Date()
                  }
                }

                return {
                  ...item,
                  progress: clampedProgress,
                  status: newStatus,
                  finishDate,
                  startDate,
                }
              }),
              lastUpdated: new Date(),
            }),
            false,
            'media/updateProgress'
          ),

        reset: () => set(initialState, false, 'media/reset'),

        resetErrors: () =>
          set(
            { itemsError: null, statsError: null, searchError: null },
            false,
            'media/resetErrors'
          ),
      })),
    { name: 'media-store' }
  )
)