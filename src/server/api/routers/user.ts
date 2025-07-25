import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { createError, toTRPCError } from '@/lib/errors'

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

  // Get public profile by username
  getProfile: publicProcedure
    .input(z.object({ 
      username: z.string().min(1).max(50),
      includeSpoilers: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const user = await ctx.db.user.findUnique({
          where: { username: input.username },
          select: { id: true, clerkId: true, username: true, name: true, avatar: true, isPublic: true, createdAt: true },
        })

        if (!user) {
          throw toTRPCError(createError.notFound('User', input.username))
        }

        // Check if profile is public or if it's the user's own profile
        const isOwnProfile = ctx.session?.userId === user.clerkId
        if (!user.isPublic && !isOwnProfile) {
          throw toTRPCError(createError.forbidden('This profile is private'))
        }

        // Get user data with profile and watched items
        const fullUser = await ctx.db.user.findUnique({
          where: { id: user.id },
          include: {
            profiles: true,
            watchedItems: {
              where: {
                // Only show completed items for public profiles unless it's the user's own profile
                ...(isOwnProfile ? {} : { status: 'COMPLETED' }),
              },
              take: 20,
              orderBy: { updatedAt: 'desc' },
              include: {
                notes: {
                  where: {
                    isPublic: true,
                    // Filter spoilers based on user preference
                    ...(input.includeSpoilers ? {} : { hasSpoilers: false }),
                  },
                  take: 3,
                  orderBy: { createdAt: 'desc' },
                  select: {
                    id: true,
                    content: true,
                    timestamp: true,
                    hasSpoilers: true,
                    createdAt: true,
                  },
                },
                _count: {
                  select: { notes: true },
                },
              },
            },
            _count: {
              select: {
                watchedItems: true,
                notes: true,
              },
            },
          },
        })

        if (!fullUser) {
          throw toTRPCError(createError.notFound('User', input.username))
        }

        // Get additional stats for public display
        const stats = await Promise.all([
          ctx.db.watchedItem.count({
            where: { userId: user.id, status: 'COMPLETED' },
          }),
          ctx.db.watchedItem.count({
            where: { userId: user.id, status: 'WATCHING' },
          }),
          ctx.db.watchedItem.count({
            where: { userId: user.id, mediaType: 'MOVIE', status: 'COMPLETED' },
          }),
          ctx.db.watchedItem.count({
            where: { userId: user.id, mediaType: 'TV', status: 'COMPLETED' },
          }),
          ctx.db.watchedItem.count({
            where: { userId: user.id },
          }),
          ctx.db.note.count({
            where: { userId: user.id },
          }),
        ])

        return {
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            avatar: user.avatar,
            isPublic: user.isPublic,
            createdAt: user.createdAt,
          },
          profile: fullUser.profiles[0] || null,
          stats: {
            totalItems: stats[4],
            completedItems: stats[0],
            currentlyWatching: stats[1],
            completedMovies: stats[2],
            completedTVShows: stats[3],
            totalNotes: stats[5],
          },
          recentActivity: fullUser.watchedItems,
          isOwnProfile,
        }
      } catch (error) {
        throw toTRPCError(error)
      }
    }),

  // Get user's public watchlist (paginated)
  getPublicWatchlist: publicProcedure
    .input(z.object({
      username: z.string().min(1).max(50),
      status: z.enum(['COMPLETED', 'WATCHING', 'PLANNED', 'PAUSED', 'DROPPED']).optional(),
      mediaType: z.enum(['MOVIE', 'TV']).optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const user = await ctx.db.user.findUnique({
          where: { username: input.username },
          select: { id: true, isPublic: true, clerkId: true },
        })

        if (!user) {
          throw toTRPCError(createError.notFound('User', input.username))
        }

        const isOwnProfile = ctx.session?.userId === user.clerkId
        if (!user.isPublic && !isOwnProfile) {
          throw toTRPCError(createError.forbidden('This profile is private'))
        }

        const whereClause: any = { userId: user.id }
        if (input.status) whereClause.status = input.status
        if (input.mediaType) whereClause.mediaType = input.mediaType

        const [items, totalCount] = await Promise.all([
          ctx.db.watchedItem.findMany({
            where: whereClause,
            include: {
              notes: {
                where: { isPublic: true },
                take: 2,
                orderBy: { createdAt: 'desc' },
                select: {
                  id: true,
                  content: true,
                  timestamp: true,
                  hasSpoilers: true,
                  createdAt: true,
                },
              },
              _count: {
                select: { notes: true },
              },
            },
            orderBy: { updatedAt: 'desc' },
            skip: (input.page - 1) * input.limit,
            take: input.limit,
          }),
          ctx.db.watchedItem.count({ where: whereClause }),
        ])

        return {
          items,
          pagination: {
            page: input.page,
            limit: input.limit,
            totalCount,
            totalPages: Math.ceil(totalCount / input.limit),
            hasNextPage: input.page * input.limit < totalCount,
            hasPreviousPage: input.page > 1,
          },
        }
      } catch (error) {
        throw toTRPCError(error)
      }
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