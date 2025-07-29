'use client'

import { useState, useMemo } from 'react'
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns'
import { Calendar, Film, Tv, Bell, BellOff, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MediaPoster } from '@/components/ui/media-poster'
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

function formatRelativeDate(date: Date): string {
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  if (isThisWeek(date)) return format(date, 'EEEE')
  return format(date, 'MMM d')
}

function ReleaseItem({ release }: { release: ReleaseEvent }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled)
  }

  return (
    <div className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-shrink-0">
        <MediaPoster
          src={release.poster}
          alt={release.title}
          mediaType={release.mediaType}
          size="sm"
          className="w-16 h-24"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h4 className="font-medium truncate">{release.title}</h4>
            {release.mediaType === 'TV' && release.episodeName && (
              <p className="text-sm text-muted-foreground">
                S{release.seasonNumber}E{release.episodeNumber}:{' '}
                {release.episodeName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {release.mediaType === 'TV' ? (
              <Badge variant="secondary" className="gap-1">
                <Tv className="h-3 w-3" />
                TV
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <Film className="h-3 w-3" />
                Movie
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatRelativeDate(release.date)}</span>
            <span>•</span>
            <span>{format(release.date, 'h:mm a')}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleNotifications}
              className={cn(
                'text-muted-foreground hover:text-foreground',
                notificationsEnabled && 'text-primary'
              )}
            >
              {notificationsEnabled ? (
                <Bell className="h-4 w-4" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a
                href={`https://www.themoviedb.org/${release.mediaType === 'TV' ? 'tv' : 'movie'}/${release.tmdbId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function UpcomingReleases() {
  // Fetch upcoming releases from the API
  const {
    data: upcomingReleasesData,
    isLoading,
    error,
  } = api.releases.getUpcoming.useQuery(
    {
      limit: 50,
    },
    {
      // Cache for 5 minutes - releases don't change frequently
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  )

  // Convert to ReleaseEvent format and ensure dates are Date objects
  const upcomingReleases = useMemo((): ReleaseEvent[] => {
    if (!upcomingReleasesData) return []

    return upcomingReleasesData.map(release => ({
      ...release,
      date: new Date(release.date), // Ensure date is a Date object
    }))
  }, [upcomingReleasesData])

  // Filter releases by time period
  const todayReleases = upcomingReleases.filter(release =>
    isToday(release.date)
  )
  const thisWeekReleases = upcomingReleases.filter(
    release => isThisWeek(release.date) && !isToday(release.date)
  )
  const laterReleases = upcomingReleases.filter(
    release => !isThisWeek(release.date)
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Releases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4 border rounded-lg">
                <Skeleton className="w-16 h-24 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Releases</CardTitle>
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

  if (upcomingReleases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Releases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No upcoming releases</p>
            <p className="text-sm">
              Add some TV shows or movies to your watchlist to see upcoming
              releases here.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Releases</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All ({upcomingReleases.length})
            </TabsTrigger>
            <TabsTrigger value="today">
              Today ({todayReleases.length})
            </TabsTrigger>
            <TabsTrigger value="week">
              This Week ({thisWeekReleases.length})
            </TabsTrigger>
            <TabsTrigger value="later">
              Later ({laterReleases.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {upcomingReleases.map(release => (
              <ReleaseItem key={release.id} release={release} />
            ))}
          </TabsContent>

          <TabsContent value="today" className="space-y-4">
            {todayReleases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No releases today</p>
              </div>
            ) : (
              todayReleases.map(release => (
                <ReleaseItem key={release.id} release={release} />
              ))
            )}
          </TabsContent>

          <TabsContent value="week" className="space-y-4">
            {thisWeekReleases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No releases this week</p>
              </div>
            ) : (
              thisWeekReleases.map(release => (
                <ReleaseItem key={release.id} release={release} />
              ))
            )}
          </TabsContent>

          <TabsContent value="later" className="space-y-4">
            {laterReleases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No upcoming releases</p>
              </div>
            ) : (
              laterReleases.map(release => (
                <ReleaseItem key={release.id} release={release} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
