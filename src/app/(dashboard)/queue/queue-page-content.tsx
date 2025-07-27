'use client'

import { SimpleQueueList } from '@/components/features/queue/simple-queue-list'
import { useQueue } from '@/hooks/use-queue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, ListPlus, Clock, History } from 'lucide-react'
import Link from 'next/link'

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
  } = useQueue()

  const activeQueue = queueItems.filter((item) => !item.watched)
  const completedQueue = queueItems.filter((item) => item.watched)

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
                    : 'Nothing queued'
                  }
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
                <p className="text-2xl font-bold">{completedQueue.length + watchHistory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Content Button */}
      {activeQueue.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <ListPlus className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Start building your queue</h3>
                <p className="text-muted-foreground max-w-md">
                  Search for movies and TV shows to add them to your watch queue. 
                  You can reorder items and track your progress as you watch.
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/search">
                    <Plus className="h-4 w-4 mr-2" />
                    Browse Content
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">
                    View Library
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
      />
    </div>
  )
}