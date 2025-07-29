import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { tmdbService } from '@/lib/tmdb'
import { addDays, startOfDay, isBefore, parseISO } from 'date-fns'

export interface ReleaseEvent {
  id: string
  title: string
  mediaType: 'MOVIE' | 'TV'
  date: Date
  poster: string | null
  tmdbId: number
  seasonNumber?: number
  episodeNumber?: number
  episodeName?: string
  watchedItemId: string
}

export const releasesRouter = createTRPCRouter({
  // Get upcoming releases for the user's watchlist
  getUpcoming: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        mediaType: z.enum(['MOVIE', 'TV']).optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const {
        startDate = startOfDay(new Date()),
        endDate = addDays(new Date(), 30),
        mediaType,
        limit,
      } = input

      // Get user's currently watching items
      const watchedItems = await ctx.db.watchedItem.findMany({
        where: {
          userId: ctx.user.id,
          //   status: 'WATCHING',
          ...(mediaType && { mediaType }),
        },
        include: {
          watchedEpisodes: {
            orderBy: { episodeNumber: 'desc' },
            take: 1, // Get the latest watched episode
          },
        },
      })

      const releases: ReleaseEvent[] = []

      // Process each watched item to find upcoming releases
      for (const item of watchedItems) {
        try {
          if (item.mediaType === 'TV') {
            // Get upcoming episodes for TV shows
            const tvReleases = await getUpcomingTVEpisodes(item, startDate)
            releases.push(...tvReleases)
          } else if (item.mediaType === 'MOVIE') {
            const movieDetails = await tmdbService.getMovieDetails(item.tmdbId)
            if (movieDetails && movieDetails.release_date) {
              const releaseDate = parseISO(movieDetails.release_date)
              if (releaseDate >= startOfDay(startDate)) {
                releases.push({
                  id: item.id,
                  title: item.title,
                  mediaType: 'MOVIE',
                  date: releaseDate,
                  poster: item.poster,
                  tmdbId: item.tmdbId,
                  watchedItemId: item.id,
                })
              }
            }
          }
        } catch (error) {
          console.error(`Failed to fetch releases for ${item.title}:`, error)
          // Continue with other items even if one fails
        }
      }

      // Sort by release date and limit results
      const sortedReleases = releases
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, limit)

      return sortedReleases
    }),

  // Get releases for a specific date range (for calendar view)
  getByDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        mediaType: z.enum(['MOVIE', 'TV']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, mediaType } = input

      // Get user's currently watching items
      const watchedItems = await ctx.db.watchedItem.findMany({
        where: {
          userId: ctx.user.id,
          //   status: 'WATCHING',
          ...(mediaType && { mediaType }),
        },
        include: {
          watchedEpisodes: {
            orderBy: { episodeNumber: 'desc' },
            take: 1,
          },
        },
      })

      const releases: ReleaseEvent[] = []

      // Process each watched item
      for (const item of watchedItems) {
        try {
          if (item.mediaType === 'TV') {
            const tvReleases = await getUpcomingTVEpisodes(item, startDate)
            releases.push(...tvReleases)
          } else if (item.mediaType === 'MOVIE') {
            const movieDetails = await tmdbService.getMovieDetails(item.tmdbId)
            if (movieDetails && movieDetails.release_date) {
              const releaseDate = parseISO(movieDetails.release_date)
              if (releaseDate >= startOfDay(startDate)) {
                releases.push({
                  id: item.id,
                  title: item.title,
                  mediaType: 'MOVIE',
                  date: releaseDate,
                  poster: item.poster,
                  tmdbId: item.tmdbId,
                  watchedItemId: item.id,
                })
              }
            }
          }
        } catch (error) {
          console.error(`Failed to fetch releases for ${item.title}:`, error)
        }
      }

      // Group releases by date for calendar view
      const releasesByDate: Record<string, ReleaseEvent[]> = {}

      releases.forEach(release => {
        const dateKey = release.date.toISOString().split('T')[0]
        if (!releasesByDate[dateKey]) {
          releasesByDate[dateKey] = []
        }
        releasesByDate[dateKey]!.push(release)
      })

      return releasesByDate
    }),
})

// Helper function to get upcoming TV episodes using next_episode_to_air
async function getUpcomingTVEpisodes(
  watchedItem: any,
  startDate: Date
): Promise<ReleaseEvent[]> {
  const releases: ReleaseEvent[] = []

  try {
    // Get TV show details to check for next_episode_to_air
    const tvDetails = await tmdbService.getTVDetailsExtended(watchedItem.tmdbId)

    if (tvDetails.seasons) {
      await Promise.all(
        tvDetails.seasons.map(async season => {
          const seasonDetails = await tmdbService.getTVSeasonDetails(
            watchedItem.tmdbId,
            season.season_number
          )

          // Process each episode in the season
          seasonDetails.episodes.forEach(episode => {
            if (!episode.air_date) return // Skip episodes without air date

            const airDate = parseISO(episode.air_date)

            if (airDate >= startDate) {
              releases.push({
                id: `${watchedItem.id}-s${season.season_number}e${episode.episode_number}`,
                title: watchedItem.title,
                mediaType: 'TV' as const,
                date: airDate,
                poster: watchedItem.poster,
                tmdbId: watchedItem.tmdbId,
                seasonNumber: season.season_number,
                episodeNumber: episode.episode_number,
                episodeName: episode.name,
                watchedItemId: watchedItem.id,
              })
            }
          })
        })
      )
    }

    // Fallback: If no next_episode_to_air, try to find upcoming episodes manually
    // This handles cases where TMDB doesn't have next_episode_to_air populated
    if (
      releases.length === 0 &&
      tvDetails.seasons &&
      tvDetails.seasons.length > 0
    ) {
      const fallbackReleases = await getFallbackUpcomingEpisodes(
        watchedItem,
        startDate,
        tvDetails
      )
      releases.push(...fallbackReleases)
    }
  } catch (error) {
    console.error(`Failed to fetch TV details for ${watchedItem.title}:`, error)
  }

  return releases
}

// Fallback function for when next_episode_to_air is not available
async function getFallbackUpcomingEpisodes(
  watchedItem: any,
  startDate: Date,
  tvDetails: any
): Promise<ReleaseEvent[]> {
  const releases: ReleaseEvent[] = []

  try {
    // Determine current position
    const currentSeason = watchedItem.currentSeason || 1
    const currentEpisode = watchedItem.currentEpisode || 0

    // Find the latest watched episode from database
    const latestWatchedEpisode = watchedItem.watchedEpisodes?.[0]
    const watchedSeason = latestWatchedEpisode?.seasonNumber || currentSeason
    const watchedEpisodeNum =
      latestWatchedEpisode?.episodeNumber || currentEpisode

    // Start checking from the next episode after the last watched
    let checkingSeason = watchedSeason
    let checkingEpisode = watchedEpisodeNum + 1

    // Only check the next few episodes to avoid overwhelming API calls
    const maxEpisodesToCheck = 5

    // Iterate through seasons to find upcoming episodes
    for (const season of tvDetails.seasons) {
      // Skip seasons before our current position
      if (season.season_number < checkingSeason) continue

      // Skip season 0 (specials) unless it's the only season or we're specifically watching it
      if (
        season.season_number === 0 &&
        tvDetails.seasons.length > 1 &&
        checkingSeason !== 0
      ) {
        continue
      }

      try {
        // Get detailed season information
        const seasonDetails = await tmdbService.getTVSeasonDetails(
          watchedItem.tmdbId,
          season.season_number
        )

        // Filter episodes based on our current position
        const episodesToCheck = seasonDetails.episodes
          .filter(episode => {
            if (season.season_number === checkingSeason) {
              return episode.episode_number >= checkingEpisode
            }
            return season.season_number > checkingSeason
          })
          .slice(0, maxEpisodesToCheck) // Limit to avoid too many API calls

        // Process each upcoming episode
        for (const episode of episodesToCheck) {
          if (!episode.air_date) continue

          const airDate = parseISO(episode.air_date)

          // Only include episodes within our date range and in the future
          if (
            airDate >= startDate &&
            !isBefore(airDate, startOfDay(new Date()))
          ) {
            releases.push({
              id: `${watchedItem.id}-s${episode.season_number}e${episode.episode_number}`,
              title: watchedItem.title,
              mediaType: 'TV' as const,
              date: airDate,
              poster: watchedItem.poster,
              tmdbId: watchedItem.tmdbId,
              seasonNumber: episode.season_number,
              episodeNumber: episode.episode_number,
              episodeName: episode.name,
              watchedItemId: watchedItem.id,
            })
          }

          // Limit the number of future episodes per show
          if (releases.length >= 3) {
            break
          }
        }

        // Reset episode counter for next season
        checkingEpisode = 1
      } catch (seasonError) {
        console.warn(
          `Failed to fetch season ${season.season_number} for show ${watchedItem.title}:`,
          seasonError
        )
        // Continue with next season
      }

      // Break if we have enough releases for this show
      if (releases.length >= 3) {
        break
      }
    }
  } catch (error) {
    console.error(
      `Failed to fetch fallback episodes for ${watchedItem.title}:`,
      error
    )
  }

  return releases
}
