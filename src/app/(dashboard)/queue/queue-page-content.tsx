'use client'

import { SimpleQueueList } from '@/components/features/queue/simple-queue-list'
import { useQueue } from '@/hooks/use-queue'
import { Card, CardContent } from '@/components/ui/card'
import { ListPlus, Clock, History } from 'lucide-react'

export function QueuePageContent() {
  const {
    queueItems,
    watchHistory,
    isLoading,
    isReordering,
    reorderQueue,
    removeFromQueue,
    markAsWatched,
    clearWatchedItems,
    clearQueue,
  } = useQueue()

  const activeQueue = queueItems.filter(item => !item.watched)

  return (
    <div className="space-y-6">
      {/* Queue Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <ListPlus className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">In Queue</p>
                <p className="text-2xl font-bold">{activeQueue.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Next Up</p>
                <p className="text-sm text-muted-foreground truncate">
                  {activeQueue.length > 0
                    ? activeQueue[0]?.title || 'Unknown'
                    : 'Nothing queued'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Completed</p>
                <p className="text-2xl font-bold">{watchHistory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue List */}
      <SimpleQueueList
        queueItems={queueItems}
        watchedItems={watchHistory}
        isLoading={isLoading}
        isReordering={isReordering}
        onReorder={reorderQueue}
        onRemove={removeFromQueue}
        onMarkWatched={markAsWatched}
        onClearWatched={clearWatchedItems}
        onClearQueue={clearQueue}
      />
    </div>
  )
}
