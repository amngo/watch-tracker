import { Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function EmptySearchState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Start Searching</h3>
          <p className="text-muted-foreground mb-4">
            Search for movies and TV shows to add to your watchlist
          </p>
          <p className="text-sm text-muted-foreground">
            Use filters and sorting to find exactly what you're looking for
          </p>
        </div>
      </CardContent>
    </Card>
  )
}