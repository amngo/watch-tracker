'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useMedia } from '@/hooks/use-media'
import { useOptimisticStatus, OptimisticIndicator } from '@/components/ui/optimistic-indicator'
import { OptimisticUpdateBoundary } from '@/components/common/optimistic-update-boundary'
import { CheckCircle, XCircle, Clock, Play, Trash2 } from 'lucide-react'

// Mock TMDB media item for testing
const mockMediaItem = {
  id: 123456,
  title: 'Test Movie',
  media_type: 'movie' as const,
  poster_path: '/test-poster.jpg',
  release_date: '2023-01-01',
  overview: 'A test movie for optimistic updates',
  vote_average: 7.5,
  adult: false,
  vote_count: 100,
}

export function OptimisticUpdatesTest() {
  const media = useMedia()
  const [testResults, setTestResults] = useState<{
    create: 'idle' | 'success' | 'error'
    update: 'idle' | 'success' | 'error'
    delete: 'idle' | 'success' | 'error'
  }>({
    create: 'idle',
    update: 'idle',
    delete: 'idle'
  })

  const { status: createStatus, setPending: setCreatePending, setSuccess: setCreateSuccess, setError: setCreateError } = useOptimisticStatus()
  const { status: updateStatus, setPending: setUpdatePending, setSuccess: setUpdateSuccess, setError: setUpdateError } = useOptimisticStatus()
  const { status: deleteStatus, setPending: setDeletePending, setSuccess: setDeleteSuccess, setError: setDeleteError } = useOptimisticStatus()

  const testOptimisticCreate = async () => {
    setCreatePending()
    setTestResults(prev => ({ ...prev, create: 'idle' }))
    
    try {
      await media.addMedia(mockMediaItem)
      setCreateSuccess()
      setTestResults(prev => ({ ...prev, create: 'success' }))
    } catch (error) {
      setCreateError()
      setTestResults(prev => ({ ...prev, create: 'error' }))
    }
  }

  const testOptimisticUpdate = async () => {
    if (media.watchedItems.length === 0) return
    
    setUpdatePending()
    setTestResults(prev => ({ ...prev, update: 'idle' }))
    
    try {
      const firstItem = media.watchedItems[0]
      await media.markCompleted(firstItem.id)
      setUpdateSuccess()
      setTestResults(prev => ({ ...prev, update: 'success' }))
    } catch (error) {
      setUpdateError()
      setTestResults(prev => ({ ...prev, update: 'error' }))
    }
  }

  const testOptimisticDelete = async () => {
    if (media.watchedItems.length === 0) return
    
    setDeletePending()
    setTestResults(prev => ({ ...prev, delete: 'idle' }))
    
    try {
      const firstItem = media.watchedItems[0]
      await media.deleteItem(firstItem.id)
      setDeleteSuccess()
      setTestResults(prev => ({ ...prev, delete: 'success' }))
    } catch (error) {
      setDeleteError()
      setTestResults(prev => ({ ...prev, delete: 'error' }))
    }
  }

  const forceRollback = () => {
    // Test rollback by clearing all optimistic updates
    media.clearOptimisticUpdates()
  }

  return (
    <OptimisticUpdateBoundary>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Optimistic Updates Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current State */}
          <div>
            <h3 className="font-medium mb-2">Current State</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Items:</span>
                <span className="ml-2 font-medium">{media.watchedItems.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Loading:</span>
                <span className="ml-2 font-medium">{media.itemsLoading ? 'Yes' : 'No'}</span>
              </div>
            </div>
            
            {media.itemsError && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{media.itemsError}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Test Controls */}
          <div className="space-y-4">
            <h3 className="font-medium">Test Operations</h3>
            
            {/* Create Test */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="font-medium">Create Item</span>
                <OptimisticIndicator status={createStatus} />
              </div>
              <div className="flex items-center gap-2">
                {testResults.create === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {testResults.create === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                <Button 
                  onClick={testOptimisticCreate} 
                  size="sm"
                  disabled={createStatus === 'pending'}
                >
                  Test Create
                </Button>
              </div>
            </div>

            {/* Update Test */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="font-medium">Update Item</span>
                <OptimisticIndicator status={updateStatus} />
              </div>
              <div className="flex items-center gap-2">
                {testResults.update === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {testResults.update === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                <Button 
                  onClick={testOptimisticUpdate} 
                  size="sm"
                  disabled={updateStatus === 'pending' || media.watchedItems.length === 0}
                >
                  Test Update
                </Button>
              </div>
            </div>

            {/* Delete Test */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="font-medium">Delete Item</span>
                <OptimisticIndicator status={deleteStatus} />
              </div>
              <div className="flex items-center gap-2">
                {testResults.delete === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {testResults.delete === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                <Button 
                  onClick={testOptimisticDelete} 
                  size="sm" 
                  variant="destructive"
                  disabled={deleteStatus === 'pending' || media.watchedItems.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Test Delete
                </Button>
              </div>
            </div>
          </div>

          {/* Utility Controls */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={forceRollback} 
              variant="outline" 
              size="sm"
            >
              Force Rollback
            </Button>
            <Button 
              onClick={() => media.resetErrors()} 
              variant="outline" 
              size="sm"
            >
              Clear Errors
            </Button>
          </div>

          {/* Recent Items Display */}
          {media.watchedItems.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Recent Items</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {media.watchedItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                    <span className="truncate">{item.title}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {item.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </OptimisticUpdateBoundary>
  )
}