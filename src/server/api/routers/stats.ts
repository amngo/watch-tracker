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

        const whereClause = {
          userId: user.id,
          ...(startDate && { updatedAt: { gte: startDate } }),
          ...(input.mediaType !== 'ALL' && { mediaType: input.mediaType }),
        }

        // Get watched items to analyze genres
        const watchedItems = await ctx.db.watchedItem.findMany({
          where: whereClause,
          select: {
            tmdbId: true,
            mediaType: true,
            title: true,
          },
        })

        // For demo purposes, we'll analyze titles for genre patterns
        // In production, this would fetch from TMDB API and store in database
        const genreMap = new Map<string, { id: number; name: string; count: number }>()
        
        // Pattern-based genre detection (simplified for demo)
        watchedItems.forEach(item => {
          const title = item.title.toLowerCase()
          
          // Simple pattern matching for demonstration
          if (title.includes('action') || title.includes('fight') || title.includes('war')) {
            const genre = genreMap.get('Action') || { id: 28, name: 'Action', count: 0 }
            genre.count++
            genreMap.set('Action', genre)
          }
          if (title.includes('comedy') || title.includes('funny')) {
            const genre = genreMap.get('Comedy') || { id: 35, name: 'Comedy', count: 0 }
            genre.count++
            genreMap.set('Comedy', genre)
          }
          if (title.includes('drama') || title.includes('life')) {
            const genre = genreMap.get('Drama') || { id: 18, name: 'Drama', count: 0 }
            genre.count++
            genreMap.set('Drama', genre)
          }
          // Default to Drama if no pattern matches and map is empty
          if (genreMap.size === 0) {
            const genre = genreMap.get('Drama') || { id: 18, name: 'Drama', count: 0 }
            genre.count++
            genreMap.set('Drama', genre)
          }
        })

        // Convert to array and sort by count
        const filteredGenres = Array.from(genreMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, input.limit)
          .map((genre, index) => ({
            ...genre,
            color: `hsl(var(--chart-${(index % 5) + 1}))`,
          }))

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

  // Get viewing patterns (heatmap data)
  viewingPatterns: protectedProcedure
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
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        }

        // Get all watched episodes and completed items in the time range
        const [watchedEpisodes, completedItems] = await Promise.all([
          ctx.db.watchedEpisode.findMany({
            where: {
              watchedItem: { userId: user.id },
              status: 'WATCHED',
              watchedAt: {
                gte: startDate,
                lte: now,
              },
            },
            select: {
              watchedAt: true,
            },
          }),
          ctx.db.watchedItem.findMany({
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
            },
          }),
        ])

        // Create heatmap data
        const heatmapData = []
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const activityMap = new Map<string, number>()

        // Process watched episodes
        watchedEpisodes.forEach(episode => {
          if (episode.watchedAt) {
            const date = new Date(episode.watchedAt)
            const dayOfWeek = date.getDay()
            const hour = date.getHours()
            const key = `${dayOfWeek}-${hour}`
            activityMap.set(key, (activityMap.get(key) || 0) + 1)
          }
        })

        // Process completed items (movies)
        completedItems.forEach(item => {
          if (item.finishDate) {
            const date = new Date(item.finishDate)
            const dayOfWeek = date.getDay()
            const hour = date.getHours()
            const key = `${dayOfWeek}-${hour}`
            // Weight movies more heavily since they're longer
            const weight = item.mediaType === 'MOVIE' ? 3 : 1
            activityMap.set(key, (activityMap.get(key) || 0) + weight)
          }
        })

        // Find max activity for normalization
        const maxActivity = Math.max(...Array.from(activityMap.values()), 1)

        // Generate full heatmap grid
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
          for (let hour = 0; hour < 24; hour++) {
            const key = `${dayIndex}-${hour}`
            const rawActivity = activityMap.get(key) || 0
            // Normalize to 0-4 scale
            const normalizedActivity = Math.round((rawActivity / maxActivity) * 4)
            
            heatmapData.push({
              day: daysOfWeek[dayIndex],
              hour,
              activity: normalizedActivity,
              dayIndex,
              count: rawActivity, // Raw count for tooltips
            })
          }
        }

        // Calculate viewing habits statistics
        let peakHour = 0
        let peakDay = 0
        let maxHourActivity = 0
        let maxDayActivity = 0

        // Find peak hour
        for (let hour = 0; hour < 24; hour++) {
          let hourTotal = 0
          for (let day = 0; day < 7; day++) {
            const key = `${day}-${hour}`
            hourTotal += activityMap.get(key) || 0
          }
          if (hourTotal > maxHourActivity) {
            maxHourActivity = hourTotal
            peakHour = hour
          }
        }

        // Find peak day
        for (let day = 0; day < 7; day++) {
          let dayTotal = 0
          for (let hour = 0; hour < 24; hour++) {
            const key = `${day}-${hour}`
            dayTotal += activityMap.get(key) || 0
          }
          if (dayTotal > maxDayActivity) {
            maxDayActivity = dayTotal
            peakDay = day
          }
        }

        // Calculate binge sessions (3+ episodes in a day)
        const bingeDays = new Map<string, number>()
        watchedEpisodes.forEach(episode => {
          if (episode.watchedAt) {
            const dateKey = new Date(episode.watchedAt).toISOString().split('T')[0]
            bingeDays.set(dateKey, (bingeDays.get(dateKey) || 0) + 1)
          }
        })
        const bingeSessions = Array.from(bingeDays.values()).filter(count => count >= 3).length

        // Calculate average content lengths
        const contentStats = await ctx.db.watchedItem.findMany({
          where: {
            userId: user.id,
            status: 'COMPLETED',
            ...(startDate && { finishDate: { gte: startDate } }),
          },
          select: {
            mediaType: true,
            totalRuntime: true,
            totalEpisodes: true,
          },
        })

        let totalMovieRuntime = 0
        let movieCount = 0

        contentStats.forEach(item => {
          if (item.mediaType === 'MOVIE' && item.totalRuntime) {
            totalMovieRuntime += item.totalRuntime
            movieCount++
          }
        })

        const avgMovieLength = movieCount > 0 
          ? Math.round(totalMovieRuntime / movieCount) 
          : 120 // Default 2 hours
        
        const avgEpisodeLength = 45 // Standard TV episode length

        return {
          heatmapData,
          stats: {
            peakHour: `${peakHour}:00-${(peakHour + 1) % 24}:00`,
            peakDay: daysOfWeek[peakDay],
            bingeSessions,
            totalViews: watchedEpisodes.length + completedItems.length,
            avgMovieLength,
            avgEpisodeLength,
          },
        }
      } catch (error) {
        throw toTRPCError(error)
      }
    }),

  // Get real genre data from TMDB
  genresWithData: protectedProcedure
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

        const whereClause = {
          userId: user.id,
          ...(startDate && { updatedAt: { gte: startDate } }),
          ...(input.mediaType !== 'ALL' && { mediaType: input.mediaType }),
        }

        // Get watched items with their TMDB IDs
        const watchedItems = await ctx.db.watchedItem.findMany({
          where: whereClause,
          select: {
            tmdbId: true,
            mediaType: true,
            title: true,
          },
        })

        // Note: In production, you would fetch genre data from TMDB API
        // and store it in the database when items are added.
        // For now, we'll use a mapping of common genres.
        const genreMap = new Map<string, { id: number; name: string; count: number }>()
        
        // Common genre mappings (simplified) - for future TMDB integration
        const _commonGenres: Record<number, string> = {
          28: 'Action',
          12: 'Adventure',
          16: 'Animation',
          35: 'Comedy',
          80: 'Crime',
          99: 'Documentary',
          18: 'Drama',
          10751: 'Family',
          14: 'Fantasy',
          36: 'History',
          27: 'Horror',
          10402: 'Music',
          9648: 'Mystery',
          10749: 'Romance',
          878: 'Science Fiction',
          10770: 'TV Movie',
          53: 'Thriller',
          10752: 'War',
          37: 'Western',
        }

        // For demonstration, we'll assign genres based on title patterns
        // In production, this would come from TMDB API data
        watchedItems.forEach(item => {
          const title = item.title.toLowerCase()
          
          // Simple pattern matching for demonstration
          if (title.includes('action') || title.includes('fight') || title.includes('war')) {
            const genre = genreMap.get('Action') || { id: 28, name: 'Action', count: 0 }
            genre.count++
            genreMap.set('Action', genre)
          }
          if (title.includes('comedy') || title.includes('funny')) {
            const genre = genreMap.get('Comedy') || { id: 35, name: 'Comedy', count: 0 }
            genre.count++
            genreMap.set('Comedy', genre)
          }
          if (title.includes('drama') || title.includes('life')) {
            const genre = genreMap.get('Drama') || { id: 18, name: 'Drama', count: 0 }
            genre.count++
            genreMap.set('Drama', genre)
          }
          if (title.includes('horror') || title.includes('scary')) {
            const genre = genreMap.get('Horror') || { id: 27, name: 'Horror', count: 0 }
            genre.count++
            genreMap.set('Horror', genre)
          }
          if (title.includes('sci-fi') || title.includes('space') || title.includes('future')) {
            const genre = genreMap.get('Science Fiction') || { id: 878, name: 'Science Fiction', count: 0 }
            genre.count++
            genreMap.set('Science Fiction', genre)
          }
          if (title.includes('love') || title.includes('romance')) {
            const genre = genreMap.get('Romance') || { id: 10749, name: 'Romance', count: 0 }
            genre.count++
            genreMap.set('Romance', genre)
          }
          if (title.includes('thriller') || title.includes('suspense')) {
            const genre = genreMap.get('Thriller') || { id: 53, name: 'Thriller', count: 0 }
            genre.count++
            genreMap.set('Thriller', genre)
          }
          if (title.includes('anim')) {
            const genre = genreMap.get('Animation') || { id: 16, name: 'Animation', count: 0 }
            genre.count++
            genreMap.set('Animation', genre)
          }
          
          // Default genre if no pattern matches
          if (genreMap.size === 0) {
            const genre = genreMap.get('Drama') || { id: 18, name: 'Drama', count: 0 }
            genre.count++
            genreMap.set('Drama', genre)
          }
        })

        // Convert to array and sort by count
        const genres = Array.from(genreMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, input.limit)
          .map((genre, index) => ({
            ...genre,
            color: `hsl(var(--chart-${(index % 5) + 1}))`,
          }))

        // If no genres found, return some default data
        if (genres.length === 0) {
          return {
            timeRange: input.timeRange,
            mediaType: input.mediaType,
            genres: [
              { id: 18, name: 'Drama', count: 0, color: 'hsl(var(--chart-1))' },
            ],
          }
        }

        return {
          timeRange: input.timeRange,
          mediaType: input.mediaType,
          genres,
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