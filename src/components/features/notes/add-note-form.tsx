'use client'

import { useState } from 'react'
import { Plus, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { api } from '@/trpc/react'

interface AddNoteFormProps {
  watchedItemId: string
  mediaType: 'MOVIE' | 'TV'
  totalRuntime?: number
  totalSeasons?: number
  totalEpisodes?: number
  currentSeason?: number
  currentEpisode?: number
  onSuccess?: () => void
  onCancel?: () => void
  trigger?: React.ReactNode
}

export function AddNoteForm({ 
  watchedItemId,
  mediaType,
  totalRuntime,
  totalSeasons,
  totalEpisodes,
  currentSeason,
  currentEpisode,
  onSuccess,
  onCancel,
  trigger 
}: AddNoteFormProps) {
  const [content, setContent] = useState('')
  const [timestamp, setTimestamp] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [hasSpoilers, setHasSpoilers] = useState(false)

  const createNoteMutation = api.note.create.useMutation({
    onSuccess: () => {
      // Reset form
      setContent('')
      setTimestamp('')
      setIsPublic(false)
      setHasSpoilers(false)
      onSuccess?.()
    },
    onError: (error) => {
      console.error('Error adding note:', error)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) return

    createNoteMutation.mutate({
      watchedItemId,
      content: content.trim(),
      timestamp: timestamp.trim() || undefined,
      isPublic,
      hasSpoilers
    })
  }

  const getTimestampPlaceholder = () => {
    if (mediaType === 'MOVIE') {
      return 'e.g., 01:23:45'
    }
    return 'e.g., S02E05 or S02E05 12:34'
  }

  const getTimestampHelpText = () => {
    if (mediaType === 'MOVIE') {
      return 'Enter the time in the movie (HH:MM:SS or MM:SS format)'
    }
    return 'Enter season/episode (S02E05) or include time (S02E05 12:34)'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="note-content">Note Content *</Label>
        <Textarea
          id="note-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your thoughts, observations, or reactions..."
          className="min-h-[120px]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="timestamp">Timestamp (optional)</Label>
        <Input
          id="timestamp"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          placeholder={getTimestampPlaceholder()}
        />
        <p className="text-xs text-muted-foreground">
          {getTimestampHelpText()}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="is-public" className="text-sm font-medium">
              Public Note
            </Label>
            <p className="text-xs text-muted-foreground">
              Allow others to see this note on your public profile
            </p>
          </div>
          <Switch
            id="is-public"
            checked={isPublic}
            onCheckedChange={setIsPublic}
          />
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="has-spoilers" className="text-sm font-medium">
              Contains Spoilers
            </Label>
            <p className="text-xs text-muted-foreground">
              This note reveals plot details or important information
            </p>
          </div>
          <Switch
            id="has-spoilers"
            checked={hasSpoilers}
            onCheckedChange={setHasSpoilers}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={createNoteMutation.isPending}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!content.trim() || createNoteMutation.isPending}
        >
          {createNoteMutation.isPending ? 'Adding...' : 'Add Note'}
        </Button>
      </div>
    </form>
  )
}

