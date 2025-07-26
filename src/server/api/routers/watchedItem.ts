import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

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
})
