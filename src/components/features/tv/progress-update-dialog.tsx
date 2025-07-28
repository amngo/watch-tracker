import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { WatchedItem } from '@/types'

interface ProgressUpdateDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  item: WatchedItem
  onUpdate: (season: number, episode: number) => void
}

export function ProgressUpdateDialog({
  isOpen,
  onOpenChange,
  item,
  onUpdate,
}: ProgressUpdateDialogProps) {
  const [newSeason, setNewSeason] = useState(item.currentSeason || 1)
  const [newEpisode, setNewEpisode] = useState(item.currentEpisode || 1)

  const handleUpdate = () => {
    onUpdate(newSeason, newEpisode)
    onOpenChange(false)
  }

  const handleCancel = () => {
    // Reset to original values
    setNewSeason(item.currentSeason || 1)
    setNewEpisode(item.currentEpisode || 1)
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Progress</DialogTitle>
          <DialogDescription>
            Set your current season and episode progress for {item.title}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="season">Season</Label>
            <Input
              id="season"
              type="number"
              min="1"
              max={item.totalSeasons || undefined}
              value={newSeason}
              onChange={e => setNewSeason(parseInt(e.target.value) || 1)}
            />
            {item.totalSeasons && (
              <p className="text-xs text-muted-foreground">
                Total: {item.totalSeasons} seasons
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="episode">Episode</Label>
            <Input
              id="episode"
              type="number"
              min="1"
              value={newEpisode}
              onChange={e => setNewEpisode(parseInt(e.target.value) || 1)}
            />
            {item.totalEpisodes && (
              <p className="text-xs text-muted-foreground">
                Total: {item.totalEpisodes} episodes
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleUpdate}>Update Progress</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}