import { create } from 'zustand'
import { devtools, subscribeWithSelector, persist } from 'zustand/middleware'

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'es' | 'fr' | 'de' | 'ja'
  timezone: string
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  defaultViewMode: 'grid' | 'list'
  autoMarkCompleted: boolean
  showSpoilers: boolean
  enableNotifications: boolean
  episodeReminderOffset: number // minutes before episode airs
}

export interface UserProfile {
  id: string
  email: string
  username?: string
  displayName?: string
  avatarUrl?: string
  createdAt: Date
  lastLoginAt: Date
}

export interface UserStoreState {
  // User data
  profile: UserProfile | null
  preferences: UserPreferences
  isSignedIn: boolean
  
  // Loading states
  profileLoading: boolean
  preferencesLoading: boolean
  
  // Error states
  profileError: string | null
  preferencesError: string | null
  
  // Actions - Profile management
  setProfile: (profile: UserProfile | null) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  clearProfile: () => void
  
  // Actions - Preferences management
  setPreferences: (preferences: Partial<UserPreferences>) => void
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => void
  resetPreferences: () => void
  
  // Actions - Authentication state
  setSignedIn: (signedIn: boolean) => void
  
  // Actions - Loading states
  setProfileLoading: (loading: boolean) => void
  setPreferencesLoading: (loading: boolean) => void
  
  // Actions - Error states
  setProfileError: (error: string | null) => void
  setPreferencesError: (error: string | null) => void
  
  // Utility actions
  getPreference: <K extends keyof UserPreferences>(key: K) => UserPreferences[K]
  isPreferenceSet: <K extends keyof UserPreferences>(key: K) => boolean
  
  reset: () => void
  resetErrors: () => void
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormat: 'MM/DD/YYYY',
  defaultViewMode: 'grid',
  autoMarkCompleted: true,
  showSpoilers: false,
  enableNotifications: true,
  episodeReminderOffset: 30,
}

const initialState = {
  // User data
  profile: null,
  preferences: defaultPreferences,
  isSignedIn: false,
  
  // Loading states
  profileLoading: false,
  preferencesLoading: false,
  
  // Error states
  profileError: null,
  preferencesError: null,
}

export const useUserStore = create<UserStoreState>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          ...initialState,

          // Profile management actions
          setProfile: (profile: UserProfile | null) =>
            set(
              { profile, isSignedIn: !!profile },
              false,
              'user/setProfile'
            ),

          updateProfile: (updates: Partial<UserProfile>) =>
            set(
              (state) => ({
                profile: state.profile ? { ...state.profile, ...updates } : null,
              }),
              false,
              'user/updateProfile'
            ),

          clearProfile: () =>
            set(
              { profile: null, isSignedIn: false },
              false,
              'user/clearProfile'
            ),

          // Preferences management actions
          setPreferences: (preferences: Partial<UserPreferences>) =>
            set(
              (state) => ({
                preferences: { ...state.preferences, ...preferences },
              }),
              false,
              'user/setPreferences'
            ),

          updatePreference: <K extends keyof UserPreferences>(
            key: K,
            value: UserPreferences[K]
          ) =>
            set(
              (state) => ({
                preferences: { ...state.preferences, [key]: value },
              }),
              false,
              'user/updatePreference'
            ),

          resetPreferences: () =>
            set(
              { preferences: defaultPreferences },
              false,
              'user/resetPreferences'
            ),

          // Authentication state actions
          setSignedIn: (signedIn: boolean) =>
            set({ isSignedIn: signedIn }, false, 'user/setSignedIn'),

          // Loading state actions
          setProfileLoading: (loading: boolean) =>
            set({ profileLoading: loading }, false, 'user/setProfileLoading'),

          setPreferencesLoading: (loading: boolean) =>
            set(
              { preferencesLoading: loading },
              false,
              'user/setPreferencesLoading'
            ),

          // Error state actions
          setProfileError: (error: string | null) =>
            set({ profileError: error }, false, 'user/setProfileError'),

          setPreferencesError: (error: string | null) =>
            set({ preferencesError: error }, false, 'user/setPreferencesError'),

          // Utility actions
          getPreference: <K extends keyof UserPreferences>(key: K) => {
            const state = get()
            return state.preferences[key]
          },

          isPreferenceSet: <K extends keyof UserPreferences>(key: K) => {
            const state = get()
            return state.preferences[key] !== defaultPreferences[key]
          },

          reset: () => set(initialState, false, 'user/reset'),

          resetErrors: () =>
            set(
              { profileError: null, preferencesError: null },
              false,
              'user/resetErrors'
            ),
        }),
        {
          name: 'user-store',
          partialize: (state) => ({
            preferences: state.preferences,
            // Only persist preferences, not profile data for security
          }),
        }
      )
    ),
    { name: 'user-store' }
  )
)