'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ViewingHeatmap } from '@/components/features/stats/viewing-heatmap'
import { api } from '@/trpc/react'
import type { TimeRange } from '@/types'

export default function PatternsPage() {
  const [timeRange] = useState<TimeRange>('month')

  const { data: activityData } = api.stats.activity.useQuery({
    timeRange,
    groupBy:
      timeRange === 'week' ? 'day' : timeRange === 'month' ? 'day' : 'month',
  })

  const { data: overviewData } = api.stats.overview.useQuery({
    timeRange,
  })

  // Generate heatmap data (simplified version)
  const heatmapData = useMemo(() => {
    if (!activityData) return []

    const data = []
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const hours = Array.from({ length: 24 }, (_, i) => i)

    // Generate mock data for demonstration
    // In a real implementation, you'd track actual viewing times
    for (const day of daysOfWeek) {
      for (const hour of hours) {
        const activity = Math.floor(Math.random() * 5) // 0-4 scale
        data.push({
          day,
          hour,
          activity,
          dayIndex: daysOfWeek.indexOf(day),
        })
      }
    }

    return data
  }, [activityData])

  return (
    <div className="space-y-6">
      <ViewingHeatmap data={heatmapData} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Viewing Habits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Peak Viewing Time</span>
              <Badge>8-10 PM</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Favorite Day</span>
              <Badge>Saturday</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Binge Sessions</span>
              <Badge>12 this month</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Avg Episode Length</span>
              <Badge>45 min</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Avg Movie Length</span>
              <Badge>2h 15m</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Completion Rate</span>
              <Badge>{overviewData?.overview.completionRate || 0}%</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}