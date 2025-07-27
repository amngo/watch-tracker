import { Search } from 'lucide-react'

export function SearchHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
          <Search className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Search & Discover</h1>
          <p className="text-muted-foreground mt-1">
            Find new movies and TV shows to add to your watchlist
          </p>
        </div>
      </div>
    </div>
  )
}