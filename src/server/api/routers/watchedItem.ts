import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { tmdbService } from '@/lib/tmdb'

const MediaTypeEnum = z.enum(['MOVIE', 'TV'])
const WatchStatusEnum = z.enum([
  'PLANNED',
  'WATCHING',
  'COMPLETED',
  'PAUSED',
  'DROPPED',
])

export const watchedItemRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        tmdbId: z.number(),
        mediaType: MediaTypeEnum,
        title: z.string(),
        poster: z.string().optional(),
        releaseDate: z.date().optional(),
        totalSeasons: z.number().optional(),
        totalEpisodes: z.number().optional(),
        totalRuntime: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.watchedItem.create({
        data: {
          userId: ctx.user.id,
          ...input,
        },
      })
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        status: WatchStatusEnum.optional(),
        mediaType: MediaTypeEnum.optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.watchedItem.findMany({
        where: {
          userId: ctx.user.id,
          ...(input.status && { status: input.status }),
          ...(input.mediaType && { mediaType: input.mediaType }),
        },
        include: {
          notes: {
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
          watchedEpisodes: {
            orderBy: { episodeNumber: 'asc' },
          },
          _count: {
            select: { notes: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: input.limit + 1,
        ...(input.cursor && {
          cursor: { id: input.cursor },
          skip: 1,
        }),
      })

      let nextCursor: typeof input.cursor | undefined = undefined
      if (items.length > input.limit) {
        const nextItem = items.pop()
        nextCursor = nextItem!.id
      }

      return {
        items,
        nextCursor,
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.watchedItem.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        include: {
          notes: {
            orderBy: { createdAt: 'desc' },
          },
          watchedEpisodes: {
            orderBy: { episodeNumber: 'asc' },
          },
        },
      })
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: WatchStatusEnum.optional(),
        rating: z.number().min(1).max(10).nullable().optional(),
        currentSeason: z.number().nullable().optional(),
        currentEpisode: z.number().nullable().optional(),
        currentRuntime: z.number().nullable().optional(),
        startDate: z.date().nullable().optional(),
        finishDate: z.date().nullable().optional(),
        watchedEpisodes: z
          .array(
            z.object({
              id: z.string().optional(),
              seasonNumber: z.number(),
              episodeNumber: z.number(),
              status: z.enum(['UNWATCHED', 'WATCHED', 'SKIPPED']),
              watchedAt: z.date().nullable(),
              watchedItemId: z.string(),
              createdAt: z.date(),
              updatedAt: z.date(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, watchedEpisodes, ...updateData } = input

      // Handle watched episodes update if provided
      if (watchedEpisodes) {
        // First, delete all existing watched episodes for this item
        await ctx.db.watchedEpisode.deleteMany({
          where: {
            watchedItemId: id,
          },
        })

        // Then create the new watched episodes
        if (watchedEpisodes.length > 0) {
          await ctx.db.watchedEpisode.createMany({
            data: watchedEpisodes.map(episode => ({
              seasonNumber: episode.seasonNumber,
              episodeNumber: episode.episodeNumber,
              status: episode.status,
              watchedAt: episode.watchedAt,
              watchedItemId: id,
            })),
          })
        }
      }

      return ctx.db.watchedItem.update({
        where: {
          id,
          userId: ctx.user.id,
        },
        data: updateData,
        include: {
          notes: {
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
          watchedEpisodes: {
            orderBy: { episodeNumber: 'asc' },
          },
          _count: {
            select: { notes: true },
          },
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.watchedItem.delete({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
      })
    }),

  // New endpoint to fetch and update TV show details for existing items
  updateTVShowDetails: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // First, get the watched item to ensure it exists and belongs to user
      const watchedItem = await ctx.db.watchedItem.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
          mediaType: 'TV', // Only works for TV shows
        },
      })

      if (!watchedItem) {
        throw new Error('TV show not found or does not belong to user')
      }

      try {
        // Fetch detailed information from TMDB
        const tvDetails = await tmdbService.getTVDetailsExtended(watchedItem.tmdbId)
        
        // Update the watched item with season and episode counts
        return ctx.db.watchedItem.update({
          where: {
            id: input.id,
            userId: ctx.user.id,
          },
          data: {
            totalSeasons: tvDetails.number_of_seasons || null,
            totalEpisodes: tvDetails.number_of_episodes || null,
          },
          include: {
            notes: {
              orderBy: { createdAt: 'desc' },
              take: 3,
            },
            watchedEpisodes: {
              orderBy: { episodeNumber: 'asc' },
            },
            _count: {
              select: { notes: true },
            },
          },
        })
      } catch (error) {
        throw new Error('Failed to fetch TV show details from TMDB')
      }
    }),

  // Bulk update TV show details for all user's TV shows
  updateAllTVShowDetails: protectedProcedure
    .input(
      z.object({
        forceUpdate: z.boolean().default(false), // Force update even if data exists
        onlyMissingData: z.boolean().default(true), // Only update items with missing data
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Build query based on input parameters
      const where: any = {
        userId: ctx.user.id,
        mediaType: 'TV',
      }

      if (input.onlyMissingData && !input.forceUpdate) {
        where.OR = [
          { totalSeasons: null },
          { totalEpisodes: null },
        ]
      }

      // Get all TV shows for the user based on criteria
      const tvShows = await ctx.db.watchedItem.findMany({ where })

      // Process updates in batches to avoid overwhelming TMDB API
      const batchSize = 5
      let successfulUpdates = 0
      let failedUpdates = 0
      const errors: string[] = []

      for (let i = 0; i < tvShows.length; i += batchSize) {
        const batch = tvShows.slice(i, i + batchSize)
        
        const batchPromises = batch.map(async (tvShow) => {
          try {
            const tvDetails = await tmdbService.getTVDetailsExtended(tvShow.tmdbId)
            
            // Calculate total runtime if not present
            let totalRuntime = tvShow.totalRuntime
            if (!totalRuntime && tvDetails.episode_run_time && tvDetails.episode_run_time.length > 0 && tvDetails.number_of_episodes) {
              const avgEpisodeRuntime = tvDetails.episode_run_time.reduce((a, b) => a + b, 0) / tvDetails.episode_run_time.length
              totalRuntime = Math.round(avgEpisodeRuntime * tvDetails.number_of_episodes)
            }
            
            const updatedItem = await ctx.db.watchedItem.update({
              where: { id: tvShow.id },
              data: {
                totalSeasons: tvDetails.number_of_seasons || null,
                totalEpisodes: tvDetails.number_of_episodes || null,
                totalRuntime: totalRuntime || null,
              },
            })
            
            successfulUpdates++
            return updatedItem
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            console.error(`Failed to update TV show ${tvShow.id} (${tvShow.title}):`, errorMessage)
            errors.push(`${tvShow.title}: ${errorMessage}`)
            failedUpdates++
            return null
          }
        })

        // Wait for current batch to complete before starting next
        await Promise.allSettled(batchPromises)
        
        // Add small delay between batches to respect TMDB rate limits
        if (i + batchSize < tvShows.length) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      return {
        totalProcessed: tvShows.length,
        successfulUpdates,
        failedUpdates,
        errors: errors.slice(0, 10), // Return first 10 errors to avoid overwhelming response
      }
    }),
})
