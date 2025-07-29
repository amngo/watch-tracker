'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Check,
  Trash2,
  X,
  CheckSquare,
  Square,
  Star,
  Calendar,
  RefreshCw,
  Play,
  Pause,
  Clock,
  StopCircle,
  MoreHorizontal
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type WatchStatus = 'PLANNED' | 'WATCHING' | 'COMPLETED' | 'PAUSED' | 'DROPPED'

interface LibraryBulkActionsBarProps {
  selectedIds: string[]
  totalItems: number
  mediaType: 'MOVIE' | 'TV' | 'ALL'
  onSelectAll: () => void
  onSelectNone: () => void
  onBulkUpdateStatus: (ids: string[], status: WatchStatus, options?: { startDate?: Date | null; finishDate?: Date | null }) => void
  onBulkDelete: (ids: string[]) => void
  onBulkUpdateRating: (ids: string[], rating: number | null) => void
  onBulkUpdateDates: (ids: string[], options: { startDate?: Date | null; finishDate?: Date | null }) => void
  onBulkUpdateTVShowDetails?: (ids: string[]) => void
  isLoading?: boolean
}

export function LibraryBulkActionsBar({
  selectedIds,
  totalItems,
  mediaType,
  onSelectAll,
  onSelectNone,
  onBulkUpdateStatus,
  onBulkDelete,
  onBulkUpdateRating,
  onBulkUpdateDates,
  onBulkUpdateTVShowDetails,
  isLoading = false,
}: LibraryBulkActionsBarProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [showDatesDialog, setShowDatesDialog] = useState(false)
  const [rating, setRating] = useState<number | null>(null)
  const [startDate, setStartDate] = useState('')
  const [finishDate, setFinishDate] = useState('')

  const selectedCount = selectedIds.length
  const allSelected = selectedCount === totalItems && totalItems > 0

  if (selectedCount === 0) {
    return null
  }

  const handleDeleteConfirm = () => {
    if (selectedIds.length > 0) {
      onBulkDelete(selectedIds)
    }
    setShowDeleteDialog(false)
  }

  const handleRatingConfirm = () => {
    if (selectedIds.length > 0) {
      onBulkUpdateRating(selectedIds, rating)
    }
    setShowRatingDialog(false)
    setRating(null)
  }

  const handleDatesConfirm = () => {
    if (selectedIds.length > 0) {
      onBulkUpdateDates(selectedIds, {
        startDate: startDate ? new Date(startDate) : null,
        finishDate: finishDate ? new Date(finishDate) : null,
      })
    }
    setShowDatesDialog(false)
    setStartDate('')
    setFinishDate('')
  }

  const handleStatusUpdate = (status: WatchStatus) => {
    const options: { startDate?: Date | null; finishDate?: Date | null } = {}
    
    if (status === 'WATCHING') {
      options.startDate = new Date()
    } else if (status === 'COMPLETED') {
      options.finishDate = new Date()
    }
    
    onBulkUpdateStatus(selectedIds, status, options)
  }

  const handleBulkAction = (action: () => void) => {
    if (selectedIds.length > 0 && !isLoading) {
      action()
    }
  }

  return (
    <>
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between gap-4">
          {/* Selection Info */}
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="font-medium">
              {selectedCount} selected
            </Badge>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={allSelected ? onSelectNone : onSelectAll}
                disabled={isLoading}
                className="h-8 px-2"
              >
                {allSelected ? (
                  <>
                    <CheckSquare className="h-4 w-4 mr-1" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4 mr-1" />
                    Select All
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onSelectNone}
                disabled={isLoading}
                className="h-8 px-2"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Status Updates */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusUpdate('COMPLETED')}
              disabled={isLoading || selectedCount === 0}
              className="h-8"
            >
              <Check className="h-4 w-4 mr-1" />
              Mark Completed
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusUpdate('WATCHING')}
              disabled={isLoading || selectedCount === 0}
              className="h-8"
            >
              <Play className="h-4 w-4 mr-1" />
              Mark Watching
            </Button>
            
            <Separator orientation="vertical" className="h-6" />

            {/* More Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLoading || selectedCount === 0}
                  className="h-8"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleStatusUpdate('PLANNED')}>
                  <Clock className="h-4 w-4 mr-2" />
                  Mark as Planned
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusUpdate('PAUSED')}>
                  <Pause className="h-4 w-4 mr-2" />
                  Mark as Paused
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusUpdate('DROPPED')}>
                  <StopCircle className="h-4 w-4 mr-2" />
                  Mark as Dropped
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Update Details</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setShowRatingDialog(true)}>
                  <Star className="h-4 w-4 mr-2" />
                  Update Rating
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDatesDialog(true)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Update Dates
                </DropdownMenuItem>
                
                {mediaType === 'TV' && onBulkUpdateTVShowDetails && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleBulkAction(() => onBulkUpdateTVShowDetails(selectedIds))}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh TV Details
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove from Library
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Selected Items</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedCount} item{selectedCount > 1 ? 's' : ''} from your library? 
              This action cannot be undone and will also remove all associated notes and progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove {selectedCount} Item{selectedCount > 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Rating</DialogTitle>
            <DialogDescription>
              Set a rating for {selectedCount} selected item{selectedCount > 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rating">Rating (1-10) or leave empty to clear</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="10"
                value={rating || ''}
                onChange={(e) => setRating(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Enter rating..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRatingConfirm}>
              Update Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dates Dialog */}
      <Dialog open={showDatesDialog} onOpenChange={setShowDatesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Dates</DialogTitle>
            <DialogDescription>
              Set start and finish dates for {selectedCount} selected item{selectedCount > 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="finishDate">Finish Date</Label>
              <Input
                id="finishDate"
                type="date"
                value={finishDate}
                onChange={(e) => setFinishDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDatesDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDatesConfirm}>
              Update Dates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}