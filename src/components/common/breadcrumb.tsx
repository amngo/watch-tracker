'use client'

import { useEffect, useState, useCallback, useMemo, useRef, memo } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { useBreadcrumbData } from '@/hooks/use-breadcrumb-data'

interface BreadcrumbItem {
  label: string
  href: string
  isActive?: boolean
}

interface BreadcrumbProps {
  className?: string
  maxItems?: number
}

function BreadcrumbComponent({
  className = '',
  maxItems = 5,
}: BreadcrumbProps) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [fetchingTitles, setFetchingTitles] = useState<Set<string>>(new Set())

  // Use ref to track previous pathname to avoid unnecessary processing
  const prevPathnameRef = useRef<string | null>(null)
  const breadcrumbsRef = useRef<BreadcrumbItem[]>([])

  // Use breadcrumb data hook
  const { breadcrumbData, getTVShowTitle, getMovieTitle, getSeasonName } =
    useBreadcrumbData()

  // Check if all required titles are available
  const areAllTitlesReady = useMemo(() => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const requiredTitles: string[] = []

    // Identify what titles we need
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i]

      if (
        segment === 'tv' &&
        pathSegments[i + 1] &&
        !isNaN(Number(pathSegments[i + 1]))
      ) {
        const tvId = pathSegments[i + 1]
        if (!breadcrumbData.tvShows[tvId]) {
          requiredTitles.push(`tv-${tvId}`)
        }

        // Check for season
        if (pathSegments[i + 2] === 'season' && pathSegments[i + 3]) {
          const seasonNumber = pathSegments[i + 3]
          const cacheKey = `${tvId}-${seasonNumber}`
          if (!breadcrumbData.seasons[cacheKey]) {
            requiredTitles.push(`season-${cacheKey}`)
          }
        }
      } else if (
        segment === 'movie' &&
        pathSegments[i + 1] &&
        !isNaN(Number(pathSegments[i + 1]))
      ) {
        const movieId = pathSegments[i + 1]
        if (!breadcrumbData.movies[movieId]) {
          requiredTitles.push(`movie-${movieId}`)
        }
      }
    }

    // Check if any required titles are still being fetched or missing
    const hasUnresolvedTitles = requiredTitles.some(titleKey => {
      if (fetchingTitles.has(titleKey)) return true

      if (titleKey.startsWith('tv-')) {
        const tvId = titleKey.replace('tv-', '')
        return !breadcrumbData.tvShows[tvId]
      }

      if (titleKey.startsWith('movie-')) {
        const movieId = titleKey.replace('movie-', '')
        return !breadcrumbData.movies[movieId]
      }

      if (titleKey.startsWith('season-')) {
        const seasonKey = titleKey.replace('season-', '')
        return !breadcrumbData.seasons[seasonKey]
      }

      return false
    })

    return requiredTitles.length === 0 || !hasUnresolvedTitles
  }, [pathname, breadcrumbData, fetchingTitles])

  // Generate breadcrumbs with better memoization
  const breadcrumbs = useMemo(() => {
    // Only recalculate if pathname or relevant data changed
    const pathSegments = pathname.split('/').filter(Boolean)
    const items: BreadcrumbItem[] = []

    // Process each path segment
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i]
      const isLast = i === pathSegments.length - 1
      const currentPath = '/' + pathSegments.slice(0, i + 1).join('/')

      switch (segment) {
        case 'tv':
          if (pathSegments[i + 1] && !isNaN(Number(pathSegments[i + 1]))) {
            // This is a TV show detail page
            const tvId = pathSegments[i + 1]
            items.push({
              label: 'Library',
              href: '/library',
            })

            // Use cached title or placeholder
            const tvTitle = breadcrumbData.tvShows[tvId] || `TV Show ${tvId}`

            items.push({
              label: tvTitle,
              href: `/tv/${tvId}`,
              isActive: isLast && pathSegments.length === 2,
            })

            // Handle season pages
            if (pathSegments[i + 2] === 'season' && pathSegments[i + 3]) {
              const seasonNumber = pathSegments[i + 3]
              const cacheKey = `${tvId}-${seasonNumber}`
              const seasonName =
                breadcrumbData.seasons[cacheKey] || `Season ${seasonNumber}`
              items.push({
                label: seasonName,
                href: `/tv/${tvId}/season/${seasonNumber}`,
                isActive: isLast,
              })
            }

            // Handle notes pages
            if (pathSegments[i + 2] === 'notes') {
              items.push({
                label: 'Notes',
                href: `/tv/${tvId}/notes`,
                isActive: isLast,
              })
            }

            // Skip the next segments as they're processed above
            i += Math.max(0, pathSegments.length - i - 1)
          } else {
            // Regular TV shows page - redirect to library
            items.push({
              label: 'Library',
              href: '/library',
              isActive: isLast,
            })
          }
          break

        case 'movie':
        case 'movies':
          if (
            segment === 'movie' &&
            pathSegments[i + 1] &&
            !isNaN(Number(pathSegments[i + 1]))
          ) {
            // This is a movie detail page
            const movieId = pathSegments[i + 1]
            items.push({
              label: 'Library',
              href: '/library',
            })

            // Use cached title or placeholder
            const movieTitle =
              breadcrumbData.movies[movieId] || `Movie ${movieId}`

            items.push({
              label: movieTitle,
              href: `/movie/${movieId}`,
              isActive: isLast && pathSegments.length === 2,
            })

            // Handle notes pages
            if (pathSegments[i + 2] === 'notes') {
              items.push({
                label: 'Notes',
                href: `/movie/${movieId}/notes`,
                isActive: isLast,
              })
            }

            // Skip processed segments
            i += Math.max(0, pathSegments.length - i - 1)
          } else {
            // Regular movies page - redirect to library
            items.push({
              label: 'Library',
              href: '/library',
              isActive: isLast,
            })
          }
          break

        case 'search':
          items.push({
            label: 'Search & Add',
            href: '/search',
            isActive: isLast,
          })
          break

        case 'stats':
          items.push({
            label: 'Statistics',
            href: '/stats',
            isActive: isLast && pathSegments.length === 1,
          })
          
          // Handle sub-routes
          if (pathSegments[i + 1]) {
            const subRoute = pathSegments[i + 1]
            const subRouteLabels: Record<string, string> = {
              overview: 'Overview',
              activity: 'Activity', 
              patterns: 'Patterns',
              achievements: 'Achievements'
            }
            
            if (subRouteLabels[subRoute]) {
              items.push({
                label: subRouteLabels[subRoute],
                href: `/stats/${subRoute}`,
                isActive: isLast,
              })
              i++ // Skip the next segment since we processed it
            }
          }
          break

        case 'library':
          items.push({
            label: 'Library',
            href: '/library',
            isActive: isLast && pathSegments.length === 1,
          })
          
          // Handle sub-routes
          if (pathSegments[i + 1]) {
            const subRoute = pathSegments[i + 1]
            const subRouteLabels: Record<string, string> = {
              movies: 'Movies',
              'tv-shows': 'TV Shows'
            }
            
            if (subRouteLabels[subRoute]) {
              items.push({
                label: subRouteLabels[subRoute],
                href: `/library/${subRoute}`,
                isActive: isLast,
              })
              i++ // Skip the next segment since we processed it
            }
          }
          break

        case 'profile':
          items.push({
            label: 'Profile',
            href: '/profile',
            isActive: isLast,
          })
          break

        case 'notes':
          items.push({
            label: 'Notes',
            href: '/notes',
            isActive: isLast,
          })
          break

        case 'queue':
          items.push({
            label: 'Queue',
            href: '/queue',
            isActive: isLast,
          })
          break

        case 'settings':
          items.push({
            label: 'Settings',
            href: '/settings',
            isActive: isLast,
          })
          break

        default:
          // Handle other dynamic segments
          const formattedLabel = segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')

          items.push({
            label: formattedLabel,
            href: currentPath,
            isActive: isLast,
          })
          break
      }
    }

    // Limit items if needed
    const finalItems =
      maxItems && items.length > maxItems
        ? [
            { label: '...', href: '', isActive: false },
            ...items.slice(-maxItems + 2),
          ]
        : items

    // Cache the result
    breadcrumbsRef.current = finalItems

    return finalItems
  }, [pathname, breadcrumbData, maxItems])

  // Fetch missing titles asynchronously
  const fetchMissingTitles = useCallback(async () => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const toFetch: Array<{
      type: 'tv' | 'movie' | 'season'
      id: string
      seasonNumber?: string
    }> = []

    // Check what needs to be fetched
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i]

      if (
        segment === 'tv' &&
        pathSegments[i + 1] &&
        !isNaN(Number(pathSegments[i + 1]))
      ) {
        const tvId = pathSegments[i + 1]
        if (
          !breadcrumbData.tvShows[tvId] &&
          !fetchingTitles.has(`tv-${tvId}`)
        ) {
          toFetch.push({ type: 'tv', id: tvId })
        }

        // Check for season
        if (pathSegments[i + 2] === 'season' && pathSegments[i + 3]) {
          const seasonNumber = pathSegments[i + 3]
          const cacheKey = `${tvId}-${seasonNumber}`
          if (
            !breadcrumbData.seasons[cacheKey] &&
            !fetchingTitles.has(`season-${cacheKey}`)
          ) {
            toFetch.push({ type: 'season', id: tvId, seasonNumber })
          }
        }
      } else if (
        segment === 'movie' &&
        pathSegments[i + 1] &&
        !isNaN(Number(pathSegments[i + 1]))
      ) {
        const movieId = pathSegments[i + 1]
        if (
          !breadcrumbData.movies[movieId] &&
          !fetchingTitles.has(`movie-${movieId}`)
        ) {
          toFetch.push({ type: 'movie', id: movieId })
        }
      }
    }

    if (toFetch.length === 0) return

    // Mark as fetching
    setFetchingTitles(prev => {
      const newSet = new Set(prev)
      toFetch.forEach(item => {
        if (item.type === 'season') {
          newSet.add(`season-${item.id}-${item.seasonNumber}`)
        } else {
          newSet.add(`${item.type}-${item.id}`)
        }
      })
      return newSet
    })

    setIsLoading(true)

    try {
      await Promise.all(
        toFetch.map(async item => {
          try {
            if (item.type === 'tv') {
              await getTVShowTitle(item.id)
            } else if (item.type === 'movie') {
              await getMovieTitle(item.id)
            } else if (item.type === 'season' && item.seasonNumber) {
              await getSeasonName(item.id, item.seasonNumber)
            }
          } catch (error) {
            console.error(`Failed to fetch ${item.type} title:`, error)
          }
        })
      )
    } finally {
      setIsLoading(false)
      // Clear fetching flags
      setFetchingTitles(prev => {
        const newSet = new Set(prev)
        toFetch.forEach(item => {
          if (item.type === 'season') {
            newSet.delete(`season-${item.id}-${item.seasonNumber}`)
          } else {
            newSet.delete(`${item.type}-${item.id}`)
          }
        })
        return newSet
      })
    }
  }, [
    pathname,
    breadcrumbData,
    fetchingTitles,
    getTVShowTitle,
    getMovieTitle,
    getSeasonName,
  ])

  // Fetch missing titles when needed - either on initial load or when pathname changes
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      fetchMissingTitles()
      prevPathnameRef.current = pathname
    }
  }, [pathname, fetchMissingTitles])

  // Show nothing when titles are being fetched
  if (!areAllTitlesReady || (isLoading && fetchingTitles.size > 0)) {
    return null
  }

  return (
    <nav
      className={cn(
        'flex items-center space-x-1 text-sm text-muted-foreground',
        className
      )}
    >
      {breadcrumbs.map((item, index) => (
        <motion.div
          key={item.href}
          className="flex items-center space-x-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: index * 0.05,
            duration: 0.2,
            ease: 'easeOut',
          }}
        >
          {index > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 + 0.1 }}
            >
              <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
            </motion.div>
          )}

          {item.href && index !== breadcrumbs.length - 1 ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors duration-200 flex items-center gap-1"
            >
              <span>{item.label}</span>
            </Link>
          ) : (
            <span
              className={cn(
                'flex items-center gap-1',
                index === breadcrumbs.length - 1
                  ? 'text-foreground font-bold'
                  : 'text-muted-foreground'
              )}
            >
              <span>{item.label}</span>
            </span>
          )}
        </motion.div>
      ))}
    </nav>
  )
}

// Memoized component to prevent unnecessary re-renders
export const Breadcrumb = memo(BreadcrumbComponent)

// Compact version for mobile
export const BreadcrumbCompact = memo(function BreadcrumbCompact({
  className = '',
}: {
  className?: string
}) {
  return <Breadcrumb className={className} maxItems={2} />
})
