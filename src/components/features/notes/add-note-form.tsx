'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/trpc/react'

interface AddNoteFormProps {
  watchedItemId: string
  mediaType: 'MOVIE' | 'TV'
  noteType?: 'GENERAL' | 'EPISODE'
  totalRuntime?: number
  totalSeasons?: number
  totalEpisodes?: number
  currentSeason?: number
  currentEpisode?: number
  onSuccess?: () => void
  onCancel?: () => void
}

export function AddNoteForm({ 
  watchedItemId,
  mediaType,
  noteType = 'GENERAL',
  totalSeasons,
  totalEpisodes: _totalEpisodes,
  currentSeason,
  currentEpisode,
  onSuccess,
  onCancel
}: AddNoteFormProps) {
  const [content, setContent] = useState('')
  const [timestamp, setTimestamp] = useState('')
  const [selectedNoteType, setSelectedNoteType] = useState<'GENERAL' | 'EPISODE'>(noteType)
  const [seasonNumber, setSeasonNumber] = useState(currentSeason || 1)
  const [episodeNumber, setEpisodeNumber] = useState(currentEpisode || 1)
  const [isPublic, setIsPublic] = useState(false)
  const [hasSpoilers, setHasSpoilers] = useState(false)

  const utils = api.useUtils()
  const createNoteMutation = api.note.create.useMutation({
    onSuccess: () => {
      // Reset form
      setContent('')
      setTimestamp('')
      setSelectedNoteType('GENERAL')
      setSeasonNumber(currentSeason || 1)
      setEpisodeNumber(currentEpisode || 1)
      setIsPublic(false)
      setHasSpoilers(false)
      
      // Invalidate navigation counts to update badges
      utils.stats.navigationCounts.invalidate()
      
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
      noteType: selectedNoteType,
      seasonNumber: selectedNoteType === 'EPISODE' ? seasonNumber : undefined,
      episodeNumber: selectedNoteType === 'EPISODE' ? episodeNumber : undefined,
      isPublic,
      hasSpoilers
    })
  }

  const getTimestampPlaceholder = () => {
    if (mediaType === 'MOVIE') {
      return 'e.g., 01:23:45'
    }
    if (selectedNoteType === 'EPISODE') {
      return 'e.g., 12:34 (time within episode)'
    }
    return 'e.g., 12:34 (optional)'
  }

  const getTimestampHelpText = () => {
    if (mediaType === 'MOVIE') {
      return 'Enter the time in the movie (HH:MM:SS or MM:SS format)'
    }
    if (selectedNoteType === 'EPISODE') {
      return 'Enter time within the episode (MM:SS format) - optional'
    }
    return 'Enter a timestamp reference if applicable'
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

      {/* Note Type Selection for TV Shows */}
      {mediaType === 'TV' && (
        <div className="space-y-3">
          <Label>Note Type</Label>
          <div className="grid grid-cols-2 gap-3">
            <Card 
              className={`cursor-pointer transition-all ${
                selectedNoteType === 'GENERAL' 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-border'
              }`}
              onClick={() => setSelectedNoteType('GENERAL')}
            >
              <CardContent className="p-4 text-center">
                <h4 className="font-medium">General Note</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  About the show in general
                </p>
              </CardContent>
            </Card>
            <Card 
              className={`cursor-pointer transition-all ${
                selectedNoteType === 'EPISODE' 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-border'
              }`}
              onClick={() => setSelectedNoteType('EPISODE')}
            >
              <CardContent className="p-4 text-center">
                <h4 className="font-medium">Episode Note</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  About a specific episode
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Episode Selection for Episode Notes */}
      {mediaType === 'TV' && selectedNoteType === 'EPISODE' && (
        <div className="space-y-3">
          <Label>Episode</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="season-number">Season</Label>
              <Input
                id="season-number"
                type="number"
                min="1"
                max={totalSeasons || 50}
                value={seasonNumber}
                onChange={(e) => setSeasonNumber(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="episode-number">Episode</Label>
              <Input
                id="episode-number"
                type="number"
                min="1"
                max={100}
                value={episodeNumber}
                onChange={(e) => setEpisodeNumber(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              S{seasonNumber.toString().padStart(2, '0')}E{episodeNumber.toString().padStart(2, '0')}
            </Badge>
            <span className="text-sm text-muted-foreground">Episode reference</span>
          </div>
        </div>
      )}

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

