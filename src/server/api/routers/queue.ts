import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { tmdb } from '@/lib/tmdb'

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
        episodeName: z.string().nullable().optional(),
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

      // Fetch episode name from TMDB if this is a TV episode
      let episodeName = input.episodeName
      if (
        input.contentType === 'TV' &&
        input.seasonNumber &&
        input.episodeNumber &&
        !episodeName
      ) {
        try {
          const episodeData = await tmdb.tvEpisode.details({
            tvShowID: input.tmdbId,
            seasonNumber: input.seasonNumber,
            episodeNumber: input.episodeNumber,
          })
          episodeName = episodeData.name
        } catch (error) {
          // If TMDB fetch fails, continue without episode name
          console.warn('Failed to fetch episode name from TMDB:', error)
        }
      }

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
          episodeName: episodeName,
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
      await ctx.db.$transaction(async tx => {
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

      // Use a transaction to update watched status, sync with WatchedItem, and reorder remaining items
      await ctx.db.$transaction(async tx => {
        // Mark the queue item as watched
        await tx.queueItem.update({
          where: { id: input.id },
          data: {
            watched: true,
          },
        })

        // Find or create the corresponding WatchedItem
        let watchedItem = await tx.watchedItem.findFirst({
          where: {
            userId: ctx.user.id,
            tmdbId: queueItem.tmdbId,
            mediaType: queueItem.contentType,
          },
          include: {
            watchedEpisodes: true,
          },
        })

        // If WatchedItem doesn't exist, create it
        if (!watchedItem) {
          watchedItem = await tx.watchedItem.create({
            data: {
              userId: ctx.user.id,
              tmdbId: queueItem.tmdbId,
              mediaType: queueItem.contentType,
              title: queueItem.title,
              poster: queueItem.poster,
              releaseDate: queueItem.releaseDate,
              status: 'WATCHING',
              startDate: new Date(),
            },
            include: {
              watchedEpisodes: true,
            },
          })
        }

        // Handle TV show episode progress
        if (
          queueItem.contentType === 'TV' &&
          queueItem.seasonNumber &&
          queueItem.episodeNumber
        ) {
          // Mark the specific episode as watched
          await tx.watchedEpisode.upsert({
            where: {
              watchedItemId_seasonNumber_episodeNumber: {
                watchedItemId: watchedItem.id,
                seasonNumber: queueItem.seasonNumber,
                episodeNumber: queueItem.episodeNumber,
              },
            },
            update: {
              status: 'WATCHED',
              watchedAt: new Date(),
            },
            create: {
              watchedItemId: watchedItem.id,
              seasonNumber: queueItem.seasonNumber,
              episodeNumber: queueItem.episodeNumber,
              status: 'WATCHED',
              watchedAt: new Date(),
            },
          })

          // Update the watched item's current progress
          await tx.watchedItem.update({
            where: { id: watchedItem.id },
            data: {
              currentSeason: queueItem.seasonNumber,
              currentEpisode: queueItem.episodeNumber,
              status: 'WATCHING', // Keep as watching unless it's the final episode
            },
          })
        }
        // Handle movie completion
        else if (queueItem.contentType === 'MOVIE') {
          await tx.watchedItem.update({
            where: { id: watchedItem.id },
            data: {
              status: 'COMPLETED',
              finishDate: new Date(),
              // Set runtime progress to 100% if totalRuntime is known
              ...(watchedItem.totalRuntime && {
                currentRuntime: watchedItem.totalRuntime,
              }),
            },
          })
        }

        // Reorder remaining items to fill the gap
        await tx.queueItem.updateMany({
          where: {
            userId: ctx.user.id,
            watched: false, // Only reorder unwatched items
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
      })

      return { success: true }
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

  // Clear entire active queue (unwatched items only)
  clearQueue: protectedProcedure.mutation(async ({ ctx }) => {
    const deletedItems = await ctx.db.queueItem.deleteMany({
      where: {
        userId: ctx.user.id,
        watched: false,
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

      if (
        nextEpisode > maxEpisodesPerSeason &&
        input.totalSeasons &&
        nextSeason < input.totalSeasons
      ) {
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

  // Bulk operations
  bulkMarkAsWatched: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      if (input.ids.length === 0) {
        return { updatedCount: 0 }
      }

      // Verify all items belong to the user
      const queueItems = await ctx.db.queueItem.findMany({
        where: {
          id: { in: input.ids },
          userId: ctx.user.id,
        },
      })

      if (queueItems.length !== input.ids.length) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Some items do not belong to the user',
        })
      }

      // Use transaction to mark items as watched, sync with WatchedItems, and reorder remaining items
      await ctx.db.$transaction(async tx => {
        // Mark selected queue items as watched
        await tx.queueItem.updateMany({
          where: {
            id: { in: input.ids },
            userId: ctx.user.id,
          },
          data: {
            watched: true,
          },
        })

        // Process each queue item to sync with WatchedItem
        for (const queueItem of queueItems) {
          // Find or create the corresponding WatchedItem
          let watchedItem = await tx.watchedItem.findFirst({
            where: {
              userId: ctx.user.id,
              tmdbId: queueItem.tmdbId,
              mediaType: queueItem.contentType,
            },
            include: {
              watchedEpisodes: true,
            },
          })

          // If WatchedItem doesn't exist, create it
          if (!watchedItem) {
            watchedItem = await tx.watchedItem.create({
              data: {
                userId: ctx.user.id,
                tmdbId: queueItem.tmdbId,
                mediaType: queueItem.contentType,
                title: queueItem.title,
                poster: queueItem.poster,
                releaseDate: queueItem.releaseDate,
                status: 'WATCHING',
                startDate: new Date(),
              },
              include: {
                watchedEpisodes: true,
              },
            })
          }

          // Handle TV show episode progress
          if (
            queueItem.contentType === 'TV' &&
            queueItem.seasonNumber &&
            queueItem.episodeNumber
          ) {
            // Mark the specific episode as watched
            await tx.watchedEpisode.upsert({
              where: {
                watchedItemId_seasonNumber_episodeNumber: {
                  watchedItemId: watchedItem.id,
                  seasonNumber: queueItem.seasonNumber,
                  episodeNumber: queueItem.episodeNumber,
                },
              },
              update: {
                status: 'WATCHED',
                watchedAt: new Date(),
              },
              create: {
                watchedItemId: watchedItem.id,
                seasonNumber: queueItem.seasonNumber,
                episodeNumber: queueItem.episodeNumber,
                status: 'WATCHED',
                watchedAt: new Date(),
              },
            })

            // Update the watched item's current progress
            await tx.watchedItem.update({
              where: { id: watchedItem.id },
              data: {
                currentSeason: queueItem.seasonNumber,
                currentEpisode: queueItem.episodeNumber,
                status: 'WATCHING',
              },
            })
          }
          // Handle movie completion
          else if (queueItem.contentType === 'MOVIE') {
            await tx.watchedItem.update({
              where: { id: watchedItem.id },
              data: {
                status: 'COMPLETED',
                finishDate: new Date(),
                // Set runtime progress to 100% if totalRuntime is known
                ...(watchedItem.totalRuntime && {
                  currentRuntime: watchedItem.totalRuntime,
                }),
              },
            })
          }
        }

        // Get the minimum position of watched items for reordering
        const minPosition = Math.min(...queueItems.map(item => item.position))

        // Reorder remaining unwatched items to fill gaps
        await tx.queueItem.updateMany({
          where: {
            userId: ctx.user.id,
            watched: false,
            position: { gt: minPosition },
          },
          data: {
            position: {
              decrement: input.ids.length,
            },
          },
        })
      })

      return { updatedCount: input.ids.length }
    }),

  bulkRemoveFromQueue: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      if (input.ids.length === 0) {
        return { deletedCount: 0 }
      }

      // Verify all items belong to the user and get their positions
      const queueItems = await ctx.db.queueItem.findMany({
        where: {
          id: { in: input.ids },
          userId: ctx.user.id,
        },
        select: { id: true, position: true },
      })

      if (queueItems.length !== input.ids.length) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Some items do not belong to the user',
        })
      }

      const minPosition = Math.min(...queueItems.map(item => item.position))

      // Use transaction to delete items and reorder remaining ones
      await ctx.db.$transaction(async tx => {
        // Delete the selected items
        await tx.queueItem.deleteMany({
          where: {
            id: { in: input.ids },
            userId: ctx.user.id,
          },
        })

        // Reorder remaining items to fill gaps
        await tx.queueItem.updateMany({
          where: {
            userId: ctx.user.id,
            position: { gt: minPosition },
          },
          data: {
            position: {
              decrement: input.ids.length,
            },
          },
        })
      })

      return { deletedCount: input.ids.length }
    }),

  bulkMoveToTop: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      if (input.ids.length === 0) {
        return { updatedCount: 0 }
      }

      // Verify all items belong to the user
      const queueItems = await ctx.db.queueItem.findMany({
        where: {
          id: { in: input.ids },
          userId: ctx.user.id,
          watched: false, // Only move unwatched items
        },
        orderBy: { position: 'asc' },
      })

      if (queueItems.length === 0) {
        return { updatedCount: 0 }
      }

      await ctx.db.$transaction(async tx => {
        // Shift all other unwatched items down
        await tx.queueItem.updateMany({
          where: {
            userId: ctx.user.id,
            watched: false,
            id: { notIn: input.ids },
          },
          data: {
            position: {
              increment: queueItems.length,
            },
          },
        })

        // Move selected items to top positions
        for (let i = 0; i < queueItems.length; i++) {
          await tx.queueItem.update({
            where: { id: queueItems[i]!.id },
            data: { position: i + 1 },
          })
        }
      })

      return { updatedCount: queueItems.length }
    }),

  bulkMoveToBottom: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      if (input.ids.length === 0) {
        return { updatedCount: 0 }
      }

      // Verify all items belong to the user
      const queueItems = await ctx.db.queueItem.findMany({
        where: {
          id: { in: input.ids },
          userId: ctx.user.id,
          watched: false, // Only move unwatched items
        },
        orderBy: { position: 'asc' },
      })

      if (queueItems.length === 0) {
        return { updatedCount: 0 }
      }

      // Get the maximum position among unwatched items
      const maxPositionResult = await ctx.db.queueItem.findFirst({
        where: {
          userId: ctx.user.id,
          watched: false,
        },
        orderBy: { position: 'desc' },
      })

      const maxPosition = maxPositionResult?.position ?? 0

      await ctx.db.$transaction(async tx => {
        // Move selected items to bottom positions
        for (let i = 0; i < queueItems.length; i++) {
          await tx.queueItem.update({
            where: { id: queueItems[i]!.id },
            data: { position: maxPosition + i + 1 },
          })
        }

        // Shift other items up to fill gaps
        const positionsToFill = queueItems.map(item => item.position)
        const minPosition = Math.min(...positionsToFill)

        await tx.queueItem.updateMany({
          where: {
            userId: ctx.user.id,
            watched: false,
            id: { notIn: input.ids },
            position: { gt: minPosition },
          },
          data: {
            position: {
              decrement: queueItems.length,
            },
          },
        })
      })

      return { updatedCount: queueItems.length }
    }),
})
