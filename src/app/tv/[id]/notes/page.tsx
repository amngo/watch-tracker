'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Plus, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AddNoteForm } from '@/components/features/notes/add-note-form'
import { NoteCard } from '@/components/features/notes/note-card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { api } from '@/trpc/react'
import { LoadingCard } from '@/components/common/loading-spinner'
import { useMedia } from '@/hooks/use-media'
import { calculateProgressFromWatchedItem } from '@/lib/utils'
import Link from 'next/link'
import type { Note, WatchedItem } from '@/types'

export default function TVNotesPage() {
  const params = useParams()
  const tvId = params.id as string
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false)
  const [tvDetails, setTvDetails] = useState<any>(null)

  const { 
    watchedItems, 
    stats, 
    setStats, 
    setStatsLoading, 
    setWatchedItems, 
    setItemsLoading 
  } = useMedia()

  // Fetch user stats
  const { data: statsData, isLoading: statsDataLoading } =
    api.user.getStats.useQuery()

  // Fetch user's watched items to ensure we have the latest data
  const { data: watchedItemsData, isLoading: watchedItemsLoading } =
    api.watchedItem.getAll.useQuery({
      limit: 100,
    })

  // Get user's watch information for this TV show
  const userWatchedItem = watchedItems.find(
    item => item.tmdbId === parseInt(tvId) && item.mediaType === 'TV'
  )

  // Fetch TV show details
  const {
    data: tvDetailsData,
    isLoading: detailsLoading,
    error: detailsError,
  } = api.search.detailsExtended.useQuery(
    {
      id: parseInt(tvId),
      type: 'tv',
    },
    {
      enabled: !!tvId && !isNaN(parseInt(tvId)),
    }
  )

  // Fetch notes for this TV show
  const {
    data: notesData,
    isLoading: notesLoading,
    refetch: refetchNotes,
  } = api.note.getByWatchedItem.useQuery(
    {
      watchedItemId: userWatchedItem?.id || '',
    },
    {
      enabled: !!userWatchedItem?.id,
    }
  )

  // Sync stats
  useEffect(() => {
    if (statsData) {
      setStats(statsData)
    }
    setStatsLoading(statsDataLoading)
  }, [statsData, statsDataLoading, setStats, setStatsLoading])

  // Sync watched items
  useEffect(() => {
    if (watchedItemsData?.items) {
      setWatchedItems(
        watchedItemsData.items.map(item => ({
          id: item.id,
          tmdbId: item.tmdbId,
          mediaType: item.mediaType,
          title: item.title,
          poster: item.poster,
          releaseDate: item.releaseDate,
          status: item.status,
          rating: item.rating,
          currentEpisode: item.currentEpisode,
          totalEpisodes: item.totalEpisodes,
          currentSeason: item.currentSeason,
          totalSeasons: item.totalSeasons,
          currentRuntime: item.currentRuntime,
          totalRuntime: item.totalRuntime,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          startDate: item.startDate,
          finishDate: item.finishDate,
          notes: item.notes || [],
          _count: item._count,
          watchedEpisodes: item.watchedEpisodes || [],
          progress: calculateProgressFromWatchedItem(
            {
              ...item,
              watchedEpisodes: item.watchedEpisodes || [],
              progress: 0, // Temporary placeholder, will be calculated
            } as WatchedItem,
            item.totalSeasons ?? undefined,
            item.totalEpisodes ?? undefined
          ),
        }))
      )
    }
    setItemsLoading(watchedItemsLoading)
  }, [watchedItemsData, watchedItemsLoading, setWatchedItems, setItemsLoading])

  useEffect(() => {
    if (tvDetailsData) {
      setTvDetails(tvDetailsData)
    }
  }, [tvDetailsData])

  const handleNoteAdded = () => {
    setIsAddNoteModalOpen(false)
    refetchNotes()
  }

  const handleNoteDeleted = () => {
    refetchNotes()
  }

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return null
    
    // For TV shows, timestamp can be:
    // "S02E05" - episode reference
    // "S02E05 12:34" - episode with time
    // "12:34" - just time (for current episode context)
    
    const episodeMatch = timestamp.match(/^S(\d+)E(\d+)(?:\s+(.+))?$/)
    if (episodeMatch) {
      const [, season, episode, time] = episodeMatch
      if (time) {
        return `S${season}E${episode} at ${time}`
      } else {
        return `S${season}E${episode}`
      }
    }
    
    // If it's just a time format, return it as is
    const timeMatch = timestamp.match(/^\d+:\d+(?::\d+)?$/)
    if (timeMatch) {
      return timestamp
    }
    
    return timestamp
  }

  if (detailsLoading || notesLoading || watchedItemsLoading) {
    return (
      <DashboardLayout stats={stats || undefined}>
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/tv/${tvId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to TV Show
              </Link>
            </Button>
          </div>
          <LoadingCard />
        </div>
      </DashboardLayout>
    )
  }

  if (detailsError || !tvDetails) {
    return (
      <DashboardLayout stats={stats || undefined}>
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/tv/${tvId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to TV Show
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">TV show not found</h3>
                <p className="text-muted-foreground mb-4">
                  Unable to load TV show details
                </p>
                <Button asChild>
                  <Link href="/tv">Return to TV Shows</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (!userWatchedItem) {
    return (
      <DashboardLayout stats={stats || undefined}>
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/tv/${tvId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to TV Show
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">TV show not in watchlist</h3>
                <p className="text-muted-foreground mb-4">
                  Add this TV show to your watchlist to create notes
                </p>
                <Button asChild>
                  <Link href={`/tv/${tvId}`}>Add to Watchlist</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const notes = notesData?.notes || []

  return (
    <DashboardLayout stats={stats || undefined}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/tv/${tvId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to TV Show
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{tvDetails.name}</h1>
              <p className="text-muted-foreground">Your Notes</p>
            </div>
          </div>

          <Button onClick={() => setIsAddNoteModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>

        {/* Notes List */}
        {notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note: Note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDeleted={handleNoteDeleted}
                formatTimestamp={formatTimestamp}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
              <p className="text-muted-foreground mb-4 text-center">
                Start taking notes about specific episodes or moments in the show
              </p>
              <Button onClick={() => setIsAddNoteModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Note
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Add Note Modal */}
        <Dialog open={isAddNoteModalOpen} onOpenChange={setIsAddNoteModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Note</DialogTitle>
            </DialogHeader>
            <AddNoteForm
              watchedItemId={userWatchedItem.id}
              mediaType="TV"
              onSuccess={handleNoteAdded}
              onCancel={() => setIsAddNoteModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}