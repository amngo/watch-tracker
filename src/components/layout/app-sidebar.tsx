import {
  BarChart3,
  Bell,
  FileText,
  Home,
  Library,
  ListOrdered,
  Play,
  Search,
  Settings,
  User,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { NavigationItem } from '@/types'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible'
import { useNavigationCounts } from '@/hooks/use-navigation-counts'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { UpNext } from '@/components/common/up-next'
import { TutorialStep } from '../tutorial/tutorial-step'

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  {
    name: 'Search & Add',
    href: '/search',
    icon: Search,
    tutorial: {
      id: 'search-tutorial',
      message: 'Search for movies and shows to add to your library.',
      order: 1,
    },
  },
  {
    name: 'Library',
    href: '/library',
    icon: Library,
    badgeKey: 'library',
    subItems: [
      { name: 'Movies', href: '/library/movies' },
      { name: 'TV Shows', href: '/library/tv-shows' },
    ],
  },
  {
    name: 'Queue',
    href: '/queue',
    icon: ListOrdered,
    badgeKey: 'queue',
    tutorial: {
      id: 'queue-tutorial',
      message: 'View and manage your watch queue.',
      order: 2,
    },
  },
  {
    name: 'Releases',
    href: '/releases',
    icon: Bell,
    tutorial: {
      id: 'releases-tutorial',
      message: 'Stay updated with upcoming movie and TV show releases.',
      order: 3,
    },
  },
  {
    name: 'Notes',
    href: '/notes',
    icon: FileText,
    badgeKey: 'notes',
    tutorial: {
      id: 'notes-tutorial',
      message: 'Keep track of your thoughts and notes.',
      order: 4,
    },
  },
  {
    name: 'Statistics',
    href: '/stats',
    icon: BarChart3,
    subItems: [
      { name: 'Overview', href: '/stats/overview' },
      { name: 'Activity', href: '/stats/activity' },
      { name: 'Patterns', href: '/stats/patterns' },
      { name: 'Achievements', href: '/stats/achievements' },
    ],
  },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function AppSidebar() {
  const { counts } = useNavigationCounts()
  const pathname = usePathname()
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 h-12">
          <div className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-2">
            <Play className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold">Watch Tracker</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Navigation Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map(item => {
                if (item.subItems) {
                  return (
                    <Collapsible
                      defaultOpen
                      className="group/collapsible"
                      key={item.name}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            {item.icon && <item.icon />}
                            <span>{item.name}</span>
                            {item.badgeKey && (
                              <SidebarMenuBadge>
                                {counts[item.badgeKey]}
                              </SidebarMenuBadge>
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.subItems.map(subItem => (
                              <SidebarMenuSubItem key={subItem.name}>
                                <SidebarMenuButton
                                  isActive={pathname === subItem.href}
                                  asChild
                                >
                                  <Link href={subItem.href}>
                                    {subItem.icon && <subItem.icon />}
                                    <span className="pl-4">{subItem.name}</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }
                if (item.tutorial) {
                  return (
                    <TutorialStep
                      key={item.name}
                      id={item.tutorial.id}
                      message={item.tutorial.message}
                      order={item.tutorial.order}
                    >
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                        >
                          <Link href={item.href}>
                            {item.icon && <item.icon />}
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                        {item.badgeKey && (
                          <SidebarMenuBadge>
                            {counts[item.badgeKey]}
                          </SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    </TutorialStep>
                  )
                }
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                    >
                      <Link href={item.href}>
                        {item.icon && <item.icon />}
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badgeKey && (
                      <SidebarMenuBadge>
                        {counts[item.badgeKey]}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>{' '}
      {/* Up Next Section */}
      <SidebarFooter>
        <UpNext />
      </SidebarFooter>
    </Sidebar>
  )
}
