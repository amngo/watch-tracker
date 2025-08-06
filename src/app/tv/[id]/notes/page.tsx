'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Plus, FileText, Tv } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { AppendToResponse, TvShowDetails } from 'tmdb-ts'

export default function TVNotesPage() {
  const params = useParams()
  const tvId = params.id as string
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false)
  const [noteType, setNoteType] = useState<'GENERAL' | 'EPISODE'>('GENERAL')
  const [tvDetails, setTvDetails] = useState<AppendToResponse<
    TvShowDetails,
    'credits'[],
    'tvShow'
  > | null>(null)

  const {
    watchedItems,
    stats,
    setStats,
    setStatsLoading,
    setWatchedItems,
    setItemsLoading,
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
  } = api.search.tvDetails.useQuery(
    {
      id: parseInt(tvId),
      type: 'tv',
    },
    {
      enabled: !!tvId && !isNaN(parseInt(tvId)),
    }
  )

  // Fetch general notes for this TV show
  const {
    data: generalNotesData,
    isLoading: generalNotesLoading,
    refetch: refetchGeneralNotes,
  } = api.note.getByWatchedItem.useQuery(
    {
      watchedItemId: userWatchedItem?.id || '',
      noteType: 'GENERAL',
    },
    {
      enabled: !!userWatchedItem?.id,
    }
  )

  // Fetch episode-specific notes for this TV show
  const {
    data: episodeNotesData,
    isLoading: episodeNotesLoading,
    refetch: refetchEpisodeNotes,
  } = api.note.getByWatchedItem.useQuery(
    {
      watchedItemId: userWatchedItem?.id || '',
      noteType: 'EPISODE',
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
    refetchGeneralNotes()
    refetchEpisodeNotes()
  }

  const handleNoteDeleted = () => {
    refetchGeneralNotes()
    refetchEpisodeNotes()
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

  if (
    detailsLoading ||
    generalNotesLoading ||
    episodeNotesLoading ||
    watchedItemsLoading
  ) {
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
                <h3 className="text-lg font-semibold mb-2">
                  TV show not found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Unable to load TV show details
                </p>
                <Button asChild>
                  <Link href="/library">Return to Library</Link>
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
                <h3 className="text-lg font-semibold mb-2">
                  TV show not in watchlist
                </h3>
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

  const generalNotes = generalNotesData?.notes || []
  const episodeNotes = episodeNotesData?.notes || []

  // Group episode notes by season and episode
  const groupedEpisodeNotes = episodeNotes.reduce(
    (acc, note) => {
      if (note.seasonNumber && note.episodeNumber) {
        const key = `S${note.seasonNumber}E${note.episodeNumber}`
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(note)
      }
      return acc
    },
    {} as Record<string, Note[]>
  )

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

        {/* Notes Tabs */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              General Notes
              {generalNotes.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {generalNotes.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="episodes" className="flex items-center gap-2">
              <Tv className="h-4 w-4" />
              Episode Notes
              {episodeNotes.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {episodeNotes.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* General Notes Tab */}
          <TabsContent value="general" className="space-y-4">
            {generalNotes.length > 0 ? (
              <div className="space-y-4">
                {generalNotes.map((note: Note) => (
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
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No general notes yet
                  </h3>
                  <p className="text-muted-foreground mb-4 text-center">
                    Add notes about the show in general, your thoughts, or
                    overall reactions
                  </p>
                  <Button
                    onClick={() => {
                      setNoteType('GENERAL')
                      setIsAddNoteModalOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add General Note
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Episode Notes Tab */}
          <TabsContent value="episodes" className="space-y-4">
            {Object.keys(groupedEpisodeNotes).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(groupedEpisodeNotes)
                  .sort(([a], [b]) => {
                    // Sort by season then episode
                    const [seasonA, episodeA] = a.match(/\d+/g)!.map(Number)
                    const [seasonB, episodeB] = b.match(/\d+/g)!.map(Number)
                    return seasonA - seasonB || episodeA - episodeB
                  })
                  .map(([episodeKey, notes]) => (
                    <Card key={episodeKey}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Tv className="h-4 w-4" />
                          {episodeKey}
                          <Badge variant="outline">
                            {notes.length} note{notes.length > 1 ? 's' : ''}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {notes.map((note: Note) => (
                          <NoteCard
                            key={note.id}
                            note={note}
                            onDeleted={handleNoteDeleted}
                            formatTimestamp={formatTimestamp}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Tv className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No episode notes yet
                  </h3>
                  <p className="text-muted-foreground mb-4 text-center">
                    Add notes about specific episodes, scenes, or moments
                  </p>
                  <Button
                    onClick={() => {
                      setNoteType('EPISODE')
                      setIsAddNoteModalOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Episode Note
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Add Note Modal */}
        <Dialog open={isAddNoteModalOpen} onOpenChange={setIsAddNoteModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Note</DialogTitle>
            </DialogHeader>
            <AddNoteForm
              watchedItemId={userWatchedItem.id}
              mediaType="TV"
              noteType={noteType}
              totalSeasons={tvDetails.number_of_seasons}
              totalEpisodes={tvDetails.number_of_episodes}
              currentSeason={userWatchedItem.currentSeason || undefined}
              currentEpisode={userWatchedItem.currentEpisode || undefined}
              onSuccess={handleNoteAdded}
              onCancel={() => setIsAddNoteModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
