import { getFullImagePath } from 'tmdb-ts'
import { tmdb } from './tmdb'

/**
 * Fetches popular movies and TV shows and returns their poster URLs
 * @param count - Number of poster URLs to return (default: 20)
 * @returns Array of poster URLs
 */
export async function getPopularMediaPosters(
  count: number = 20
): Promise<string[]> {
  try {
    // Check if TMDB API key is available
    if (!process.env.NEXT_PUBLIC_TMDB_API_KEY) {
      console.warn('TMDB API key not found, using fallback posters')
      return generateFallbackPosters(count)
    }

    // Fetch popular movies and TV shows in parallel with timeout
    const fetchPromises = [tmdb.movies.popular(), tmdb.tvShows.popular()]

    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000) // 10 second timeout
    })

    const [moviesResponse, tvResponse] = await Promise.race([
      Promise.all(fetchPromises),
      timeoutPromise,
    ])

    // Validate responses
    if (!moviesResponse?.results || !tvResponse?.results) {
      throw new Error('Invalid TMDB API response')
    }

    // Combine and shuffle the results
    const allMedia = [...moviesResponse.results, ...tvResponse.results]
    const shuffled = allMedia.sort(() => Math.random() - 0.5)

    // Extract poster URLs, filter out null values, and limit to requested count
    const posterUrls: string[] = []

    for (const item of shuffled) {
      if (posterUrls.length >= count) break

      if (item.poster_path) {
        const posterUrl = getFullImagePath(
          'https://image.tmdb.org/t/p/',
          'w500',
          item.poster_path
        )
        if (posterUrl) {
          posterUrls.push(posterUrl)
        }
      }
    }

    // Ensure we have enough posters, add fallbacks if needed
    if (posterUrls.length < count) {
      const fallbacks = generateFallbackPosters(count - posterUrls.length)
      posterUrls.push(...fallbacks)
    }

    return posterUrls.slice(0, count)
  } catch (error) {
    console.error('Error fetching popular media posters:', error)

    // Fallback: return placeholder images
    return generateFallbackPosters(count)
  }
}

/**
 * Generates fallback poster URLs when TMDB API fails
 * @param count - Number of fallback URLs to generate
 * @returns Array of fallback poster URLs
 */
function generateFallbackPosters(count: number): string[] {
  const fallbackUrls = [
    'https://via.placeholder.com/500x750?text=Movie+Poster+1',
    'https://via.placeholder.com/500x750?text=Movie+Poster+2',
    'https://via.placeholder.com/500x750?text=Movie+Poster+3',
    'https://via.placeholder.com/500x750?text=Movie+Poster+4',
    'https://via.placeholder.com/500x750?text=Movie+Poster+5',
  ]

  // Repeat and slice to get exactly the requested count
  const repeated = Array.from(
    { length: Math.ceil(count / fallbackUrls.length) },
    () => fallbackUrls
  ).flat()
  return repeated.slice(0, count)
}

/**
 * Cache for popular media posters with expiration
 */
class PopularMediaCache {
  private cache: { data: string[]; timestamp: number } | null = null
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  async get(count: number): Promise<string[]> {
    const now = Date.now()

    // Check if cache is valid
    if (this.cache && now - this.cache.timestamp < this.CACHE_DURATION) {
      return this.cache.data.slice(0, count)
    }

    // Fetch fresh data
    const data = await getPopularMediaPosters(count)
    this.cache = { data, timestamp: now }

    return data
  }

  clear(): void {
    this.cache = null
  }
}

export const popularMediaCache = new PopularMediaCache()
