'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { PageTransition } from '@/components/common/page-transition'
import { NavigationTransitionLink } from '@/components/common/transition-link'
import { Breadcrumb, BreadcrumbCompact } from '@/components/common/breadcrumb'
import {
  Home,
  Search,
  Film,
  Tv,
  BarChart3,
  User,
  Settings,
  Menu,
  Bell,
  FileText,
  ListOrdered,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { UserButton } from '@clerk/nextjs'
import { NavigationBadge } from '@/components/ui/navigation-badge'
import { useNavigationCounts } from '@/hooks/use-navigation-counts'
import type { DashboardLayoutProps, NavigationItem } from '@/types'

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Search & Add', href: '/search', icon: Search },
  { name: 'Queue', href: '/queue', icon: ListOrdered, badgeKey: 'queue' },
  { name: 'Movies', href: '/movies', icon: Film, badgeKey: 'movies' },
  { name: 'TV Shows', href: '/tv', icon: Tv, badgeKey: 'tvShows' },
  { name: 'Releases', href: '/releases', icon: Bell },
  { name: 'Notes', href: '/notes', icon: FileText, badgeKey: 'notes' },
  { name: 'Statistics', href: '/stats', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function DashboardLayout({ children, stats }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { counts } = useNavigationCounts()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    📺 Watch Tracker
                  </SheetTitle>
                </SheetHeader>
                <MobileNavigation
                  navigation={navigation}
                  pathname={pathname}
                  stats={stats}
                  counts={counts}
                  onItemClick={() => setIsMobileMenuOpen(false)}
                />
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <h1 className="font-semibold">Watch Tracker</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <UserButton />
            </div>
          </div>
          {/* Mobile Breadcrumb */}
          <div className="px-4 py-2 border-b">
            <BreadcrumbCompact />
          </div>
        </header>
      </div>

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow pt-5 bg-card border-r overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold">📺 Watch Tracker</h1>
            </div>

            <DesktopNavigation
              navigation={navigation}
              pathname={pathname}
              stats={stats}
              counts={counts}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          {/* Desktop Header */}

          <header className="hidden lg:block sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <Breadcrumb />
              </div>

              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>

                <UserButton />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1">
            <PageTransition className="py-6 px-4 lg:px-6">
              {children}
            </PageTransition>
          </main>
        </div>
      </div>
    </div>
  )
}

function DesktopNavigation({
  navigation,
  pathname,
  stats,
  counts,
}: {
  navigation: NavigationItem[]
  pathname: string
  stats?: DashboardLayoutProps['stats']
  counts?: {
    queue: number
    movies: number
    tvShows: number
    notes: number
  }
}) {
  return (
    <div className="mt-8 flex-grow flex flex-col">
      <nav className="flex-1 space-y-1 px-2">
        {navigation.map(item => {
          const isActive = pathname.startsWith(item.href)
          const badgeCount = item.badgeKey && counts ? counts[item.badgeKey] : 0
          return (
            <NavigationTransitionLink
              key={item.name}
              href={item.href}
              isActive={isActive}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
              {item.badgeKey && (
                <NavigationBadge count={badgeCount} isActive={isActive} />
              )}
            </NavigationTransitionLink>
          )
        })}
      </nav>

      {/* Stats Summary */}
      {stats && (
        <div className="flex-shrink-0 p-4">
          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Quick Stats
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Items</span>
                <Badge variant="outline">{stats.totalItems}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Completed</span>
                <Badge variant="outline">{stats.completedItems}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Watching</span>
                <Badge variant="outline">{stats.currentlyWatching}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Notes</span>
                <Badge variant="outline">{stats.totalNotes}</Badge>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MobileNavigation({
  navigation,
  pathname,
  stats,
  counts,
  onItemClick,
}: {
  navigation: NavigationItem[]
  pathname: string
  stats?: DashboardLayoutProps['stats']
  counts?: {
    queue: number
    movies: number
    tvShows: number
    notes: number
  }
  onItemClick: () => void
}) {
  return (
    <div className="mt-6 flex-grow flex flex-col">
      <nav className="flex-1 space-y-1">
        {navigation.map(item => {
          const isActive = pathname.startsWith(item.href)
          const badgeCount = item.badgeKey && counts ? counts[item.badgeKey] : 0
          return (
            <NavigationTransitionLink
              key={item.name}
              href={item.href}
              isActive={isActive}
              onClick={onItemClick}
              className="px-3 py-2"
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
              {item.badgeKey && (
                <NavigationBadge count={badgeCount} isActive={isActive} />
              )}
            </NavigationTransitionLink>
          )
        })}
      </nav>

      {/* Mobile Stats */}
      {stats && (
        <div className="flex-shrink-0 mt-6">
          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Quick Stats
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center">
                <div className="text-lg font-semibold">{stats.totalItems}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {stats.completedItems}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {stats.currentlyWatching}
                </div>
                <div className="text-xs text-muted-foreground">Watching</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{stats.totalNotes}</div>
                <div className="text-xs text-muted-foreground">Notes</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
