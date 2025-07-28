import { useEffect, useState, useCallback } from 'react'
import { api } from '@/trpc/react'
import { TMDBService } from '@/lib/tmdb'

interface BreadcrumbData {
  tvShows: Record<string, string>
  movies: Record<string, string>
  seasons: Record<string, string>
}

export function useBreadcrumbData() {
  const [breadcrumbData, setBreadcrumbData] = useState<BreadcrumbData>({
    tvShows: {},
    movies: {},
    seasons: {}
  })

  const { data: watchedItemsData } = api.watchedItem.getAll.useQuery({})

  useEffect(() => {
    if (watchedItemsData?.items) {
      const newData: BreadcrumbData = {
        tvShows: {},
        movies: {},
        seasons: {}
      }

      // Build cache from watched items
      watchedItemsData.items.forEach((item: any) => {
        if (item.mediaType === 'TV_SHOW') {
          newData.tvShows[item.tmdbId.toString()] = item.title
        } else if (item.mediaType === 'MOVIE') {
          newData.movies[item.tmdbId.toString()] = item.title
        }
      })

      setBreadcrumbData(newData)
    }
  }, [watchedItemsData])

  const getTVShowTitle = useCallback(async (tvId: string): Promise<string> => {
    // Check cache first
    if (breadcrumbData.tvShows[tvId]) {
      return breadcrumbData.tvShows[tvId]
    }

    try {
      const tmdbService = new TMDBService()
      const tvDetails = await tmdbService.getTVDetails(parseInt(tvId))
      const title = tvDetails.name || `TV Show ${tvId}`
      
      // Update cache
      setBreadcrumbData(prev => ({
        ...prev,
        tvShows: { ...prev.tvShows, [tvId]: title }
      }))
      
      return title
    } catch (error) {
      console.error('Failed to fetch TV show title:', error)
      return `TV Show ${tvId}`
    }
  }, [breadcrumbData.tvShows])

  const getMovieTitle = useCallback(async (movieId: string): Promise<string> => {
    // Check cache first
    if (breadcrumbData.movies[movieId]) {
      return breadcrumbData.movies[movieId]
    }

    try {
      const tmdbService = new TMDBService()
      const movieDetails = await tmdbService.getMovieDetails(parseInt(movieId))
      const title = movieDetails.title || `Movie ${movieId}`
      
      // Update cache
      setBreadcrumbData(prev => ({
        ...prev,
        movies: { ...prev.movies, [movieId]: title }
      }))
      
      return title
    } catch (error) {
      console.error('Failed to fetch movie title:', error)
      return `Movie ${movieId}`
    }
  }, [breadcrumbData.movies])

  const getSeasonName = useCallback(async (tvId: string, seasonNumber: string): Promise<string> => {
    const cacheKey = `${tvId}-${seasonNumber}`
    
    // Check cache first
    if (breadcrumbData.seasons[cacheKey]) {
      return breadcrumbData.seasons[cacheKey]
    }

    try {
      const tmdbService = new TMDBService()
      const seasonDetails = await tmdbService.getTVSeasonDetails(parseInt(tvId), parseInt(seasonNumber))
      const name = seasonDetails.name || `Season ${seasonNumber}`
      
      // Update cache
      setBreadcrumbData(prev => ({
        ...prev,
        seasons: { ...prev.seasons, [cacheKey]: name }
      }))
      
      return name
    } catch (error) {
      console.error('Failed to fetch season name:', error)
      return `Season ${seasonNumber}`
    }
  }, [breadcrumbData.seasons])

  return {
    breadcrumbData,
    getTVShowTitle,
    getMovieTitle,
    getSeasonName
  }
}