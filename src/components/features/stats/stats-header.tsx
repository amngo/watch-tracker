import { BarChart3 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all'

interface StatsHeaderProps {
  timeRange: TimeRange
  onTimeRangeChange: (timeRange: TimeRange) => void
}

export function StatsHeader({ timeRange, onTimeRangeChange }: StatsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Statistics</h1>
          <p className="text-muted-foreground mt-1">
            Your viewing insights and analytics
          </p>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Period:</span>
        <Tabs
          value={timeRange}
          onValueChange={value => onTimeRangeChange(value as TimeRange)}
        >
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}