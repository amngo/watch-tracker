import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MediaSearch } from '@/components/features/search/media-search'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { TMDBMediaItem } from '@/types'

interface AddMediaModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onAddMedia: (media: TMDBMediaItem) => Promise<void>
  triggerLabel?: string
  dialogTitle?: string
  variant?: 'default' | 'outline'
}

export function AddMediaModal({
  isOpen,
  onOpenChange,
  onAddMedia,
  triggerLabel = 'Add Media',
  dialogTitle = 'Search & Add Media',
  variant = 'default'
}: AddMediaModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <Button onClick={() => onOpenChange(true)} variant={variant}>
        <Plus className="h-4 w-4 mr-2" />
        {triggerLabel}
      </Button>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <MediaSearch onAddMedia={onAddMedia} />
      </DialogContent>
    </Dialog>
  )
}