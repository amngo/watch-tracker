import { Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { ChartConfig } from '@/components/ui/chart'

type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all'

interface ActivityData {
  date: string
  completed: number
  movies: number
  tvShows: number
}

interface ActivityChartProps {
  data: ActivityData[]
  timeRange: TimeRange
  config: ChartConfig
}

export function ActivityChart({ data, timeRange, config }: ActivityChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Viewing Activity Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[300px]">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={value => {
                const date = new Date(value)
                return timeRange === 'week'
                  ? date.getDate().toString()
                  : date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
              }}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="completed"
              stackId="1"
              stroke="var(--chart-1)"
              fill="var(--chart-1)"
              fillOpacity={0.8}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}