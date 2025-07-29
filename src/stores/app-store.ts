import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'

export interface AppStoreState {
  // Global app state
  isInitialized: boolean
  isOnline: boolean
  lastSyncTime: Date | null
  
  // Actions
  setInitialized: (initialized: boolean) => void
  setOnlineStatus: (online: boolean) => void
  updateLastSyncTime: () => void
  reset: () => void
}

const initialState = {
  isInitialized: false,
  isOnline: true,
  lastSyncTime: null,
}

export const useAppStore = create<AppStoreState>()(
  devtools(
    subscribeWithSelector((set, _get) => ({
      ...initialState,

      setInitialized: (initialized: boolean) =>
        set({ isInitialized: initialized }, false, 'app/setInitialized'),

      setOnlineStatus: (online: boolean) =>
        set({ isOnline: online }, false, 'app/setOnlineStatus'),

      updateLastSyncTime: () =>
        set({ lastSyncTime: new Date() }, false, 'app/updateLastSyncTime'),

      reset: () => set(initialState, false, 'app/reset'),
    })),
    { name: 'app-store' }
  )
)