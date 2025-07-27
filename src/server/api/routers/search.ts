import { z } from 'zod'
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from '@/server/api/trpc'
import { tmdbService, TMDBError } from '@/lib/tmdb'
import { createError, toTRPCError } from '@/lib/errors'
import { withCache, cacheKeys, cacheTTL } from '@/lib/cache'



const SearchInputSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Query too long'),
  page: z.number().min(1).max(500).default(1),
  type: z.enum(['multi', 'movie', 'tv']).default('multi'),
})

const MediaDetailsInputSchema = z.object({
  id: z.number(),
  type: z.enum(['movie', 'tv']),
})

const SeasonDetailsInputSchema = z.object({
  tvId: z.number(),
  seasonNumber: z.number(),
})

export const searchRouter = createTRPCRouter({
  // Public search endpoint - anyone can search for content
  search: publicProcedure
    .input(SearchInputSchema)
    .query(async ({ ctx, input }) => {
      try {
        // // Apply rate limiting
        // const searchKey = createSearchRateLimit(ctx)
        // const searchLimit = rateLimiters.search.check(searchKey)
        // if (!searchLimit.allowed) {
        //   throw toTRPCError(createError.rateLimited('Search rate limit exceeded'))
        // }

        // const tmdbKey = createTMDBRateLimit(ctx)
        // const tmdbLimit = rateLimiters.tmdb.check(tmdbKey)
        // if (!tmdbLimit.allowed) {
        //   throw toTRPCError(createError.rateLimited('API rate limit exceeded'))
        // }

        const { query, page, type } = input
        const cacheKey = cacheKeys.tmdb.search(query, type, page)

        // Use cache for TMDB search results
        const results = await withCache.tmdbSearch(
          cacheKey,
          async () => {
            switch (type) {
              case 'movie':
                return await tmdbService.searchMovies(query, page)
              case 'tv':
                return await tmdbService.searchTV(query, page)
              default:
                return await tmdbService.searchMulti(query, page)
            }
          },
          cacheTTL.tmdb.search
        )

        return {
          ...results,
          query,
          type,
        }
      } catch (error) {
        if (error instanceof TMDBError) {
          throw toTRPCError(createError.externalAPI('TMDB', error.message))
        }
        throw toTRPCError(error)
      }
    }),

  // Get detailed information about a specific movie or TV show
  details: publicProcedure
    .input(MediaDetailsInputSchema)
    .query(async ({ input }) => {
      try {
        const { id, type } = input

        if (type === 'movie') {
          const movie = await tmdbService.getMovieDetails(id)
          return {
            ...movie,
            media_type: 'movie' as const,
          }
        } else {
          const tv = await tmdbService.getTVDetails(id)
          return {
            ...tv,
            media_type: 'tv' as const,
          }
        }
      } catch (error) {
        if (error instanceof TMDBError) {
          throw toTRPCError(createError.externalAPI('TMDB', error.message))
        }
        throw toTRPCError(error)
      }
    }),

  // Get extended detailed information with genres, companies, etc.
  detailsExtended: publicProcedure
    .input(MediaDetailsInputSchema)
    .query(async ({ input }) => {
      try {
        const { id, type } = input

        if (type === 'movie') {
          const [movie, credits] = await Promise.all([
            tmdbService.getMovieDetailsExtended(id),
            tmdbService.getMovieCredits(id),
          ])
          return {
            ...movie,
            media_type: 'movie' as const,
            credits,
          }
        } else {
          const [tv, credits] = await Promise.all([
            tmdbService.getTVDetailsExtended(id),
            tmdbService.getTVCredits(id),
          ])
          return {
            ...tv,
            media_type: 'tv' as const,
            credits,
          }
        }
      } catch (error) {
        if (error instanceof TMDBError) {
          throw toTRPCError(createError.externalAPI('TMDB', error.message))
        }
        throw toTRPCError(error)
      }
    }),

  // Get cast and crew information for a movie or TV show
  credits: publicProcedure
    .input(MediaDetailsInputSchema)
    .query(async ({ input }) => {
      try {
        const { id, type } = input

        if (type === 'movie') {
          return await tmdbService.getMovieCredits(id)
        } else {
          return await tmdbService.getTVCredits(id)
        }
      } catch (error) {
        if (error instanceof TMDBError) {
          throw toTRPCError(createError.externalAPI('TMDB', error.message))
        }
        throw toTRPCError(error)
      }
    }),

  // Search within user's watched items
  searchWatched: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        status: z
          .enum(['PLANNED', 'WATCHING', 'COMPLETED', 'PAUSED', 'DROPPED'])
          .optional(),
        mediaType: z.enum(['MOVIE', 'TV']).optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const user = await ctx.db.user.findUnique({
          where: { clerkId: ctx.session.userId },
        })

        if (!user) {
          throw toTRPCError(createError.userNotFound(ctx.session.userId))
        }

        const whereClause: any = {
          userId: user.id,
          title: {
            contains: input.query,
            mode: 'insensitive',
          },
        }

        if (input.status) {
          whereClause.status = input.status
        }

        if (input.mediaType) {
          whereClause.mediaType = input.mediaType
        }

        const items = await ctx.db.watchedItem.findMany({
          where: whereClause,
          include: {
            _count: {
              select: { notes: true },
            },
            notes: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                content: true,
                timestamp: true,
                createdAt: true,
              },
            },
          },
          orderBy: [{ updatedAt: 'desc' }, { title: 'asc' }],
          take: input.limit,
        })

        return {
          items,
          count: items.length,
          query: input.query,
        }
      } catch (error) {
        throw toTRPCError(error)
      }
    }),

  // Get trending content from TMDB
  trending: publicProcedure
    .input(
      z.object({
        mediaType: z.enum(['all', 'movie', 'tv']).default('all'),
        timeWindow: z.enum(['day', 'week']).default('week'),
      })
    )
    .query(async ({ input }) => {
      try {
        // TMDB trending endpoint
        const endpoint = `/trending/${input.mediaType}/${input.timeWindow}`

        // For now, we'll return a simple response structure
        // In a full implementation, you'd make the actual TMDB API call
        return {
          results: [],
          page: 1,
          total_pages: 0,
          total_results: 0,
          mediaType: input.mediaType,
          timeWindow: input.timeWindow,
        }
      } catch (error) {
        throw toTRPCError(
          createError.externalAPI('TMDB', 'Failed to fetch trending content')
        )
      }
    }),

  // Get popular content from TMDB
  popular: publicProcedure
    .input(
      z.object({
        mediaType: z.enum(['movie', 'tv']),
        page: z.number().min(1).max(500).default(1),
      })
    )
    .query(async ({ input }) => {
      try {
        // For now, return empty results
        // In full implementation, make actual TMDB API calls
        return {
          results: [],
          page: input.page,
          total_pages: 0,
          total_results: 0,
          mediaType: input.mediaType,
        }
      } catch (error) {
        throw toTRPCError(
          createError.externalAPI('TMDB', 'Failed to fetch popular content')
        )
      }
    }),

  // Get TV season details with all episodes
  seasonDetails: publicProcedure
    .input(SeasonDetailsInputSchema)
    .query(async ({ input }) => {
      try {
        const { tvId, seasonNumber } = input
        return await tmdbService.getTVSeasonDetails(tvId, seasonNumber)
      } catch (error) {
        if (error instanceof TMDBError) {
          throw toTRPCError(createError.externalAPI('TMDB', error.message))
        }
        throw toTRPCError(error)
      }
    }),

  // Get user's recent searches (stored locally)
  recentSearches: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await ctx.db.user.findUnique({
        where: { clerkId: ctx.session.userId },
      })

      if (!user) {
        throw toTRPCError(createError.userNotFound(ctx.session.userId))
      }

      // Get user's recently added watched items as "recent searches"
      const recentItems = await ctx.db.watchedItem.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          tmdbId: true,
          mediaType: true,
          title: true,
          poster: true,
          createdAt: true,
        },
      })

      return {
        searches: recentItems.map(item => ({
          query: item.title,
          tmdbId: item.tmdbId,
          mediaType: item.mediaType.toLowerCase(),
          poster: item.poster,
          searchedAt: item.createdAt,
        })),
      }
    } catch (error) {
      throw toTRPCError(error)
    }
  }),
})
