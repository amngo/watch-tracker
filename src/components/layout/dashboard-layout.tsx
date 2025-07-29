'use client'
import { PageTransition } from '@/components/common/page-transition'
import { Breadcrumb } from '@/components/common/breadcrumb'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserButton } from '@clerk/nextjs'
import type { DashboardLayoutProps } from '@/types'
import { SidebarProvider, SidebarTrigger } from '../ui/sidebar'
import { AppSidebar } from './app-sidebar'

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="min-h-screen bg-background w-full flex flex-col">
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

        <PageTransition className="py-6 px-4 lg:px-6">
          {children}
        </PageTransition>
      </div>
    </SidebarProvider>
  )
}
