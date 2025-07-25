import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

export const noteRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      watchedItemId: z.string(),
      content: z.string().min(1),
      timestamp: z.string().optional(),
      isPublic: z.boolean().default(false),
      hasSpoilers: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify the watched item belongs to the user
      const watchedItem = await ctx.db.watchedItem.findFirst({
        where: {
          id: input.watchedItemId,
          userId: ctx.user.id,
        },
      })

      if (!watchedItem) {
        throw new Error('Watched item not found')
      }

      return ctx.db.note.create({
        data: {
          userId: ctx.user.id,
          ...input,
        },
      })
    }),

  getByWatchedItem: protectedProcedure
    .input(z.object({
      watchedItemId: z.string(),
      limit: z.number().min(1).max(100).default(50),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const notes = await ctx.db.note.findMany({
        where: {
          watchedItemId: input.watchedItemId,
          userId: ctx.user.id,
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit + 1,
        ...(input.cursor && {
          cursor: { id: input.cursor },
          skip: 1,
        }),
      })

      let nextCursor: typeof input.cursor | undefined = undefined
      if (notes.length > input.limit) {
        const nextItem = notes.pop()
        nextCursor = nextItem!.id
      }

      return {
        notes,
        nextCursor,
      }
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      content: z.string().min(1).optional(),
      timestamp: z.string().optional(),
      isPublic: z.boolean().optional(),
      hasSpoilers: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      return ctx.db.note.update({
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
      return ctx.db.note.delete({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
      })
    }),
})