'use client'

import { useState, useMemo } from 'react'
import { Bell, Film, Tv, Calendar, ExternalLink } from 'lucide-react'
import { isToday, startOfDay } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/trpc/react'

interface NotificationRelease {
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

export function Notifications() {
  const [isOpen, setIsOpen] = useState(false)

  // Memoize date values to prevent infinite re-renders
  const queryParams = useMemo(() => {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 7)
    
    return {
      startDate: startOfDay(new Date()),
      endDate,
      limit: 10,
    }
  }, []) // Empty dependency array - dates calculated once per component mount

  const {
    data: upcomingReleases,
    isLoading,
    error,
  } = api.releases.getUpcoming.useQuery(
    queryParams,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
      refetchOnWindowFocus: false,
    }
  )

  // Filter releases for today only
  const todayReleases = upcomingReleases?.filter(release => 
    isToday(release.date)
  ) || []

  // Calculate notification count (only today's releases)
  const notificationCount = todayReleases.length


  const getMediaIcon = (mediaType: 'MOVIE' | 'TV') => {
    return mediaType === 'TV' ? (
      <Tv className="h-4 w-4 text-green-500" />
    ) : (
      <Film className="h-4 w-4 text-blue-500" />
    )
  }

  const getReleaseTitle = (release: NotificationRelease) => {
    if (release.mediaType === 'TV' && release.episodeName) {
      return `${release.title} - S${release.seasonNumber}E${release.episodeNumber}`
    }
    return release.title
  }

  const getReleaseSubtitle = (release: NotificationRelease) => {
    if (release.mediaType === 'TV' && release.episodeName) {
      return release.episodeName
    }
    return null
  }

  const handleNotificationClick = (release: NotificationRelease) => {
    // Close the dropdown when clicking on a notification
    setIsOpen(false)
    
    // Navigate to the appropriate page (you can customize this based on your routing)
    const url = release.mediaType === 'TV' 
      ? `/tv/${release.tmdbId}` 
      : `/movie/${release.tmdbId}`
    
    window.open(url, '_self')
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative"
          aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} new)` : ''}`}
        >
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold"
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 max-h-96 overflow-y-auto"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex items-center gap-2 text-base font-semibold">
          <Calendar className="h-4 w-4" />
          Release Notifications
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />

        {isLoading && (
          <div className="p-2 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 text-center">
            <div className="text-sm text-muted-foreground">
              Failed to load notifications
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Today's Releases Only */}
            {todayReleases.length > 0 ? (
              <>
                <DropdownMenuLabel className="text-sm font-medium text-primary px-2 py-1">
                  New Releases Today
                </DropdownMenuLabel>
                {todayReleases.map((release) => (
                  <DropdownMenuItem
                    key={release.id}
                    className="flex items-start gap-3 p-3 cursor-pointer"
                    onSelect={() => handleNotificationClick(release)}
                  >
                    {getMediaIcon(release.mediaType)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {getReleaseTitle(release)}
                      </div>
                      {getReleaseSubtitle(release) && (
                        <div className="text-xs text-muted-foreground truncate mt-1">
                          {getReleaseSubtitle(release)}
                        </div>
                      )}
                      <div className="text-xs text-primary font-medium mt-1">
                        Released Today
                      </div>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-1" />
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="justify-center text-sm font-medium text-primary cursor-pointer"
                  onSelect={() => {
                    setIsOpen(false)
                    window.open('/releases', '_self')
                  }}
                >
                  View All Upcoming Releases
                </DropdownMenuItem>
              </>
            ) : (
              <div className="p-4 text-center">
                <Bell className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <div className="text-sm font-medium mb-1">No new releases today</div>
                <div className="text-xs text-muted-foreground">
                  Check back tomorrow for new episodes and movies
                </div>
                <DropdownMenuSeparator className="my-3" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary hover:text-primary/80"
                  onClick={() => {
                    setIsOpen(false)
                    window.open('/releases', '_self')
                  }}
                >
                  View All Upcoming Releases
                </Button>
              </div>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}