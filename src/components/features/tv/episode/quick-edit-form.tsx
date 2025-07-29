import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { WatchedItem } from '@/types'

interface QuickEditFormProps {
  watchedItem: WatchedItem
  onUpdateProgress: (data: { currentSeason: number; currentEpisode: number }) => void
  onClose?: () => void
}

export function QuickEditForm({ watchedItem, onUpdateProgress, onClose }: QuickEditFormProps) {
  const [quickSeason, setQuickSeason] = useState(watchedItem.currentSeason || 1)
  const [quickEpisode, setQuickEpisode] = useState(watchedItem.currentEpisode || 1)

  const handleQuickEdit = () => {
    onUpdateProgress({
      currentSeason: quickSeason,
      currentEpisode: quickEpisode,
    })
    onClose?.()
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="season">Season</Label>
          <Input
            id="season"
            type="number"
            min="1"
            max={watchedItem.totalSeasons || undefined}
            value={quickSeason}
            onChange={(e) => setQuickSeason(parseInt(e.target.value) || 1)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="episode">Episode</Label>
          <Input
            id="episode"
            type="number"
            min="1"
            value={quickEpisode}
            onChange={(e) => setQuickEpisode(parseInt(e.target.value) || 1)}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button onClick={handleQuickEdit}>
          Update Progress
        </Button>
      </div>
    </>
  )
}