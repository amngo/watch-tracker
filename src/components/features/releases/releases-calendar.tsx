'use client'

import { useState, useMemo } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar, Film, Tv } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { api } from '@/trpc/react'
import { cn } from '@/lib/utils'

interface ReleaseEvent {
  id: string
  title: string
  mediaType: 'MOVIE' | 'TV'
  date: Date
  poster: string | null
  tmdbId: number
  seasonNumber?: number
  episodeNumber?: number
  episodeName?: string
  watchedItemId: string
}

export function ReleasesCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Calculate date range for current month view
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  // Fetch upcoming releases for the calendar date range
  const {
    data: releasesData,
    isLoading,
    error,
  } = api.releases.getByDateRange.useQuery(
    {
      startDate: monthStart,
      endDate: monthEnd,
    },
    {
      // Cache for 5 minutes - releases don't change frequently
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  )

  // Convert releases data to the format expected by the calendar
  const upcomingReleases = useMemo((): ReleaseEvent[] => {
    if (!releasesData) return []

    const releases: ReleaseEvent[] = []

    // Flatten the releases by date into a single array
    Object.entries(releasesData).forEach(([, dayReleases]) => {
      dayReleases.forEach(release => {
        releases.push({
          ...release,
          date: new Date(release.date), // Ensure date is a Date object
        })
      })
    })

    return releases
  }, [releasesData])

  const calendarDays = []
  let day = calendarStart

  while (day <= calendarEnd) {
    calendarDays.push(day)
    day = addDays(day, 1)
  }

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const getReleaseForDay = (date: Date): ReleaseEvent[] => {
    return upcomingReleases.filter(release => isSameDay(release.date, date))
  }

  // Component to render detailed release information in tooltip
  const DayReleasesTooltip = ({ releases, date }: { releases: ReleaseEvent[], date: Date }) => {
    if (releases.length === 0) {
      return <span>No releases on {format(date, 'MMM d, yyyy')}</span>
    }

    const movies = releases.filter(r => r.mediaType === 'MOVIE')
    const tvEpisodes = releases.filter(r => r.mediaType === 'TV')

    return (
      <div className="space-y-3 min-w-64 max-w-sm">
        <div className="font-semibold text-sm text-center border-b border-border pb-2">
          {format(date, 'EEEE, MMM d, yyyy')}
        </div>
        
        {movies.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Film className="h-4 w-4 text-blue-500" />
              Movies ({movies.length})
            </div>
            <div className="space-y-1 pl-2">
              {movies.map(movie => (
                <div key={movie.id} className="text-sm py-1 px-2 bg-background/10 rounded border-l-2 border-blue-500/50">
                  {movie.title}
                </div>
              ))}
            </div>
          </div>
        )}

        {tvEpisodes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Tv className="h-4 w-4 text-green-500" />
              TV Episodes ({tvEpisodes.length})
            </div>
            <div className="space-y-2 pl-2">
              {tvEpisodes.map(episode => (
                <div key={episode.id} className="text-sm py-2 px-2 bg-background/10 rounded border-l-2 border-green-500/50">
                  <div className="font-medium text-foreground">{episode.title}</div>
                  {episode.episodeName && (
                    <div className="text-xs text-muted-foreground mt-1">
                      S{episode.seasonNumber}E{episode.episodeNumber}: {episode.episodeName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Release Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Release Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Failed to load releases</p>
            <p className="text-sm">
              There was an error loading upcoming releases. Please try
              refreshing the page.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Release Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-muted-foreground">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map(day => {
              const dayReleases = getReleaseForDay(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isDayToday = isToday(day)

              return (
                <Tooltip key={day.toISOString()}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'aspect-square border rounded-lg p-2 transition-all duration-200 cursor-pointer',
                        'hover:shadow-md hover:scale-105',
                        isCurrentMonth ? 'bg-background' : 'bg-muted/20',
                        isDayToday && 'ring-2 ring-primary ring-offset-2',
                        dayReleases.length > 0 ? 
                          'border-primary/50 bg-primary/5 hover:bg-primary/10 hover:border-primary/70' : 
                          'hover:bg-muted/30 hover:border-muted-foreground/30'
                      )}
                    >
                      <div className="text-sm font-medium mb-1">
                        {format(day, 'd')}
                      </div>

                      {/* Release Events */}
                      <div className="space-y-1">
                        {dayReleases.slice(0, 2).map(release => (
                          <div
                            key={release.id}
                            className="text-xs p-1 rounded bg-primary/10 text-primary border border-primary/20 flex items-center gap-1 truncate"
                          >
                            {release.mediaType === 'TV' ? (
                              <Tv className="h-3 w-3 flex-shrink-0" />
                            ) : (
                              <Film className="h-3 w-3 flex-shrink-0" />
                            )}
                            <span className="truncate">
                              {release.title}
                              {release.episodeName && (
                                <span className="text-muted-foreground">
                                  {' '}
                                  S{release.seasonNumber}E{release.episodeNumber}
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                        {dayReleases.length > 2 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{dayReleases.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    sideOffset={10}
                    className="bg-popover text-popover-foreground border border-border shadow-lg p-4 max-w-md z-50"
                    avoidCollisions
                  >
                    <DayReleasesTooltip releases={dayReleases} date={day} />
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 pt-4 border-t text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary/10 border border-primary/20" />
            <span className="text-muted-foreground">Has releases</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-2 border-primary" />
            <span className="text-muted-foreground">Today</span>
          </div>
          <div className="flex items-center gap-1">
            <Tv className="h-3 w-3" />
            <span className="text-muted-foreground">TV Episodes</span>
          </div>
          <div className="flex items-center gap-1">
            <Film className="h-3 w-3" />
            <span className="text-muted-foreground">Movies</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
