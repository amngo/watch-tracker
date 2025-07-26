import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'

export interface UIStoreState {
  // Modal states
  isSearchModalOpen: boolean
  isProfileModalOpen: boolean
  isSettingsModalOpen: boolean
  
  // Loading states
  isLoading: boolean
  loadingMessage: string | null
  
  // Search state
  searchQuery: string
  searchResults: any[]
  searchLoading: boolean
  
  // Filters and sorting
  viewMode: 'grid' | 'list'
  sortBy: 'title' | 'dateAdded' | 'dateWatched' | 'rating' | 'progress'
  sortOrder: 'asc' | 'desc'
  filterStatus: 'all' | 'watching' | 'completed' | 'paused' | 'planned'
  filterType: 'all' | 'movie' | 'tv'
  
  // UI preferences
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'system'
  
  // Actions
  openSearchModal: () => void
  closeSearchModal: () => void
  openProfileModal: () => void
  closeProfileModal: () => void
  openSettingsModal: () => void
  closeSettingsModal: () => void
  
  setLoading: (loading: boolean, message?: string) => void
  
  setSearchQuery: (query: string) => void
  setSearchResults: (results: any[]) => void
  setSearchLoading: (loading: boolean) => void
  clearSearch: () => void
  
  setViewMode: (mode: 'grid' | 'list') => void
  setSortBy: (sortBy: UIStoreState['sortBy']) => void
  setSortOrder: (order: 'asc' | 'desc') => void
  setFilterStatus: (status: UIStoreState['filterStatus']) => void
  setFilterType: (type: UIStoreState['filterType']) => void
  
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setTheme: (theme: UIStoreState['theme']) => void
  
  reset: () => void
}

const initialState = {
  // Modal states
  isSearchModalOpen: false,
  isProfileModalOpen: false,
  isSettingsModalOpen: false,
  
  // Loading states
  isLoading: false,
  loadingMessage: null,
  
  // Search state
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  
  // Filters and sorting
  viewMode: 'grid' as const,
  sortBy: 'dateAdded' as const,
  sortOrder: 'desc' as const,
  filterStatus: 'all' as const,
  filterType: 'all' as const,
  
  // UI preferences
  sidebarCollapsed: false,
  theme: 'system' as const,
}

export const useUIStore = create<UIStoreState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      // Modal actions
      openSearchModal: () =>
        set({ isSearchModalOpen: true }, false, 'ui/openSearchModal'),
      
      closeSearchModal: () =>
        set({ isSearchModalOpen: false }, false, 'ui/closeSearchModal'),
      
      openProfileModal: () =>
        set({ isProfileModalOpen: true }, false, 'ui/openProfileModal'),
      
      closeProfileModal: () =>
        set({ isProfileModalOpen: false }, false, 'ui/closeProfileModal'),
      
      openSettingsModal: () =>
        set({ isSettingsModalOpen: true }, false, 'ui/openSettingsModal'),
      
      closeSettingsModal: () =>
        set({ isSettingsModalOpen: false }, false, 'ui/closeSettingsModal'),

      // Loading actions
      setLoading: (loading: boolean, message?: string) =>
        set(
          { isLoading: loading, loadingMessage: message || null },
          false,
          'ui/setLoading'
        ),

      // Search actions
      setSearchQuery: (query: string) =>
        set({ searchQuery: query }, false, 'ui/setSearchQuery'),

      setSearchResults: (results: any[]) =>
        set({ searchResults: results }, false, 'ui/setSearchResults'),

      setSearchLoading: (loading: boolean) =>
        set({ searchLoading: loading }, false, 'ui/setSearchLoading'),

      clearSearch: () =>
        set(
          { searchQuery: '', searchResults: [], searchLoading: false },
          false,
          'ui/clearSearch'
        ),

      // Filter and sort actions
      setViewMode: (mode: 'grid' | 'list') =>
        set({ viewMode: mode }, false, 'ui/setViewMode'),

      setSortBy: (sortBy: UIStoreState['sortBy']) =>
        set({ sortBy }, false, 'ui/setSortBy'),

      setSortOrder: (order: 'asc' | 'desc') =>
        set({ sortOrder: order }, false, 'ui/setSortOrder'),

      setFilterStatus: (status: UIStoreState['filterStatus']) =>
        set({ filterStatus: status }, false, 'ui/setFilterStatus'),

      setFilterType: (type: UIStoreState['filterType']) =>
        set({ filterType: type }, false, 'ui/setFilterType'),

      // UI preference actions
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }), false, 'ui/toggleSidebar'),

      setSidebarCollapsed: (collapsed: boolean) =>
        set({ sidebarCollapsed: collapsed }, false, 'ui/setSidebarCollapsed'),

      setTheme: (theme: UIStoreState['theme']) =>
        set({ theme }, false, 'ui/setTheme'),

      reset: () => set(initialState, false, 'ui/reset'),
    })),
    { name: 'ui-store' }
  )
)