import { useCallback } from 'react'
import { useUIStore } from '@/stores/ui-store'
import { useUserStore } from '@/stores/user-store'

export function useUI() {
  const store = useUIStore()
  const userStore = useUserStore()

  // Modal actions with automatic state management
  const toggleSearchModal = useCallback(() => {
    if (store.isSearchModalOpen) {
      store.closeSearchModal()
    } else {
      store.openSearchModal()
    }
  }, []) // Removed 'store' - state will be read fresh on each call

  const toggleProfileModal = useCallback(() => {
    if (store.isProfileModalOpen) {
      store.closeProfileModal()
    } else {
      store.openProfileModal()
    }
  }, []) // Removed 'store' - state will be read fresh on each call

  const toggleSettingsModal = useCallback(() => {
    if (store.isSettingsModalOpen) {
      store.closeSettingsModal()
    } else {
      store.openSettingsModal()
    }
  }, []) // Removed 'store' - state will be read fresh on each call

  // Loading state with automatic message handling
  const startLoading = useCallback(
    (message?: string) => {
      store.setLoading(true, message)
    },
    [] // Removed 'store' - Zustand store functions are stable
  )

  const stopLoading = useCallback(() => {
    store.setLoading(false)
  }, []) // Removed 'store' - Zustand store functions are stable

  // Filter and sort utilities
  const toggleSortOrder = useCallback(() => {
    store.setSortOrder(store.sortOrder === 'asc' ? 'desc' : 'asc')
  }, []) // Removed 'store' - state will be read fresh on each call

  const resetFilters = useCallback(() => {
    store.setFilterStatus('all')
    store.setFilterType('all')
    store.setSortBy('dateAdded')
    store.setSortOrder('desc')
  }, []) // Removed 'store' - Zustand store functions are stable

  // Theme management
  const cycleTheme = useCallback(() => {
    const themes: Array<'light' | 'dark' | 'system'> = [
      'light',
      'dark',
      'system',
    ]
    const currentIndex = themes.indexOf(store.theme)
    const nextIndex = (currentIndex + 1) % themes.length
    store.setTheme(themes[nextIndex])
  }, []) // Removed 'store' - state will be read fresh on each call

  // Save UI preferences to user store (explicit action)
  const savePreferences = useCallback(() => {
    if (userStore.isSignedIn) {
      userStore.updatePreference('theme', store.theme)
      userStore.updatePreference('defaultViewMode', store.viewMode)
    }
  }, []) // Removed store dependencies - state will be read fresh on each call

  return {
    // Modal states
    isSearchModalOpen: store.isSearchModalOpen,
    isProfileModalOpen: store.isProfileModalOpen,
    isSettingsModalOpen: store.isSettingsModalOpen,

    // Loading states
    isLoading: store.isLoading,
    loadingMessage: store.loadingMessage,

    // Search state (UI part only)
    searchQuery: store.searchQuery,
    searchResults: store.searchResults,
    searchLoading: store.searchLoading,

    // Filters and sorting
    viewMode: store.viewMode,
    sortBy: store.sortBy,
    sortOrder: store.sortOrder,
    filterStatus: store.filterStatus,
    filterType: store.filterType,

    // UI preferences
    sidebarCollapsed: store.sidebarCollapsed,
    theme: store.theme,

    // Modal actions
    openSearchModal: store.openSearchModal,
    closeSearchModal: store.closeSearchModal,
    toggleSearchModal,
    openProfileModal: store.openProfileModal,
    closeProfileModal: store.closeProfileModal,
    toggleProfileModal,
    openSettingsModal: store.openSettingsModal,
    closeSettingsModal: store.closeSettingsModal,
    toggleSettingsModal,

    // Loading actions
    setLoading: store.setLoading,
    startLoading,
    stopLoading,

    // Search actions (UI part)
    setSearchQuery: store.setSearchQuery,
    setSearchResults: store.setSearchResults,
    setSearchLoading: store.setSearchLoading,
    clearSearch: store.clearSearch,

    // Filter and sort actions
    setViewMode: store.setViewMode,
    setSortBy: store.setSortBy,
    setSortOrder: store.setSortOrder,
    toggleSortOrder,
    setFilterStatus: store.setFilterStatus,
    setFilterType: store.setFilterType,
    resetFilters,

    // UI preference actions
    toggleSidebar: store.toggleSidebar,
    setSidebarCollapsed: store.setSidebarCollapsed,
    setTheme: store.setTheme,
    cycleTheme,

    // Utility
    reset: store.reset,
    savePreferences,
  }
}
