'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useAppStore } from '@/stores/app-store'
import { useUserStore } from '@/stores/user-store'
import { useUIStore } from '@/stores/ui-store'
import { useMediaStore } from '@/stores/media-store'

interface StoreProviderProps {
  children: React.ReactNode
}

export function StoreProvider({ children }: StoreProviderProps) {
  const { user, isLoaded } = useUser()
  const appStore = useAppStore()
  const userStore = useUserStore()
  const uiStore = useUIStore()
  const mediaStore = useMediaStore()

  // Initialize stores when user data is loaded
  useEffect(() => {
    if (isLoaded) {
      appStore.setInitialized(true)
      
      if (user) {
        // Set user profile
        userStore.setProfile({
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          username: user.username || undefined,
          displayName: user.fullName || undefined,
          avatarUrl: user.imageUrl || undefined,
          createdAt: new Date(user.createdAt || Date.now()),
          lastLoginAt: new Date(user.lastSignInAt || user.createdAt || Date.now()),
        })
        
        userStore.setSignedIn(true)
      } else {
        userStore.clearProfile()
        userStore.setSignedIn(false)
      }
    }
  }, [isLoaded, user])

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => appStore.setOnlineStatus(true)
    const handleOffline = () => appStore.setOnlineStatus(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Initialize UI preferences from user preferences (one-way sync only)
  useEffect(() => {
    if (userStore.isSignedIn && userStore.preferences) {
      // Only update if values are different to prevent loops
      if (uiStore.theme !== userStore.preferences.theme) {
        uiStore.setTheme(userStore.preferences.theme)
      }
      if (uiStore.viewMode !== userStore.preferences.defaultViewMode) {
        uiStore.setViewMode(userStore.preferences.defaultViewMode)
      }
    }
  }, [userStore.isSignedIn, userStore.preferences])

  // Note: Removed automatic bi-directional sync to prevent infinite loops
  // UI preferences should be saved explicitly by user action, not automatically

  // Clear stores on sign out
  useEffect(() => {
    if (isLoaded && !user) {
      mediaStore.reset()
      // Don't reset UI store completely, keep some preferences
      uiStore.closeSearchModal()
      uiStore.closeProfileModal()
      uiStore.closeSettingsModal()
    }
  }, [isLoaded, user])

  return <>{children}</>
}