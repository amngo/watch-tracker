'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SimpleQueueItem } from './simple-queue-item'
import { EmptyState } from '@/components/common/empty-state'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import type { QueueItem } from '@/types'
import { ListPlus, History, Trash2 } from 'lucide-react'
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

interface SimpleQueueListProps {
  queueItems: QueueItem[]
  watchedItems: QueueItem[]
  isLoading?: boolean
  isReordering?: boolean
  onReorder: (itemId: string, newPosition: number) => void
  onRemove: (id: string) => void
  onMarkWatched: (id: string) => void
  onClearWatched: () => void
}

export function SimpleQueueList({
  queueItems,
  watchedItems,
  isLoading = false,
  onReorder,
  onRemove,
  onMarkWatched,
  onClearWatched,
}: SimpleQueueListProps) {
  const [activeTab, setActiveTab] = useState('queue')
  const [showClearDialog, setShowClearDialog] = useState(false)

  const activeQueue = queueItems.filter((item) => !item.watched)
  const completedQueue = queueItems.filter((item) => item.watched)

  const handleMoveUp = (itemId: string) => {
    const item = activeQueue.find(i => i.id === itemId)
    if (item && item.position > 1) {
      onReorder(itemId, item.position - 1)
    }
  }

  const handleMoveDown = (itemId: string) => {
    const item = activeQueue.find(i => i.id === itemId)
    if (item && item.position < activeQueue.length) {
      onReorder(itemId, item.position + 1)
    }
  }

  const handleClearWatched = () => {
    onClearWatched()
    setShowClearDialog(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
              {(completedQueue.length > 0 || watchedItems.length > 0) && (
                <span className="ml-2 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
                  {completedQueue.length + watchedItems.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {activeTab === 'history' && (completedQueue.length > 0 || watchedItems.length > 0) && (
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

        <TabsContent value="queue" className="mt-6">
          {activeQueue.length === 0 ? (
            <EmptyState
              icon={ListPlus}
              title="Your queue is empty"
              description="Add movies and TV episodes to start building your watch queue."
            >
              <Button variant="outline">
                <ListPlus className="h-4 w-4 mr-2" />
                Browse Media
              </Button>
            </EmptyState>
          ) : (
            <div className="space-y-3">
              {activeQueue.map((item) => (
                <SimpleQueueItem
                  key={item.id}
                  item={item}
                  onRemove={onRemove}
                  onMarkWatched={onMarkWatched}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  canMoveUp={item.position > 1}
                  canMoveDown={item.position < activeQueue.length}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {completedQueue.length === 0 && watchedItems.length === 0 ? (
            <EmptyState
              icon={History}
              title="No watch history"
              description="Items you mark as watched will appear here."
            />
          ) : (
            <div className="space-y-3">
              {/* Completed queue items */}
              {completedQueue.map((item) => (
                <SimpleQueueItem
                  key={item.id}
                  item={item}
                  onRemove={onRemove}
                  onMarkWatched={onMarkWatched}
                />
              ))}
              
              {/* Additional watched items from history */}
              {watchedItems.map((item) => (
                <SimpleQueueItem
                  key={item.id}
                  item={item}
                  onRemove={onRemove}
                  onMarkWatched={onMarkWatched}
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
              Are you sure you want to clear all watched items from your history?
              This action cannot be undone.
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
    </div>
  )
}