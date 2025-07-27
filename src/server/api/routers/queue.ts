import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { TRPCError } from '@trpc/server'

export const queueRouter = createTRPCRouter({
  // Get user's queue
  getQueue: protectedProcedure.query(async ({ ctx }) => {
    const queue = await ctx.db.queueItem.findMany({
      where: {
        userId: ctx.user.id,
      },
      orderBy: {
        position: 'asc',
      },
    })

    return queue
  }),

  // Add item to queue
  addToQueue: protectedProcedure
    .input(
      z.object({
        contentId: z.string(),
        contentType: z.enum(['MOVIE', 'TV']),
        title: z.string(),
        poster: z.string().nullable().optional(),
        releaseDate: z.date().nullable().optional(),
        tmdbId: z.number(),
        seasonNumber: z.number().nullable().optional(),
        episodeNumber: z.number().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if item already exists in queue
      const existingItem = await ctx.db.queueItem.findFirst({
        where: {
          userId: ctx.user.id,
          contentId: input.contentId,
          seasonNumber: input.seasonNumber || null,
          episodeNumber: input.episodeNumber || null,
        },
      })

      if (existingItem) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Item already exists in queue',
        })
      }

      // Get the next position
      const lastItem = await ctx.db.queueItem.findFirst({
        where: {
          userId: ctx.user.id,
        },
        orderBy: {
          position: 'desc',
        },
      })

      const nextPosition = lastItem ? lastItem.position + 1 : 1

      // Create the queue item
      const queueItem = await ctx.db.queueItem.create({
        data: {
          userId: ctx.user.id,
          contentId: input.contentId,
          contentType: input.contentType,
          title: input.title,
          poster: input.poster,
          releaseDate: input.releaseDate,
          tmdbId: input.tmdbId,
          seasonNumber: input.seasonNumber,
          episodeNumber: input.episodeNumber,
          position: nextPosition,
        },
      })

      return queueItem
    }),

  // Remove item from queue
  removeFromQueue: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const queueItem = await ctx.db.queueItem.findUnique({
        where: { id: input.id },
      })

      if (!queueItem) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Queue item not found',
        })
      }

      if (queueItem.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to remove this queue item',
        })
      }

      // Remove the item
      await ctx.db.queueItem.delete({
        where: { id: input.id },
      })

      // Reorder remaining items to fill the gap
      await ctx.db.queueItem.updateMany({
        where: {
          userId: ctx.user.id,
          position: {
            gt: queueItem.position,
          },
        },
        data: {
          position: {
            decrement: 1,
          },
        },
      })

      return { success: true }
    }),

  // Reorder queue items
  reorderQueue: protectedProcedure
    .input(
      z.object({
        itemId: z.string(),
        newPosition: z.number().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const queueItem = await ctx.db.queueItem.findUnique({
        where: { id: input.itemId },
      })

      if (!queueItem) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Queue item not found',
        })
      }

      if (queueItem.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to reorder this queue item',
        })
      }

      const currentPosition = queueItem.position
      const newPosition = input.newPosition

      if (currentPosition === newPosition) {
        return queueItem // No change needed
      }

      // Use a transaction to ensure consistency
      await ctx.db.$transaction(async (tx) => {
        if (newPosition > currentPosition) {
          // Moving down: shift items up
          await tx.queueItem.updateMany({
            where: {
              userId: ctx.user.id,
              position: {
                gt: currentPosition,
                lte: newPosition,
              },
            },
            data: {
              position: {
                decrement: 1,
              },
            },
          })
        } else {
          // Moving up: shift items down
          await tx.queueItem.updateMany({
            where: {
              userId: ctx.user.id,
              position: {
                gte: newPosition,
                lt: currentPosition,
              },
            },
            data: {
              position: {
                increment: 1,
              },
            },
          })
        }

        // Update the moved item
        await tx.queueItem.update({
          where: { id: input.itemId },
          data: {
            position: newPosition,
          },
        })
      })

      return { success: true }
    }),

  // Mark item as watched
  markAsWatched: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const queueItem = await ctx.db.queueItem.findUnique({
        where: { id: input.id },
      })

      if (!queueItem) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Queue item not found',
        })
      }

      if (queueItem.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to update this queue item',
        })
      }

      const updatedItem = await ctx.db.queueItem.update({
        where: { id: input.id },
        data: {
          watched: true,
        },
      })

      return updatedItem
    }),

  // Get watched queue items (history)
  getWatchHistory: protectedProcedure.query(async ({ ctx }) => {
    const watchedItems = await ctx.db.queueItem.findMany({
      where: {
        userId: ctx.user.id,
        watched: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return watchedItems
  }),

  // Clear watched items from queue
  clearWatchedItems: protectedProcedure.mutation(async ({ ctx }) => {
    const deletedItems = await ctx.db.queueItem.deleteMany({
      where: {
        userId: ctx.user.id,
        watched: true,
      },
    })

    return { deletedCount: deletedItems.count }
  }),

  // Add next episode to queue (for TV shows)
  addNextEpisode: protectedProcedure
    .input(
      z.object({
        contentId: z.string(),
        title: z.string(),
        poster: z.string().nullable().optional(),
        tmdbId: z.number(),
        currentSeason: z.number(),
        currentEpisode: z.number(),
        totalSeasons: z.number().nullable().optional(),
        totalEpisodes: z.number().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Calculate next episode
      let nextSeason = input.currentSeason
      let nextEpisode = input.currentEpisode + 1

      // For now, we'll assume episodes go up to 50 per season
      // In a real app, you'd fetch this from TMDB API
      const maxEpisodesPerSeason = 50

      if (nextEpisode > maxEpisodesPerSeason && input.totalSeasons && nextSeason < input.totalSeasons) {
        nextSeason += 1
        nextEpisode = 1
      }

      // Check if next episode already exists in queue
      const existingItem = await ctx.db.queueItem.findFirst({
        where: {
          userId: ctx.user.id,
          contentId: input.contentId,
          seasonNumber: nextSeason,
          episodeNumber: nextEpisode,
        },
      })

      if (existingItem) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Next episode already in queue',
        })
      }

      // Get the next position
      const lastItem = await ctx.db.queueItem.findFirst({
        where: {
          userId: ctx.user.id,
        },
        orderBy: {
          position: 'desc',
        },
      })

      const nextPosition = lastItem ? lastItem.position + 1 : 1

      // Create the queue item for next episode
      const queueItem = await ctx.db.queueItem.create({
        data: {
          userId: ctx.user.id,
          contentId: input.contentId,
          contentType: 'TV',
          title: `${input.title} - S${nextSeason.toString().padStart(2, '0')}E${nextEpisode.toString().padStart(2, '0')}`,
          poster: input.poster,
          tmdbId: input.tmdbId,
          seasonNumber: nextSeason,
          episodeNumber: nextEpisode,
          position: nextPosition,
        },
      })

      return queueItem
    }),
})