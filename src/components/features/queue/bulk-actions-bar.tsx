'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Check,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  CheckSquare,
  Square
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
import { useState } from 'react'

interface BulkActionsBarProps {
  selectedIds: string[]
  totalItems: number
  onSelectAll: () => void
  onSelectNone: () => void
  onBulkMarkAsWatched: (ids: string[]) => void
  onBulkRemove: (ids: string[]) => void
  onBulkMoveToTop: (ids: string[]) => void
  onBulkMoveToBottom: (ids: string[]) => void
  isLoading?: boolean
  showWatchedActions?: boolean
}

export function BulkActionsBar({
  selectedIds,
  totalItems,
  onSelectAll,
  onSelectNone,
  onBulkMarkAsWatched,
  onBulkRemove,
  onBulkMoveToTop,
  onBulkMoveToBottom,
  isLoading = false,
  showWatchedActions = true,
}: BulkActionsBarProps) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const selectedCount = selectedIds.length
  const allSelected = selectedCount === totalItems && totalItems > 0

  if (selectedCount === 0) {
    return null
  }

  const handleRemoveConfirm = () => {
    if (selectedIds.length > 0) {
      onBulkRemove(selectedIds)
    }
    setShowRemoveDialog(false)
  }

  const handleBulkAction = (action: (ids: string[]) => void) => {
    if (selectedIds.length > 0 && !isLoading) {
      action(selectedIds)
    }
  }

  return (
    <>
      <div className="sticky top-0 z-10 bg-primary/5 border-2 border-primary/20 rounded-lg p-3 mb-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          {/* Selection Info */}
          <div className="flex items-center gap-3">
            <Badge variant="default" className="font-medium bg-primary">
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
            {showWatchedActions && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction(onBulkMarkAsWatched)}
                  disabled={isLoading || selectedCount === 0}
                  className="h-8"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark Watched
                </Button>
                
                <Separator orientation="vertical" className="h-6" />
              </>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction(onBulkMoveToTop)}
              disabled={isLoading || selectedCount === 0}
              className="h-8"
            >
              <ArrowUp className="h-4 w-4 mr-1" />
              Move to Top
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction(onBulkMoveToBottom)}
              disabled={isLoading || selectedCount === 0}
              className="h-8"
            >
              <ArrowDown className="h-4 w-4 mr-1" />
              Move to Bottom
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRemoveDialog(true)}
              disabled={isLoading || selectedCount === 0}
              className="h-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Selected Items</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedCount} item{selectedCount > 1 ? 's' : ''} from your queue? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove {selectedCount} Item{selectedCount > 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}