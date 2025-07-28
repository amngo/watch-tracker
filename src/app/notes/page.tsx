'use client'

import { useEffect, useState } from 'react'
import { FileText, Film, Tv, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { NoteCard } from '@/components/features/notes/note-card'
import { PageHeader } from '@/components/common/page-header'
import { EmptyState } from '@/components/common/empty-state'
import { NoteCardSkeleton } from '@/components/ui/skeletons'
import { api } from '@/trpc/react'
import { useMedia } from '@/hooks/use-media'
import Link from 'next/link'
import type { Note, NoteWithMedia, WatchedItem } from '@/types'

export default function NotesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState<'all' | 'movies' | 'tv'>('all')
  
  const { 
    stats, 
    setStats, 
    setStatsLoading,
  } = useMedia()

  // Fetch user stats
  const { data: statsData, isLoading: statsDataLoading } =
    api.user.getStats.useQuery()

  // Fetch all user notes
  const {
    data: allNotesData,
    isLoading: notesLoading,
    refetch: refetchNotes,
  } = api.note.getAllByUser.useQuery({
    limit: 100,
    search: searchTerm || undefined,
  })

  // Sync stats
  useEffect(() => {
    if (statsData) {
      setStats(statsData)
    }
    setStatsLoading(statsDataLoading)
  }, [statsData, statsDataLoading, setStats, setStatsLoading])

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

  if (notesLoading) {
    return (
      <DashboardLayout stats={stats || undefined}>
        <div className="space-y-8">
          <PageHeader
            icon={FileText}
            title="Notes"
            subtitle="All your notes in one place"
          />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <NoteCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const notes = allNotesData?.notes || []
  const movieNotes = notes.filter(note => note.watchedItem?.mediaType === 'MOVIE')
  const tvNotes = notes.filter(note => note.watchedItem?.mediaType === 'TV')

  // Group notes by media item
  const notesByMedia = notes.reduce((acc, note) => {
    const mediaKey = `${note.watchedItem?.mediaType}-${note.watchedItem?.tmdbId}`
    if (!acc[mediaKey]) {
      acc[mediaKey] = {
        watchedItem: note.watchedItem,
        notes: []
      }
    }
    acc[mediaKey].notes.push(note)
    return acc
  }, {} as Record<string, { watchedItem: Partial<WatchedItem> | null; notes: NoteWithMedia[] }>)

  return (
    <DashboardLayout stats={stats || undefined}>
      <div className="space-y-8">
        <PageHeader
          icon={FileText}
          title="Notes"
          subtitle="All your notes in one place"
        >
          <Badge variant="outline" className="text-sm">
            {notes.length} total note{notes.length !== 1 ? 's' : ''}
          </Badge>
        </PageHeader>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {notes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No notes yet"
            description="Start taking notes on your movies and TV shows to track your thoughts and reactions"
          >
            <Button asChild variant="outline">
              <Link href="/movies">
                <Film className="h-4 w-4 mr-2" />
                Browse Movies
              </Link>
            </Button>
            <Button asChild>
              <Link href="/tv">
                <Tv className="h-4 w-4 mr-2" />
                Browse TV Shows
              </Link>
            </Button>
          </EmptyState>
        ) : (
          <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                All Notes
                <Badge variant="secondary" className="ml-1">
                  {notes.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="movies" className="flex items-center gap-2">
                <Film className="h-4 w-4" />
                Movie Notes
                <Badge variant="secondary" className="ml-1">
                  {movieNotes.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="tv" className="flex items-center gap-2">
                <Tv className="h-4 w-4" />
                TV Show Notes
                <Badge variant="secondary" className="ml-1">
                  {tvNotes.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* All Notes Tab */}
            <TabsContent value="all" className="space-y-6">
              {Object.entries(notesByMedia).map(([mediaKey, { watchedItem, notes: mediaNotes }]) => (
                <Card key={mediaKey}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {watchedItem?.mediaType === 'MOVIE' ? (
                        <Film className="h-4 w-4" />
                      ) : (
                        <Tv className="h-4 w-4" />
                      )}
                      <Link 
                        href={`/${watchedItem?.mediaType === 'MOVIE' ? 'movie' : 'tv'}/${watchedItem?.tmdbId}/notes`}
                        className="hover:underline"
                      >
                        {watchedItem?.title}
                      </Link>
                      <Badge variant="outline">
                        {mediaNotes.length} note{mediaNotes.length > 1 ? 's' : ''}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {watchedItem?.mediaType === 'MOVIE' ? 'Movie' : 'TV Show'} • {watchedItem?.releaseDate ? new Date(watchedItem.releaseDate).getFullYear() : 'Unknown'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mediaNotes.map((note: Note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onDeleted={handleNoteDeleted}
                        formatTimestamp={formatTimestamp}
                        showMediaInfo={false}
                      />
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Movies Tab */}
            <TabsContent value="movies" className="space-y-6">
              {Object.entries(notesByMedia)
                .filter(([, { watchedItem }]) => watchedItem?.mediaType === 'MOVIE')
                .map(([mediaKey, { watchedItem, notes: mediaNotes }]) => (
                  <Card key={mediaKey}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Film className="h-4 w-4" />
                        <Link 
                          href={`/movie/${watchedItem?.tmdbId}/notes`}
                          className="hover:underline"
                        >
                          {watchedItem?.title}
                        </Link>
                        <Badge variant="outline">
                          {mediaNotes.length} note{mediaNotes.length > 1 ? 's' : ''}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Movie • {watchedItem?.releaseDate ? new Date(watchedItem.releaseDate).getFullYear() : 'Unknown'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {mediaNotes.map((note: Note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          onDeleted={handleNoteDeleted}
                          formatTimestamp={formatTimestamp}
                          showMediaInfo={false}
                        />
                      ))}
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            {/* TV Shows Tab */}
            <TabsContent value="tv" className="space-y-6">
              {Object.entries(notesByMedia)
                .filter(([, { watchedItem }]) => watchedItem?.mediaType === 'TV')
                .map(([mediaKey, { watchedItem, notes: mediaNotes }]) => (
                  <Card key={mediaKey}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Tv className="h-4 w-4" />
                        <Link 
                          href={`/tv/${watchedItem?.tmdbId}/notes`}
                          className="hover:underline"
                        >
                          {watchedItem?.title}
                        </Link>
                        <Badge variant="outline">
                          {mediaNotes.length} note{mediaNotes.length > 1 ? 's' : ''}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        TV Show • {watchedItem?.releaseDate ? new Date(watchedItem.releaseDate).getFullYear() : 'Unknown'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {mediaNotes.map((note: Note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          onDeleted={handleNoteDeleted}
                          formatTimestamp={formatTimestamp}
                          showMediaInfo={false}
                        />
                      ))}
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}