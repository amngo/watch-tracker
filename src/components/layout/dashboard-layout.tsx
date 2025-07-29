'use client'
import { PageTransition } from '@/components/common/page-transition'
import { Breadcrumb } from '@/components/common/breadcrumb'
import {
  Home,
  Search,
  BarChart3,
  User,
  Settings,
  Bell,
  FileText,
  ListOrdered,
  Library,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserButton } from '@clerk/nextjs'
import type { DashboardLayoutProps, NavigationItem } from '@/types'
import { SidebarProvider, SidebarTrigger } from '../ui/sidebar'
import { AppSidebar } from './app-sidebar'

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Search & Add', href: '/search', icon: Search },
  { name: 'Queue', href: '/queue', icon: ListOrdered, badgeKey: 'queue' },
  { name: 'Library', href: '/library', icon: Library, badgeKey: 'library' },
  { name: 'Releases', href: '/releases', icon: Bell },
  { name: 'Notes', href: '/notes', icon: FileText, badgeKey: 'notes' },
  { name: 'Statistics', href: '/stats', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function DashboardLayout({ children, stats }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="min-h-screen bg-background w-full">
        <div className="lg:flex">
          <div className="flex flex-col flex-1">
            {/* Desktop Header */}
            <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
              <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
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
    </SidebarProvider>
  )
}
