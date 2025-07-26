import { Check, Clock, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { EpisodeWatchStatus } from '@/types'

interface EpisodeActionsProps {
  status: EpisodeWatchStatus
  onStatusChange: (status: EpisodeWatchStatus) => void
  variant?: 'grid' | 'list'
  className?: string
}

/**
 * Action buttons for changing episode watch status
 */
export function EpisodeActions({
  status,
  onStatusChange,
  variant = 'grid',
  className = '',
}: EpisodeActionsProps) {
  if (variant === 'grid') {
    return (
      <div className={`flex gap-1 pt-2 ${className}`}>
        <Button
          size="sm"
          variant={status === 'WATCHED' ? 'default' : 'outline'}
          onClick={() =>
            onStatusChange(status === 'WATCHED' ? 'UNWATCHED' : 'WATCHED')
          }
          className="flex-1 text-xs h-7"
        >
          <Check className="h-3 w-3 mr-1" />
          {status === 'WATCHED' ? 'Watched' : 'Mark Watched'}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="px-2 h-7">
              ⋯
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onStatusChange('WATCHED')}>
              <Check className="h-4 w-4 mr-2" />
              Mark as Watched
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange('SKIPPED')}>
              <SkipForward className="h-4 w-4 mr-2" />
              Mark as Skipped
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange('UNWATCHED')}>
              <Clock className="h-4 w-4 mr-2" />
              Mark as Unwatched
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className={`text-xs px-2 py-1 h-auto ${className}`}
        >
          Change Status
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onStatusChange('WATCHED')}>
          <Check className="h-4 w-4 mr-2" />
          Mark as Watched
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('SKIPPED')}>
          <SkipForward className="h-4 w-4 mr-2" />
          Mark as Skipped
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('UNWATCHED')}>
          <Clock className="h-4 w-4 mr-2" />
          Mark as Unwatched
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}