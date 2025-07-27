'use client'

// Test component to verify the infinite loop fix
import { useUI } from '@/hooks/use-ui'
import { useUserStore } from '@/stores/user-store'
import { useSearch } from '@/hooks/use-search'

export function TestPreferences() {
  const { theme, viewMode, setTheme, setViewMode, savePreferences } = useUI()
  const { preferences, isSignedIn } = useUserStore()
  const { query, results, isLoading, setQuery } = useSearch()

  return (
    <div className="p-4 border rounded space-y-4">
      <h3>Test Component - No Infinite Loops!</h3>
      
      {/* Search Test */}
      <div className="border p-3 rounded">
        <h4>Search Test (should not cause infinite loops)</h4>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Test search..."
          className="border p-2 rounded w-full"
        />
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p>Results count: {results.length}</p>
        <p>Query: &quot;{query}&quot;</p>
      </div>

      {/* Preferences Test */}
      <div className="border p-3 rounded">
        <h4>Preferences Test</h4>
        <div className="space-y-2">
          <p>Signed In: {isSignedIn ? 'Yes' : 'No'}</p>
          <p>Current UI Theme: {theme}</p>
          <p>Current UI View: {viewMode}</p>
          <p>Saved Preference Theme: {preferences.theme}</p>
          <p>Saved Preference View: {preferences.defaultViewMode}</p>
        </div>

        <div className="space-x-2 mt-4">
          <button 
            onClick={() => setTheme('dark')}
            className="bg-gray-800 text-white px-3 py-1 rounded"
          >
            Set Dark Theme
          </button>
          <button 
            onClick={() => setTheme('light')}
            className="bg-gray-200 text-black px-3 py-1 rounded"
          >
            Set Light Theme
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Grid View
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            List View
          </button>
          <button 
            onClick={savePreferences}
            className="bg-purple-500 text-white px-3 py-1 rounded"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  )
}