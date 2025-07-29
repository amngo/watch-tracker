'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MoreHorizontal, Edit3, Trash2, Eye, EyeOff, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { api } from '@/trpc/react'
import { useEpisodeName } from '@/hooks/use-episode-name'
import { formatEpisodeReference } from '@/lib/episode-utils'
import type { Note, NoteWithMedia } from '@/types'

interface NoteCardProps {
  note: Note | NoteWithMedia
  onDeleted?: () => void
  formatTimestamp?: (timestamp: string | null) => string | null
  showSpoilers?: boolean
}

export function NoteCard({
  note,
  onDeleted,
  formatTimestamp,
  showSpoilers = true,
}: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(note.content)
  const [editTimestamp, setEditTimestamp] = useState(note.timestamp || '')
  const [editIsPublic, setEditIsPublic] = useState(note.isPublic)
  const [editHasSpoilers, setEditHasSpoilers] = useState(note.hasSpoilers)

  // Get episode name if this is an episode note for a TV show
  const isNoteWithMedia = 'watchedItem' in note
  const tmdbId = isNoteWithMedia ? note.watchedItem.tmdbId : undefined
  const isEpisodeNote =
    note.noteType === 'EPISODE' && note.seasonNumber && note.episodeNumber
  const isTV = isNoteWithMedia && note.watchedItem.mediaType === 'TV'

  const { episodeName } = useEpisodeName(
    isEpisodeNote && isTV ? tmdbId : undefined,
    note.seasonNumber,
    note.episodeNumber
  )

  const utils = api.useUtils()
  const updateNoteMutation = api.note.update.useMutation({
    onSuccess: () => {
      setIsEditing(false)

      // Invalidate navigation counts to update badges
      utils.stats.navigationCounts.invalidate()

      onDeleted?.()
    },
  })

  const deleteNoteMutation = api.note.delete.useMutation({
    onSuccess: () => {
      // Invalidate navigation counts to update badges
      utils.stats.navigationCounts.invalidate()

      onDeleted?.()
    },
  })

  const handleSave = () => {
    updateNoteMutation.mutate({
      id: note.id,
      content: editContent,
      timestamp: editTimestamp || undefined,
      isPublic: editIsPublic,
      hasSpoilers: editHasSpoilers,
    })
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNoteMutation.mutate({ id: note.id })
    }
  }

  const handleCancel = () => {
    setEditContent(note.content)
    setEditTimestamp(note.timestamp || '')
    setEditIsPublic(note.isPublic)
    setEditHasSpoilers(note.hasSpoilers)
    setIsEditing(false)
  }

  const shouldBlurContent = note.hasSpoilers && !showSpoilers

  return (
    <>
      <Card className="group transition-shadow hover:shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Episode info and timestamp */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {/* Episode information for TV show episode notes */}
                {isEpisodeNote &&
                  isTV &&
                  note.seasonNumber &&
                  note.episodeNumber && (
                    <Badge variant="secondary" className="text-xs">
                      {formatEpisodeReference(
                        note.seasonNumber,
                        note.episodeNumber,
                        episodeName
                      )}
                    </Badge>
                  )}

                {/* Timestamp */}
                {note.timestamp && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">
                      {formatTimestamp
                        ? formatTimestamp(note.timestamp)
                        : note.timestamp}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Content */}
              <div
                className={`${shouldBlurContent ? 'blur-sm select-none' : ''} transition-all`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>

              {/* Spoiler warning */}
              {shouldBlurContent && (
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Spoiler Hidden
                  </Badge>
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(note.createdAt, { addSuffix: true })}
                </span>

                {note.isPublic && (
                  <Badge variant="outline" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                )}

                {note.hasSpoilers && (
                  <Badge variant="secondary" className="text-xs">
                    Spoiler
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Note
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Note
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note-content">Note Content</Label>
              <Textarea
                id="note-content"
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                placeholder="Write your note..."
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timestamp">Timestamp (optional)</Label>
              <Input
                id="timestamp"
                value={editTimestamp}
                onChange={e => setEditTimestamp(e.target.value)}
                placeholder="e.g., 01:23:45 or S02E05 12:34"
              />
              <p className="text-xs text-muted-foreground">
                For movies: use time format (01:23:45). For TV shows: use
                episode format (S02E05) or include time (S02E05 12:34)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-public"
                  checked={editIsPublic}
                  onCheckedChange={setEditIsPublic}
                />
                <Label htmlFor="is-public">Make this note public</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="has-spoilers"
                  checked={editHasSpoilers}
                  onCheckedChange={setEditHasSpoilers}
                />
                <Label htmlFor="has-spoilers">Contains spoilers</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateNoteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateNoteMutation.isPending}
              >
                {updateNoteMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
