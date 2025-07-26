import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

const MediaTypeEnum = z.enum(['MOVIE', 'TV'])
const WatchStatusEnum = z.enum(['PLANNED', 'WATCHING', 'COMPLETED', 'PAUSED', 'DROPPED'])

export const watchedItemRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      tmdbId: z.number(),
      mediaType: MediaTypeEnum,
      title: z.string(),
      poster: z.string().optional(),
      releaseDate: z.date().optional(),
      totalSeasons: z.number().optional(),
      totalEpisodes: z.number().optional(),
      totalRuntime: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.watchedItem.create({
        data: {
          userId: ctx.user.id,
          ...input,
        },
      })
    }),

  getAll: protectedProcedure
    .input(z.object({
      status: WatchStatusEnum.optional(),
      mediaType: MediaTypeEnum.optional(),
      limit: z.number().min(1).max(100).default(50),
      cursor: z.string().optional(),
    }))
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
        },
      })
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: WatchStatusEnum.optional(),
      rating: z.number().min(1).max(10).nullable().optional(),
      currentSeason: z.number().nullable().optional(),
      currentEpisode: z.number().nullable().optional(),
      currentRuntime: z.number().nullable().optional(),
      startDate: z.date().nullable().optional(),
      finishDate: z.date().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      return ctx.db.watchedItem.update({
        where: {
          id,
          userId: ctx.user.id,
        },
        data: updateData,
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