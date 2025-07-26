# Zustand State Management Implementation

This project now includes comprehensive Zustand state management with four main stores:

## Store Architecture

### 1. App Store (`useAppStore`)
Global application state and initialization.

```tsx
import { useAppStore } from '@/stores'

function MyComponent() {
  const { isInitialized, isOnline, setOnlineStatus } = useAppStore()
  
  return (
    <div>
      {isInitialized ? 'App loaded' : 'Loading...'}
      {isOnline ? 'Online' : 'Offline'}
    </div>
  )
}
```

### 2. User Store (`useUserStore`)
User profile, preferences, and authentication state.

```tsx
import { useUserStore } from '@/stores'

function UserProfile() {
  const { 
    profile, 
    preferences, 
    isSignedIn, 
    updatePreference 
  } = useUserStore()
  
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updatePreference('theme', theme)
  }
  
  return (
    <div>
      {isSignedIn && <p>Welcome, {profile?.displayName}!</p>}
      <select onChange={(e) => handleThemeChange(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  )
}
```

### 3. UI Store (`useUIStore`)
UI state, modals, filters, and user interface preferences.

```tsx
import { useUI } from '@/hooks/use-ui'

function MediaFilters() {
  const {
    filterStatus,
    filterType,
    sortBy,
    viewMode,
    setFilterStatus,
    setViewMode,
    resetFilters
  } = useUI()
  
  return (
    <div>
      <select 
        value={filterStatus} 
        onChange={(e) => setFilterStatus(e.target.value)}
      >
        <option value="all">All Items</option>
        <option value="watching">Currently Watching</option>
        <option value="completed">Completed</option>
      </select>
      
      <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
        {viewMode === 'grid' ? 'List View' : 'Grid View'}
      </button>
      
      <button onClick={resetFilters}>Reset Filters</button>
    </div>
  )
}
```

### 4. Media Store (`useMediaStore`)
Movies, TV shows, watchlist, and related data.

```tsx
import { useMedia } from '@/hooks/use-media'

function WatchlistManager() {
  const {
    watchedItems,
    stats,
    itemsLoading,
    addMedia,
    updateItem,
    markCompleted,
    getItemsByStatus
  } = useMedia()
  
  const watchingItems = getItemsByStatus('WATCHING')
  
  const handleMarkComplete = (id: string) => {
    markCompleted(id)
  }
  
  return (
    <div>
      <h2>Stats</h2>
      <p>Total Items: {stats?.totalItems || 0}</p>
      <p>Currently Watching: {stats?.currentlyWatching || 0}</p>
      
      <h2>Currently Watching ({watchingItems.length})</h2>
      {itemsLoading ? (
        <p>Loading...</p>
      ) : (
        watchingItems.map(item => (
          <div key={item.id}>
            <h3>{item.title}</h3>
            <p>Progress: {item.progress}%</p>
            <button onClick={() => handleMarkComplete(item.id)}>
              Mark Complete
            </button>
          </div>
        ))
      )}
    </div>
  )
}
```

## Search Integration

```tsx
import { useSearch } from '@/hooks/use-search'

function MediaSearchComponent() {
  const {
    query,
    results,
    isLoading,
    setQuery,
    clearSearch,
    openSearchModal,
    closeSearchModal
  } = useSearch()
  
  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search movies and TV shows..."
      />
      
      {isLoading && <p>Searching...</p>}
      
      {results.map(item => (
        <div key={item.id}>
          <h4>{item.title || item.name}</h4>
          <p>Rating: {item.vote_average}/10</p>
        </div>
      ))}
      
      <button onClick={clearSearch}>Clear Search</button>
    </div>
  )
}
```

## Key Features

### Automatic Synchronization
- All stores automatically sync with tRPC data
- Real-time updates when backend data changes
- Optimistic updates with error handling

### Persistence
- User preferences persist across sessions
- Theme and view settings are remembered
- Authentication state is maintained

### Type Safety
- Full TypeScript support
- Type-safe store actions and state
- IntelliSense support for all store methods

### Performance
- Built with Zustand's lightweight architecture
- Selective subscriptions prevent unnecessary re-renders
- DevTools integration for debugging

### Error Handling
- Automatic error state management
- Toast notifications for user feedback
- Graceful fallbacks for network issues

## Store Provider

The `StoreProvider` component is automatically included in the app layout and handles:

- Initialization of all stores
- Syncing with Clerk authentication
- Online/offline status monitoring
- User preference synchronization

## Available Hooks

- `useMedia()` - Media/watchlist management with tRPC integration
- `useSearch()` - Search functionality with debounced queries
- `useUI()` - UI state management with convenient actions
- Direct store access: `useAppStore()`, `useUserStore()`, `useUIStore()`, `useMediaStore()`

This implementation provides a robust, type-safe, and performant state management solution for the watch-tracker application.