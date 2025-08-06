import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { api } from '@/trpc/react'
import { tmdb } from '@/lib/tmdb'

interface BreadcrumbData {
  tvShows: Record<string, string>
  movies: Record<string, string>
  seasons: Record<string, string>
  episodes: Record<string, string> // Key format: "tvId-seasonNumber-episodeNumber"
}

export function useBreadcrumbData() {
  const [breadcrumbData, setBreadcrumbData] = useState<BreadcrumbData>({
    tvShows: {},
    movies: {},
    seasons: {},
    episodes: {},
  })

  // Use a ref to store the latest data to avoid dependencies
  const breadcrumbDataRef = useRef(breadcrumbData)
  breadcrumbDataRef.current = breadcrumbData

  const { data: watchedItemsData } = api.watchedItem.getAll.useQuery(
    {},
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime in newer versions)
    }
  )

  // Memoize the processed data to prevent unnecessary recalculations
  const processedWatchedData = useMemo(() => {
    if (!watchedItemsData?.items) return null

    const newData: BreadcrumbData = {
      tvShows: {},
      movies: {},
      seasons: {},
      episodes: {},
    }

    // Build cache from watched items
    watchedItemsData.items.forEach(item => {
      if (item.mediaType === 'TV') {
        newData.tvShows[item.tmdbId.toString()] = item.title
      } else if (item.mediaType === 'MOVIE') {
        newData.movies[item.tmdbId.toString()] = item.title
      }
    })

    return newData
  }, [watchedItemsData])

  useEffect(() => {
    if (processedWatchedData) {
      // Only update if there are actual changes
      setBreadcrumbData(prev => {
        const hasChanges =
          Object.keys(processedWatchedData.tvShows).some(
            key => prev.tvShows[key] !== processedWatchedData.tvShows[key]
          ) ||
          Object.keys(processedWatchedData.movies).some(
            key => prev.movies[key] !== processedWatchedData.movies[key]
          ) ||
          Object.keys(prev.tvShows).length !==
            Object.keys(processedWatchedData.tvShows).length ||
          Object.keys(prev.movies).length !==
            Object.keys(processedWatchedData.movies).length

        return hasChanges
          ? {
              ...prev,
              tvShows: { ...prev.tvShows, ...processedWatchedData.tvShows },
              movies: { ...prev.movies, ...processedWatchedData.movies },
              episodes: { ...prev.episodes, ...processedWatchedData.episodes },
            }
          : prev
      })
    }
  }, [processedWatchedData])

  // Cache for ongoing requests to prevent duplicate API calls
  const requestCache = useRef<Record<string, Promise<string>>>({})

  const getTVShowTitle = useCallback(async (tvId: string): Promise<string> => {
    // Check cache first
    const cached = breadcrumbDataRef.current.tvShows[tvId]
    if (cached) {
      return cached
    }

    // Check if request is already in progress
    const cacheKey = `tv-${tvId}`
    const existingRequest = requestCache.current[cacheKey]
    if (existingRequest) {
      return existingRequest
    }

    // Create and cache the request
    requestCache.current[cacheKey] = (async () => {
      try {
        const tvDetails = await tmdb.tvShows.details(parseInt(tvId))
        const title = tvDetails.name || `TV Show ${tvId}`

        // Update cache
        setBreadcrumbData(prev => ({
          ...prev,
          tvShows: { ...prev.tvShows, [tvId]: title },
        }))

        return title
      } catch (error) {
        console.error('Failed to fetch TV show title for ID:', tvId, error)
        return `TV Show ${tvId}`
      } finally {
        // Clean up request cache
        delete requestCache.current[cacheKey]
      }
    })()

    return requestCache.current[cacheKey]
  }, [])

  const getMovieTitle = useCallback(
    async (movieId: string): Promise<string> => {
      // Check cache first
      const cached = breadcrumbDataRef.current.movies[movieId]
      if (cached) {
        return cached
      }

      // Check if request is already in progress
      const cacheKey = `movie-${movieId}`
      const existingRequest = requestCache.current[cacheKey]
      if (existingRequest) {
        return existingRequest
      }

      // Create and cache the request
      requestCache.current[cacheKey] = (async () => {
        try {
          const movieDetails = await tmdb.movies.details(parseInt(movieId))
          const title = movieDetails.title || `Movie ${movieId}`

          // Update cache
          setBreadcrumbData(prev => ({
            ...prev,
            movies: { ...prev.movies, [movieId]: title },
          }))

          return title
        } catch (error) {
          console.error('Failed to fetch movie title for ID:', movieId, error)
          return `Movie ${movieId}`
        } finally {
          // Clean up request cache
          delete requestCache.current[cacheKey]
        }
      })()

      return requestCache.current[cacheKey]
    },
    []
  )

  const getSeasonName = useCallback(
    async (tvId: string, seasonNumber: string): Promise<string> => {
      const cacheKey = `${tvId}-${seasonNumber}`

      // Check cache first
      const cached = breadcrumbDataRef.current.seasons[cacheKey]
      if (cached) {
        return cached
      }

      // Check if request is already in progress
      const requestCacheKey = `season-${cacheKey}`
      const existingRequest = requestCache.current[requestCacheKey]
      if (existingRequest) {
        return existingRequest
      }

      // Create and cache the request
      requestCache.current[requestCacheKey] = (async () => {
        try {
          const seasonDetails = await tmdb.tvSeasons.details({
            tvShowID: parseInt(tvId),
            seasonNumber: parseInt(seasonNumber),
          })
          const name = seasonDetails.name || `Season ${seasonNumber}`

          // Update cache
          setBreadcrumbData(prev => ({
            ...prev,
            seasons: { ...prev.seasons, [cacheKey]: name },
          }))

          return name
        } catch (error) {
          console.error(
            'Failed to fetch season name for TV ID:',
            tvId,
            'Season:',
            seasonNumber,
            error
          )
          return `Season ${seasonNumber}`
        } finally {
          // Clean up request cache
          delete requestCache.current[requestCacheKey]
        }
      })()

      return requestCache.current[requestCacheKey]
    },
    []
  )

  const getEpisodeName = useCallback(
    async (
      tvId: string,
      seasonNumber: string,
      episodeNumber: string
    ): Promise<string> => {
      const cacheKey = `${tvId}-${seasonNumber}-${episodeNumber}`

      // Check cache first
      const cached = breadcrumbDataRef.current.episodes[cacheKey]
      if (cached) {
        return cached
      }

      // Check if request is already in progress
      const requestCacheKey = `episode-${cacheKey}`
      const existingRequest = requestCache.current[requestCacheKey]
      if (existingRequest) {
        return existingRequest
      }

      // Create and cache the request
      requestCache.current[requestCacheKey] = (async () => {
        try {
          const episodeDetails = await tmdb.tvEpisode.details({
            tvShowID: parseInt(tvId),
            seasonNumber: parseInt(seasonNumber),
            episodeNumber: parseInt(episodeNumber),
          })
          const name = episodeDetails.name || `Episode ${episodeNumber}`

          // Update cache
          setBreadcrumbData(prev => ({
            ...prev,
            episodes: { ...prev.episodes, [cacheKey]: name },
          }))

          return name
        } catch (error) {
          console.error(
            'Failed to fetch episode name for TV ID:',
            tvId,
            'Season:',
            seasonNumber,
            'Episode:',
            episodeNumber,
            error
          )
          return `Episode ${episodeNumber}`
        } finally {
          // Clean up request cache
          delete requestCache.current[requestCacheKey]
        }
      })()

      return requestCache.current[requestCacheKey]
    },
    []
  )

  return {
    breadcrumbData,
    getTVShowTitle,
    getMovieTitle,
    getSeasonName,
    getEpisodeName,
  }
}
