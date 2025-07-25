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

interface AddNoteFormProps {
  watchedItemId: string
  mediaTitle: string
  mediaType: 'MOVIE' | 'TV'
  onAddNote: (noteData: {
    content: string
    timestamp?: string
    isPublic: boolean
    hasSpoilers: boolean
  }) => void
  trigger?: React.ReactNode
}

export function AddNoteForm({ 
  watchedItemId, 
  mediaTitle, 
  mediaType, 
  onAddNote, 
  trigger 
}: AddNoteFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState('')
  const [timestamp, setTimestamp] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [hasSpoilers, setHasSpoilers] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) return

    setIsSubmitting(true)
    
    try {
      await onAddNote({
        content: content.trim(),
        timestamp: timestamp.trim() || undefined,
        isPublic,
        hasSpoilers
      })
      
      // Reset form
      setContent('')
      setTimestamp('')
      setIsPublic(false)
      setHasSpoilers(false)
      setIsOpen(false)
    } catch (error) {
      console.error('Error adding note:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTimestampPlaceholder = () => {
    if (mediaType === 'MOVIE') {
      return 'e.g., 01:23:45'
    }
    return 'e.g., S02E05 or S02E05 12:34'
  }

  const getTimestampHelpText = () => {
    if (mediaType === 'MOVIE') {
      return 'Enter the time in the movie (HH:MM:SS format)'
    }
    return 'Enter season/episode (S02E05) or include time (S02E05 12:34)'
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Add Note to {mediaTitle}
          </DialogTitle>
        </DialogHeader>

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
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!content.trim() || isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Note'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Compact version for inline use
export function QuickAddNote({ watchedItemId, mediaTitle, mediaType, onAddNote }: AddNoteFormProps) {
  return (
    <AddNoteForm
      watchedItemId={watchedItemId}
      mediaTitle={mediaTitle}
      mediaType={mediaType}
      onAddNote={onAddNote}
      trigger={
        <Button variant="outline" size="sm" className="w-full">
          <MessageSquare className="h-4 w-4 mr-2" />
          Quick Note
        </Button>
      }
    />
  )
}