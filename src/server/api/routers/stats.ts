import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { createError, toTRPCError } from '@/lib/errors'

const TimeRangeSchema = z.enum(['week', 'month', 'quarter', 'year', 'all']).default('month')

export const statsRouter = createTRPCRouter({
  // Get navigation badge counts
  navigationCounts: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { clerkId: ctx.session.userId },
    })

    if (!user) {
      throw toTRPCError(createError.userNotFound(ctx.session.userId))
    }

    const [
      queueCount,
      libraryCount,
      notesCount,
    ] = await Promise.all([
      // Active queue items (not watched)
      ctx.db.queueItem.count({ 
        where: { 
          userId: user.id,
          watched: false,
        } 
      }),
      // Total library count (movies + TV shows)
      ctx.db.watchedItem.count({ 
        where: { 
          userId: user.id,
        } 
      }),
      // Total notes count
      ctx.db.note.count({ 
        where: { 
          userId: user.id,
        } 
      }),
    ])

    return {
      queue: queueCount,
      library: libraryCount,
      notes: notesCount,
    }
  }),

  // Get user's overall statistics
  overview: protectedProcedure
    .input(z.object({
      timeRange: TimeRangeSchema,
    }))
    .query(async ({ ctx, input }) => {
      try {
        const user = await ctx.db.user.findUnique({
          where: { clerkId: ctx.session.userId },
        })

        if (!user) {
          throw toTRPCError(createError.userNotFound(ctx.session.userId))
        }

        // Calculate date range for filtering
        const now = new Date()
        let startDate: Date | undefined

        switch (input.timeRange) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3)
            startDate = new Date(now.getFullYear(), quarter * 3, 1)
            break
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1)
            break
          case 'all':
          default:
            startDate = undefined
        }

        const whereClause = {
          userId: user.id,
          ...(startDate && { updatedAt: { gte: startDate } }),
        }

        // Get basic counts
        const [
          totalItems,
          completedItems,
          currentlyWatching,
          plannedItems,
          pausedItems,
          droppedItems,
          totalNotes,
          moviesCount,
          tvShowsCount,
        ] = await Promise.all([
          ctx.db.watchedItem.count({ where: whereClause }),
          ctx.db.watchedItem.count({ where: { ...whereClause, status: 'COMPLETED' } }),
          ctx.db.watchedItem.count({ where: { ...whereClause, status: 'WATCHING' } }),
          ctx.db.watchedItem.count({ where: { ...whereClause, status: 'PLANNED' } }),
          ctx.db.watchedItem.count({ where: { ...whereClause, status: 'PAUSED' } }),
          ctx.db.watchedItem.count({ where: { ...whereClause, status: 'DROPPED' } }),
          ctx.db.note.count({ 
            where: { 
              userId: user.id,
              ...(startDate && { createdAt: { gte: startDate } }),
            } 
          }),
          ctx.db.watchedItem.count({ where: { ...whereClause, mediaType: 'MOVIE' } }),
          ctx.db.watchedItem.count({ where: { ...whereClause, mediaType: 'TV' } }),
        ])

        // Calculate completion rate
        const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

        // Get average rating
        const ratingResult = await ctx.db.watchedItem.aggregate({
          where: { ...whereClause, rating: { not: null } },
          _avg: { rating: true },
          _count: { rating: true },
        })

        // Calculate estimated watch time
        const completedItemsWithRuntime = await ctx.db.watchedItem.findMany({
          where: { ...whereClause, status: 'COMPLETED' },
          select: {
            mediaType: true,
            totalRuntime: true,
            currentRuntime: true,
            totalEpisodes: true,
            currentEpisode: true,
          },
        })

        let totalWatchTimeMinutes = 0
        completedItemsWithRuntime.forEach(item => {
          if (item.currentRuntime && item.currentRuntime > 0) {
            // Use actual current runtime if available
            totalWatchTimeMinutes += item.currentRuntime
          } else if (item.totalRuntime && item.totalRuntime > 0) {
            // Use total runtime for completed items
            totalWatchTimeMinutes += item.totalRuntime
          } else {
            // Fallback to estimates
            if (item.mediaType === 'MOVIE') {
              totalWatchTimeMinutes += 120 // 2 hours average
            } else {
              // TV Show estimate: episodes watched * average episode length
              const episodesWatched = item.currentEpisode || item.totalEpisodes || 24
              totalWatchTimeMinutes += episodesWatched * 45 // 45 min per episode
            }
          }
        })

        const totalWatchTimeHours = Math.round((totalWatchTimeMinutes / 60) * 10) / 10

        // Get episodes watched this period for TV shows
        const episodesWatchedCount = await ctx.db.watchedEpisode.count({
          where: {
            watchedItem: { userId: user.id },
            status: 'WATCHED',
            ...(startDate && { watchedAt: { gte: startDate } }),
          },
        })

        return {
          timeRange: input.timeRange,
          overview: {
            totalItems,
            completedItems,
            currentlyWatching,
            plannedItems,
            pausedItems,
            droppedItems,
            completionRate: Math.round(completionRate * 100) / 100,
          },
          content: {
            movies: moviesCount,
            tvShows: tvShowsCount,
          },
          engagement: {
            totalNotes,
            averageRating: ratingResult._avg.rating ? Math.round(ratingResult._avg.rating * 10) / 10 : null,
            itemsWithRatings: ratingResult._count.rating,
          },
          watchTime: {
            totalHours: totalWatchTimeHours,
            totalMinutes: totalWatchTimeMinutes,
            episodesWatched: episodesWatchedCount,
          },
        }
      } catch (error) {
        throw toTRPCError(error)
      }
    }),

  // Get viewing activity over time
  activity: protectedProcedure
    .input(z.object({
      timeRange: TimeRangeSchema,
      groupBy: z.enum(['day', 'week', 'month']).default('day'),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const user = await ctx.db.user.findUnique({
          where: { clerkId: ctx.session.userId },
        })

        if (!user) {
          throw toTRPCError(createError.userNotFound(ctx.session.userId))
        }

        // Calculate date range
        const now = new Date()
        let startDate: Date

        switch (input.timeRange) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3)
            startDate = new Date(now.getFullYear(), quarter * 3, 1)
            break
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1)
            break
          default:
            startDate = new Date(now.getFullYear() - 1, 0, 1)
        }

        // Get items completed in the time range
        const completedItems = await ctx.db.watchedItem.findMany({
          where: {
            userId: user.id,
            status: 'COMPLETED',
            finishDate: {
              gte: startDate,
              lte: now,
            },
          },
          select: {
            finishDate: true,
            mediaType: true,
            rating: true,
          },
          orderBy: { finishDate: 'asc' },
        })

        // Group by the specified period
        const activityMap = new Map<string, {
          date: string
          completed: number
          movies: number
          tvShows: number
          averageRating: number | null
        }>()

        completedItems.forEach(item => {
          if (!item.finishDate) return

          let key: string
          const date = new Date(item.finishDate)

          switch (input.groupBy) {
            case 'day':
              key = date.toISOString().split('T')[0]
              break
            case 'week':
              const weekStart = new Date(date)
              weekStart.setDate(date.getDate() - date.getDay())
              key = weekStart.toISOString().split('T')[0]
              break
            case 'month':
              key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
              break
            default:
              key = date.toISOString().split('T')[0]
          }

          if (!activityMap.has(key)) {
            activityMap.set(key, {
              date: key,
              completed: 0,
              movies: 0,
              tvShows: 0,
              averageRating: null,
            })
          }

          const activity = activityMap.get(key)!
          activity.completed += 1
          
          if (item.mediaType === 'MOVIE') {
            activity.movies += 1
          } else {
            activity.tvShows += 1
          }
        })

        return {
          timeRange: input.timeRange,
          groupBy: input.groupBy,
          activity: Array.from(activityMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
        }
      } catch (error) {
        throw toTRPCError(error)
      }
    }),

  // Get top genres/categories
  genres: protectedProcedure
    .input(z.object({
      timeRange: TimeRangeSchema,
      mediaType: z.enum(['MOVIE', 'TV', 'ALL']).default('ALL'),
      limit: z.number().min(1).max(20).default(10),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const user = await ctx.db.user.findUnique({
          where: { clerkId: ctx.session.userId },
        })

        if (!user) {
          throw toTRPCError(createError.userNotFound(ctx.session.userId))
        }

        // Calculate date range
        const now = new Date()
        let startDate: Date | undefined

        switch (input.timeRange) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3)
            startDate = new Date(now.getFullYear(), quarter * 3, 1)
            break
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1)
            break
          case 'all':
          default:
            startDate = undefined
        }

        const _whereClause = {
          userId: user.id,
          ...(startDate && { updatedAt: { gte: startDate } }),
          ...(input.mediaType !== 'ALL' && { mediaType: input.mediaType }),
        }

        // For demo purposes, return mock genre data based on the user's content
        // In a real implementation, you would fetch genre IDs from TMDB when items are added
        // and store them in a separate genres table or as a field on the watchedItem
        const mockGenres = [
          { id: 28, name: 'Action', count: Math.floor(Math.random() * 20) + 1, color: 'hsl(var(--chart-1))' },
          { id: 35, name: 'Comedy', count: Math.floor(Math.random() * 15) + 1, color: 'hsl(var(--chart-2))' },
          { id: 18, name: 'Drama', count: Math.floor(Math.random() * 25) + 1, color: 'hsl(var(--chart-3))' },
          { id: 878, name: 'Science Fiction', count: Math.floor(Math.random() * 10) + 1, color: 'hsl(var(--chart-4))' },
          { id: 27, name: 'Horror', count: Math.floor(Math.random() * 8) + 1, color: 'hsl(var(--chart-5))' },
          { id: 53, name: 'Thriller', count: Math.floor(Math.random() * 12) + 1, color: 'hsl(var(--chart-1))' },
          { id: 10749, name: 'Romance', count: Math.floor(Math.random() * 10) + 1, color: 'hsl(var(--chart-2))' },
          { id: 16, name: 'Animation', count: Math.floor(Math.random() * 8) + 1, color: 'hsl(var(--chart-3))' },
        ]

        // Filter and sort genres
        const filteredGenres = mockGenres
          .filter(genre => genre.count > 0)
          .sort((a, b) => b.count - a.count)
          .slice(0, input.limit)

        return {
          timeRange: input.timeRange,
          mediaType: input.mediaType,
          genres: filteredGenres,
        }
      } catch (error) {
        throw toTRPCError(error)
      }
    }),

  // Get recent achievements/milestones
  achievements: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const user = await ctx.db.user.findUnique({
          where: { clerkId: ctx.session.userId },
        })

        if (!user) {
          throw toTRPCError(createError.userNotFound(ctx.session.userId))
        }

        const stats = await ctx.db.watchedItem.groupBy({
          by: ['status'],
          where: { userId: user.id },
          _count: true,
        })

        const achievements = []
        const completedCount = stats.find(s => s.status === 'COMPLETED')?._count || 0
        const totalNotes = await ctx.db.note.count({ where: { userId: user.id } })

        // Check for milestone achievements
        if (completedCount >= 100) {
          achievements.push({
            id: 'centurion',
            title: 'Centurion',
            description: 'Completed 100+ movies and shows',
            icon: '🏆',
            unlockedAt: new Date(),
          })
        } else if (completedCount >= 50) {
          achievements.push({
            id: 'half-century',
            title: 'Half Century',
            description: 'Completed 50+ movies and shows',
            icon: '🥉',
            unlockedAt: new Date(),
          })
        } else if (completedCount >= 10) {
          achievements.push({
            id: 'getting-started',
            title: 'Getting Started',
            description: 'Completed 10+ movies and shows',
            icon: '⭐',
            unlockedAt: new Date(),
          })
        }

        if (totalNotes >= 100) {
          achievements.push({
            id: 'prolific-writer',
            title: 'Prolific Writer',
            description: 'Written 100+ notes',
            icon: '✍️',
            unlockedAt: new Date(),
          })
        }

        return {
          achievements,
          nextMilestones: [
            {
              title: 'Next Viewing Milestone',
              current: completedCount,
              target: completedCount < 10 ? 10 : completedCount < 50 ? 50 : 100,
              description: `Complete ${completedCount < 10 ? 10 - completedCount : completedCount < 50 ? 50 - completedCount : 100 - completedCount} more items`,
            },
            {
              title: 'Next Notes Milestone',
              current: totalNotes,
              target: totalNotes < 25 ? 25 : totalNotes < 100 ? 100 : 250,
              description: `Write ${totalNotes < 25 ? 25 - totalNotes : totalNotes < 100 ? 100 - totalNotes : 250 - totalNotes} more notes`,
            },
          ],
        }
      } catch (error) {
        throw toTRPCError(error)
      }
    }),

  // Export user data for sharing/backup
  export: protectedProcedure
    .input(z.object({
      format: z.enum(['json', 'csv']).default('json'),
      includeNotes: z.boolean().default(true),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const user = await ctx.db.user.findUnique({
          where: { clerkId: ctx.session.userId },
          include: {
            watchedItems: {
              include: {
                notes: input.includeNotes,
              },
            },
          },
        })

        if (!user) {
          throw toTRPCError(createError.userNotFound(ctx.session.userId))
        }

        const exportData = {
          exportedAt: new Date().toISOString(),
          user: {
            username: user.username,
            name: user.name,
            joinedAt: user.createdAt,
          },
          items: user.watchedItems.map(item => ({
            tmdbId: item.tmdbId,
            mediaType: item.mediaType,
            title: item.title,
            status: item.status,
            rating: item.rating,
            startDate: item.startDate,
            finishDate: item.finishDate,
            currentSeason: item.currentSeason,
            currentEpisode: item.currentEpisode,
            currentRuntime: item.currentRuntime,
            notes: input.includeNotes ? item.notes.map(note => ({
              content: note.content,
              timestamp: note.timestamp,
              createdAt: note.createdAt,
              isPublic: note.isPublic,
              hasSpoilers: note.hasSpoilers,
            })) : undefined,
          })),
        }

        return {
          format: input.format,
          data: exportData,
          filename: `watch-tracker-export-${user.username}-${new Date().toISOString().split('T')[0]}.${input.format}`,
        }
      } catch (error) {
        throw toTRPCError(error)
      }
    }),
})