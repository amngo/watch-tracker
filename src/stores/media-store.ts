import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import type { WatchedItem, TMDBSearchResultItem } from '@/types'

export interface MediaStats {
  totalItems: number
  currentlyWatching: number
  completedItems: number
  totalNotes: number
}


export interface MediaStoreState {
  // Data
  watchedItems: WatchedItem[]
  stats: MediaStats | null
  searchResults: TMDBSearchResultItem[]

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

  // Optimistic updates tracking
  optimisticItems: Map<string, WatchedItem>
  pendingOperations: Map<string, 'create' | 'update' | 'delete'>
  rollbackData: Map<string, WatchedItem | null>

  // Actions - Data management
  setWatchedItems: (items: WatchedItem[]) => void
  addWatchedItem: (item: WatchedItem) => void
  updateWatchedItem: (id: string, updates: Partial<WatchedItem>) => void
  removeWatchedItem: (id: string) => void

  setStats: (stats: MediaStats) => void
  updateStats: (updates: Partial<MediaStats>) => void

  setSearchResults: (results: TMDBSearchResultItem[]) => void
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
  isItemInWatchlist: (tmdbId: number, mediaType: 'movie' | 'tv') => boolean

  // Bulk operations
  markAsCompleted: (id: string) => void
  markAsWatching: (id: string) => void
  updateProgress: (id: string, progress: number) => void

  // Optimistic update actions
  optimisticUpdateItem: (id: string, updates: Partial<WatchedItem>) => void
  optimisticAddItem: (item: WatchedItem) => void
  optimisticRemoveItem: (id: string) => void
  confirmOptimisticUpdate: (id: string) => void
  rollbackOptimisticUpdate: (id: string) => void
  clearOptimisticUpdates: () => void

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

  // Optimistic updates tracking
  optimisticItems: new Map(),
  pendingOperations: new Map(),
  rollbackData: new Map(),
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
          state => ({
            watchedItems: [item, ...state.watchedItems],
            lastUpdated: new Date(),
          }),
          false,
          'media/addWatchedItem'
        ),

      updateWatchedItem: (id: string, updates: Partial<WatchedItem>) =>
        set(
          state => ({
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
          state => ({
            watchedItems: state.watchedItems.filter(item => item.id !== id),
            lastUpdated: new Date(),
          }),
          false,
          'media/removeWatchedItem'
        ),

      setStats: (stats: MediaStats) => set({ stats }, false, 'media/setStats'),

      updateStats: (updates: Partial<MediaStats>) =>
        set(
          state => ({
            stats: state.stats ? { ...state.stats, ...updates } : null,
          }),
          false,
          'media/updateStats'
        ),

      setSearchResults: (results: TMDBSearchResultItem[]) =>
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
          state => ({ currentPage: state.currentPage + 1 }),
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

      isItemInWatchlist: (tmdbId: number, mediaType: 'movie' | 'tv') => {
        const state = get()
        const watchlistMediaType = mediaType === 'movie' ? 'MOVIE' : 'TV'
        return state.watchedItems.some(
          item => item.tmdbId === tmdbId && item.mediaType === watchlistMediaType
        )
      },

      // Bulk operations
      markAsCompleted: (id: string) =>
        set(
          state => ({
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
          state => ({
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
          state => ({
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

      // Optimistic update actions
      optimisticUpdateItem: (id: string, updates: Partial<WatchedItem>) =>
        set(
          state => {
            const item = state.watchedItems.find(item => item.id === id)
            if (!item) return state

            // Store rollback data if not already stored
            if (!state.rollbackData.has(id)) {
              state.rollbackData.set(id, { ...item })
            }

            // Apply optimistic update
            const updatedItems = state.watchedItems.map(item =>
              item.id === id ? { ...item, ...updates } : item
            )

            // Track the operation
            state.optimisticItems.set(id, { ...item, ...updates })
            state.pendingOperations.set(id, 'update')

            return {
              watchedItems: updatedItems,
              lastUpdated: new Date(),
            }
          },
          false,
          'media/optimisticUpdateItem'
        ),

      optimisticAddItem: (item: WatchedItem) =>
        set(
          state => {
            // Track the operation
            state.optimisticItems.set(item.id, item)
            state.pendingOperations.set(item.id, 'create')
            state.rollbackData.set(item.id, null) // null means item didn't exist

            return {
              watchedItems: [item, ...state.watchedItems],
              lastUpdated: new Date(),
            }
          },
          false,
          'media/optimisticAddItem'
        ),

      optimisticRemoveItem: (id: string) =>
        set(
          state => {
            const item = state.watchedItems.find(item => item.id === id)
            if (!item) return state

            // Store rollback data
            state.rollbackData.set(id, { ...item })
            state.pendingOperations.set(id, 'delete')

            return {
              watchedItems: state.watchedItems.filter(item => item.id !== id),
              lastUpdated: new Date(),
            }
          },
          false,
          'media/optimisticRemoveItem'
        ),

      confirmOptimisticUpdate: (id: string) =>
        set(
          state => {
            // Clean up tracking data
            state.optimisticItems.delete(id)
            state.pendingOperations.delete(id)
            state.rollbackData.delete(id)

            return {}
          },
          false,
          'media/confirmOptimisticUpdate'
        ),

      rollbackOptimisticUpdate: (id: string) =>
        set(
          state => {
            const rollbackItem = state.rollbackData.get(id)
            const operation = state.pendingOperations.get(id)

            if (operation === 'create') {
              // Remove the optimistically added item
              return {
                watchedItems: state.watchedItems.filter(item => item.id !== id),
                lastUpdated: new Date(),
              }
            } else if (operation === 'delete' && rollbackItem) {
              // Restore the deleted item
              return {
                watchedItems: [rollbackItem, ...state.watchedItems],
                lastUpdated: new Date(),
              }
            } else if (operation === 'update' && rollbackItem) {
              // Restore the original item
              return {
                watchedItems: state.watchedItems.map(item =>
                  item.id === id ? rollbackItem : item
                ),
                lastUpdated: new Date(),
              }
            }

            return {}
          },
          false,
          'media/rollbackOptimisticUpdate'
        ),

      clearOptimisticUpdates: () =>
        set(
          state => {
            state.optimisticItems.clear()
            state.pendingOperations.clear()
            state.rollbackData.clear()
            return {}
          },
          false,
          'media/clearOptimisticUpdates'
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
