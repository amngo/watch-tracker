'use client'

import { useState } from 'react'
import { MessageSquare, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AddNoteForm } from '@/components/features/notes/add-note-form'
import type { WatchedItem } from '@/types'
import { Episode } from 'tmdb-ts'

interface AddEpisodeNoteButtonProps {
  episode: Episode
  watchedItem: WatchedItem
  variant?: 'grid' | 'list'
  size?: 'sm' | 'default'
  className?: string
}

export function AddEpisodeNoteButton({
  episode,
  watchedItem,
  variant = 'grid',
  size = 'sm',
  className = '',
}: AddEpisodeNoteButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSuccess = () => {
    setIsOpen(false)
  }

  const handleCancel = () => {
    setIsOpen(false)
  }

  const buttonContent =
    variant === 'grid' ? (
      <>
        <MessageSquare className="h-3 w-3 mr-1" />
        Add Note
      </>
    ) : (
      <>
        <Plus className="h-3 w-3 mr-1" />
        Note
      </>
    )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size={size}
          variant="outline"
          className={`${
            variant === 'grid'
              ? 'w-full text-xs h-7'
              : 'text-xs px-2 py-1 h-auto'
          } ${className}`}
        >
          {buttonContent}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Episode Note</DialogTitle>
          <div className="text-sm text-muted-foreground">
            Adding note for <strong>{episode.name}</strong> (Season{' '}
            {episode.season_number}, Episode {episode.episode_number})
          </div>
        </DialogHeader>

        <AddNoteForm
          watchedItemId={watchedItem.id}
          mediaType="TV"
          noteType="EPISODE"
          currentSeason={episode.season_number}
          currentEpisode={episode.episode_number}
          totalSeasons={watchedItem.totalSeasons || undefined}
          totalEpisodes={watchedItem.totalEpisodes || undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  )
}
