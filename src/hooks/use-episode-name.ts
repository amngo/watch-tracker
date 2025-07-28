'use client'

import { useState, useEffect } from 'react'
import { getEpisodeName } from '@/lib/episode-utils'

export function useEpisodeName(
  tmdbId: number | undefined,
  seasonNumber: number | null,
  episodeNumber: number | null
) {
  const [episodeName, setEpisodeName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Only fetch if we have all required data for a TV episode
    if (!tmdbId || !seasonNumber || !episodeNumber) {
      setEpisodeName(null)
      return
    }

    setIsLoading(true)
    
    getEpisodeName(tmdbId, seasonNumber, episodeNumber)
      .then((name) => {
        setEpisodeName(name)
      })
      .catch((error) => {
        console.warn('Failed to fetch episode name:', error)
        setEpisodeName(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [tmdbId, seasonNumber, episodeNumber])

  return {
    episodeName,
    isLoading,
    hasEpisodeInfo: Boolean(seasonNumber && episodeNumber)
  }
}