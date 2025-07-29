'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SimpleQueueItem } from './simple-queue-item'
import { BulkActionsBar } from './bulk-actions-bar'
import { EmptyState } from '@/components/common/empty-state'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import type { QueueItem } from '@/types'
import { ListPlus, History, Trash2, Plus, CheckSquare } from 'lucide-react'
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
import Link from 'next/link'

interface SimpleQueueListProps {
  queueItems: QueueItem[]
  watchedItems: QueueItem[]
  isLoading?: boolean
  isReordering?: boolean
  onReorder: (itemId: string, newPosition: number) => void
  onRemove: (id: string) => void
  onMarkWatched: (id: string) => void
  onClearWatched: () => void
  onClearQueue: () => void
  // Bulk action props
  onBulkMarkAsWatched?: (ids: string[]) => void
  onBulkRemoveFromQueue?: (ids: string[]) => void
  onBulkMoveToTop?: (ids: string[]) => void
  onBulkMoveToBottom?: (ids: string[]) => void
}

export function SimpleQueueList({
  queueItems,
  watchedItems,
  isLoading = false,
  onReorder,
  onRemove,
  onMarkWatched,
  onClearWatched,
  onClearQueue,
  onBulkMarkAsWatched,
  onBulkRemoveFromQueue,
  onBulkMoveToTop,
  onBulkMoveToBottom,
}: SimpleQueueListProps) {
  const [activeTab, setActiveTab] = useState('queue')
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [showClearQueueDialog, setShowClearQueueDialog] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showBulkMode, setShowBulkMode] = useState(false)

  const activeQueue = queueItems.filter(item => !item.watched)
  const completedQueue = queueItems.filter(item => item.watched)

  // Selection handlers
  const handleSelectionChange = useCallback((id: string, selected: boolean) => {
    setSelectedIds(prev => 
      selected 
        ? [...prev, id]
        : prev.filter(selectedId => selectedId !== id)
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    const currentItems = activeTab === 'queue' ? activeQueue : watchedItems
    setSelectedIds(currentItems.map(item => item.id))
  }, [activeTab, activeQueue, watchedItems])

  const handleSelectNone = useCallback(() => {
    setSelectedIds([])
  }, [])

  const toggleBulkMode = useCallback(() => {
    setShowBulkMode(prev => !prev)
    if (showBulkMode) {
      setSelectedIds([])
    }
  }, [showBulkMode])

  // Bulk action handlers
  const handleBulkMarkAsWatched = useCallback((ids: string[]) => {
    if (onBulkMarkAsWatched) {
      onBulkMarkAsWatched(ids)
      setSelectedIds([])
    }
  }, [onBulkMarkAsWatched])

  const handleBulkRemove = useCallback((ids: string[]) => {
    if (onBulkRemoveFromQueue) {
      onBulkRemoveFromQueue(ids)
      setSelectedIds([])
    }
  }, [onBulkRemoveFromQueue])

  const handleBulkMoveToTop = useCallback((ids: string[]) => {
    if (onBulkMoveToTop) {
      onBulkMoveToTop(ids)
      setSelectedIds([])
    }
  }, [onBulkMoveToTop])

  const handleBulkMoveToBottom = useCallback((ids: string[]) => {
    if (onBulkMoveToBottom) {
      onBulkMoveToBottom(ids)
      setSelectedIds([])
    }
  }, [onBulkMoveToBottom])

  const handleMoveUp = (itemId: string) => {
    const item = activeQueue.find(i => i.id === itemId)
    if (item && item.position > 1) {
      onReorder(itemId, item.position - 1)
    }
  }

  const handleMoveDown = (itemId: string) => {
    const item = activeQueue.find(i => i.id === itemId)
    // Find the maximum position among active (unwatched) items
    const maxActivePosition = Math.max(...activeQueue.map(i => i.position), 0)
    if (item && item.position < maxActivePosition) {
      onReorder(itemId, item.position + 1)
    }
  }

  const handleClearWatched = () => {
    onClearWatched()
    setShowClearDialog(false)
  }

  const handleClearQueue = () => {
    onClearQueue()
    setShowClearQueueDialog(false)
  }

  // Clear selection when switching tabs
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
    setSelectedIds([])
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="queue" className="relative">
              Queue
              {activeQueue.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {activeQueue.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="relative">
              <History className="h-4 w-4 mr-1" />
              History
              {watchedItems.length > 0 && (
                <span className="ml-2 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
                  {watchedItems.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {/* Bulk Mode Toggle */}
            {(activeTab === 'queue' ? activeQueue.length > 0 : watchedItems.length > 0) && 
             onBulkMarkAsWatched && onBulkRemoveFromQueue && (
              <Button
                variant={showBulkMode ? "default" : "outline"}
                size="sm"
                onClick={toggleBulkMode}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                {showBulkMode ? "Exit Select" : "Select"}
              </Button>
            )}

            {/* Clear Actions */}
            {!showBulkMode && activeTab === 'queue' && activeQueue.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearQueueDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Queue
              </Button>
            )}

            {!showBulkMode && activeTab === 'history' &&
              (completedQueue.length > 0 || watchedItems.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClearDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear History
                </Button>
              )}
          </div>
        </div>

        <TabsContent value="queue" className="mt-6">
          {activeQueue.length === 0 ? (
            <EmptyState
              icon={ListPlus}
              title="Your queue is empty"
              description="Add movies and TV episodes to start building your watch queue."
            >
              <Button asChild>
                <Link href="/search">
                  <Plus className="h-4 w-4 mr-2" />
                  Browse Content
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">View Library</Link>
              </Button>
            </EmptyState>
          ) : (
            <div className="space-y-3">
              {/* Bulk Actions Bar */}
              {showBulkMode && (
                <BulkActionsBar
                  selectedIds={selectedIds}
                  totalItems={activeQueue.length}
                  onSelectAll={handleSelectAll}
                  onSelectNone={handleSelectNone}
                  onBulkMarkAsWatched={handleBulkMarkAsWatched}
                  onBulkRemove={handleBulkRemove}
                  onBulkMoveToTop={handleBulkMoveToTop}
                  onBulkMoveToBottom={handleBulkMoveToBottom}
                  isLoading={isLoading}
                  showWatchedActions={true}
                />
              )}

              {/* Queue Items */}
              {activeQueue.map(item => (
                <SimpleQueueItem
                  key={item.id}
                  item={item}
                  onRemove={onRemove}
                  onMarkWatched={onMarkWatched}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  canMoveUp={item.position > 1}
                  canMoveDown={item.position < activeQueue.length}
                  showSelection={showBulkMode}
                  isSelected={selectedIds.includes(item.id)}
                  onSelectionChange={handleSelectionChange}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {watchedItems.length === 0 ? (
            <EmptyState
              icon={History}
              title="No watch history"
              description="Items you mark as watched will appear here."
            />
          ) : (
            <div className="space-y-3">
              {/* Bulk Actions Bar for History */}
              {showBulkMode && (
                <BulkActionsBar
                  selectedIds={selectedIds}
                  totalItems={watchedItems.length}
                  onSelectAll={handleSelectAll}
                  onSelectNone={handleSelectNone}
                  onBulkMarkAsWatched={handleBulkMarkAsWatched}
                  onBulkRemove={handleBulkRemove}
                  onBulkMoveToTop={handleBulkMoveToTop}
                  onBulkMoveToBottom={handleBulkMoveToBottom}
                  isLoading={isLoading}
                  showWatchedActions={false} // Don't show "Mark Watched" for already watched items
                />
              )}

              {/* History Items */}
              {watchedItems.map(item => (
                <SimpleQueueItem
                  key={item.id}
                  item={item}
                  onRemove={onRemove}
                  onMarkWatched={onMarkWatched}
                  showSelection={showBulkMode}
                  isSelected={selectedIds.includes(item.id)}
                  onSelectionChange={handleSelectionChange}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Clear History Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Watch History</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all watched items from your
              history? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearWatched}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Queue Confirmation Dialog */}
      <AlertDialog
        open={showClearQueueDialog}
        onOpenChange={setShowClearQueueDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Queue</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all items from your queue? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearQueue}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear Queue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
