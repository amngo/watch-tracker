import {
  BarChart3,
  Bell,
  FileText,
  Home,
  Library,
  ListOrdered,
  Search,
  Settings,
  User,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Search & Add', href: '/search', icon: Search },
  { name: 'Queue', href: '/queue', icon: ListOrdered, badgeKey: 'queue' },
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
  { name: 'Releases', href: '/releases', icon: Bell },
  { name: 'Notes', href: '/notes', icon: FileText, badgeKey: 'notes' },
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
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
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
                                    <span>{subItem.name}</span>
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
      </SidebarContent>
    </Sidebar>
  )
}
