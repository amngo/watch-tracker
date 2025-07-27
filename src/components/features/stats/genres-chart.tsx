import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { ChartConfig } from '@/components/ui/chart'

interface GenreData {
  name: string
  count: number
  color: string
}

interface GenresChartProps {
  data: GenreData[]
}

export function GenresChart({ data }: GenresChartProps) {
  if (!data || data.length === 0) return null

  const config = data.reduce(
    (acc, genre) => ({
      ...acc,
      [genre.name.toLowerCase()]: {
        label: genre.name,
        color: genre.color,
      },
    }),
    {} as ChartConfig
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Most Watched Genres
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[300px] w-full">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              fill="var(--chart-1)"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}