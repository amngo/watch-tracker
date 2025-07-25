import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'

export const userRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      username: z.string().min(1),
      email: z.string().email(),
      name: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.create({
        data: {
          clerkId: ctx.session.userId,
          username: input.username,
          email: input.email,
          name: input.name,
        },
      })
    }),

  getProfile: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { username: input.username },
        include: {
          profiles: true,
          watchedItems: {
            take: 10,
            orderBy: { updatedAt: 'desc' },
          },
          _count: {
            select: {
              watchedItems: true,
              notes: true,
            },
          },
        },
      })

      if (!user || (!user.isPublic && ctx.session?.userId !== user.clerkId)) {
        throw new Error('Profile not found or private')
      }

      return user
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      isPublic: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { clerkId: ctx.session.userId },
        data: input,
      })
    }),

  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkId: ctx.session.userId },
        include: {
          _count: {
            select: {
              watchedItems: true,
              notes: true,
            },
          },
        },
      })

      if (!user) {
        throw new Error('User not found')
      }

      const completedCount = await ctx.db.watchedItem.count({
        where: {
          userId: user.id,
          status: 'COMPLETED',
        },
      })

      const currentlyWatching = await ctx.db.watchedItem.count({
        where: {
          userId: user.id,
          status: 'WATCHING',
        },
      })

      return {
        totalItems: user._count.watchedItems,
        completedItems: completedCount,
        currentlyWatching,
        totalNotes: user._count.notes,
      }
    }),
})