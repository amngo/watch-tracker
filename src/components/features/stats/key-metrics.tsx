import { Clock, Target, Star, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all'

const timeRangeLabels: Record<TimeRange, string> = {
  week: 'This Week',
  month: 'This Month',
  quarter: 'This Quarter',
  year: 'This Year',
  all: 'All Time',
}

interface KeyMetricsProps {
  timeRange: TimeRange
  watchTimeData: {
    hours: number
    minutes: number
    episodesWatched: number
  }
  completionRate: number
  averageRating: number | null
  itemsWithRatings: number
}

export function KeyMetrics({
  timeRange,
  watchTimeData,
  completionRate,
  averageRating,
  itemsWithRatings,
}: KeyMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Watch Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {watchTimeData.hours}h {watchTimeData.minutes}m
          </div>
          <p className="text-xs text-muted-foreground">
            Estimated for {timeRangeLabels[timeRange].toLowerCase()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate}%</div>
          <p className="text-xs text-muted-foreground">Of total items watched</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageRating || 'N/A'}</div>
          <p className="text-xs text-muted-foreground">
            From {itemsWithRatings} rated items
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Streak</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">7 days</div>
          <p className="text-xs text-muted-foreground">
            Current watching streak
          </p>
        </CardContent>
      </Card>
    </div>
  )
}