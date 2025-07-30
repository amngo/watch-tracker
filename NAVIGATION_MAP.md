# 🗺️ Watch Tracker - Navigation Map

## 📍 Site Structure

### Primary Navigation Routes

```
/ (Landing)
├── /dashboard (Main Dashboard)
├── /library (Media Library)
│   ├── /movies (Movie Library)
│   └── /tv-shows (TV Show Library)
├── /search (Search & Discovery)
├── /queue (Watch Queue)
├── /stats (Statistics & Analytics)
│   ├── /overview (Statistics Overview)
│   ├── /activity (Activity Tracking)
│   ├── /achievements (Achievements)
│   └── /patterns (Viewing Patterns)
├── /notes (Notes Management)
├── /releases (Upcoming Releases)
├── /profile (User Profile)
├── /sign-in (Authentication)
└── /sign-up (Registration)
```

### Detailed Media Routes

```
/movie/[id] (Movie Details)
├── /notes (Movie Notes)

/tv/[id] (TV Show Details)
├── /notes (Show Notes)
└── /season/[season_number] (Season Details)
```

## 🧭 Component Navigation Map

### Layout Components

```
App Layout (src/app/layout.tsx)
├── Dashboard Layout (src/components/layout/dashboard-layout.tsx)
│   ├── App Sidebar (src/components/layout/app-sidebar.tsx)
│   └── Page Content
└── Library Layout (src/app/library/layout.tsx)
    └── Stats Layout (src/app/stats/layout.tsx)
```

### Feature Component Hierarchy

```
Components (src/components/)
├── ui/ (ShadCN Base Components)
│   ├── media-poster.tsx
│   ├── media-badges.tsx
│   ├── progress-display.tsx
│   ├── navigation-badge.tsx
│   └── optimistic-indicator.tsx
├── layout/ (Layout Components)
│   ├── app-sidebar.tsx
│   └── dashboard-layout.tsx
├── common/ (Shared Components)
│   ├── loading-states.tsx
│   ├── error-boundary.tsx
│   ├── page-transition.tsx
│   ├── breadcrumb.tsx
│   ├── empty-state.tsx
│   ├── loading-grid.tsx
│   ├── page-header.tsx
│   ├── section-header.tsx
│   ├── stats-card.tsx
│   └── add-media-modal.tsx
├── features/ (Feature-Specific)
│   ├── search/
│   │   ├── media-search.tsx
│   │   ├── search-results.tsx
│   │   ├── search-filters.tsx
│   │   ├── search-interface.tsx
│   │   ├── media-result-card.tsx
│   │   ├── empty-search-state.tsx
│   │   ├── active-filters.tsx
│   │   └── search-header.tsx
│   ├── media/
│   │   └── watched-item-card.tsx
│   ├── tv/
│   │   ├── episode-tracker.tsx
│   │   ├── season-overview.tsx
│   │   ├── flexible-episode-tracker.tsx
│   │   ├── flexible-season-overview.tsx
│   │   ├── progress-update-dialog.tsx
│   │   ├── tv-show-card.tsx
│   │   └── episode/
│   │       ├── episode-card-grid.tsx
│   │       ├── episode-card-list.tsx
│   │       ├── episode-item.tsx
│   │       ├── episode-actions.tsx
│   │       ├── episode-overview.tsx
│   │       ├── episode-metadata.tsx
│   │       ├── episode-status-badge.tsx
│   │       ├── season-progress-header.tsx
│   │       ├── next-episode-banner.tsx
│   │       ├── quick-edit-form.tsx
│   │       ├── add-episode-note-button.tsx
│   │       └── spoiler-toggle.tsx
│   ├── stats/
│   │   ├── key-metrics.tsx
│   │   ├── detailed-stats.tsx
│   │   ├── activity-chart.tsx
│   │   ├── viewing-heatmap.tsx
│   │   ├── content-type-chart.tsx
│   │   ├── genres-chart.tsx
│   │   ├── status-distribution-chart.tsx
│   │   ├── achievements-panel.tsx
│   │   └── stats-header.tsx
│   ├── queue/
│   │   ├── simple-queue-list.tsx
│   │   ├── simple-queue-item.tsx
│   │   ├── bulk-actions-bar.tsx
│   │   └── add-to-queue-button.tsx
│   ├── notes/
│   │   ├── note-card.tsx
│   │   └── add-note-form.tsx
│   ├── profile/
│   │   └── user-profile-form.tsx
│   ├── releases/
│   │   ├── releases-calendar.tsx
│   │   └── upcoming-releases.tsx
│   └── library/
│       └── library-bulk-actions-bar.tsx
└── providers/ (Context Providers)
    ├── store-provider.tsx
    ├── transition-provider.tsx
    └── toast-provider.tsx
```

## 🔗 State Management Navigation

### Store Hierarchy

```
Stores (src/stores/)
├── index.ts (Store Exports)
├── app-store.ts (Global App State)
├── user-store.ts (User Data & Preferences)
├── ui-store.ts (UI State & Modals)
└── media-store.ts (Media Data & Stats)
```

### Hook Integration

```
Hooks (src/hooks/)
├── use-media.ts (Media Store Hook)
├── use-search.ts (Search Functionality)
├── use-ui.ts (UI Store Hook)
├── use-queue.ts (Queue Management)
├── use-optimistic-updates.ts (Optimistic UI)
├── use-episode-actions.ts (Episode Operations)
├── use-status-actions.ts (Status Changes)
├── use-navigation-counts.ts (Badge Counts)
├── use-breadcrumb-data.ts (Navigation Context)
├── use-episode-spoiler-state.ts (Spoiler Management)
├── use-episode-name.ts (Episode Utilities)
├── use-background-updates.ts (Background Sync)
├── use-local-storage-state.ts (Persistence)
├── use-debounce.ts (Input Debouncing)
└── use-mobile.ts (Responsive Detection)
```

## 🛠 API Navigation Structure

### tRPC Router Hierarchy

```
API (src/server/api/)
├── root.ts (Router Configuration)
├── trpc.ts (tRPC Setup)
└── routers/
    ├── search.ts (TMDB Search)
    ├── watchedItem.ts (Media Tracking)
    ├── note.ts (Notes Management)
    ├── user.ts (User Profiles)
    ├── stats.ts (Analytics)
    ├── queue.ts (Watch Queue)
    └── releases.ts (Upcoming Releases)
```

### API Endpoint Map

| Router | Endpoints | Purpose |
|--------|-----------|---------|
| **search** | `search`, `details`, `trending`, `searchWatched`, `recentSearches` | TMDB integration |
| **watchedItem** | `getAll`, `getById`, `create`, `update`, `delete`, `bulkUpdate` | Media tracking |
| **note** | `getAll`, `getById`, `create`, `update`, `delete` | Notes CRUD |
| **user** | `getProfile`, `updateProfile`, `getPublicWatchlist` | User management |
| **stats** | `overview`, `activity`, `achievements`, `export` | Analytics |
| **queue** | `getAll`, `add`, `remove`, `reorder`, `bulkActions` | Queue management |
| **releases** | `upcoming`, `calendar` | Release tracking |

## 📱 User Journey Navigation

### Authentication Flow

```
Unauthenticated User
├── / (Landing Page)
├── /sign-in (Login)
└── /sign-up (Registration)
    ↓
Authenticated User → /dashboard
```

### Core User Journeys

#### 1. Adding New Media
```
/search → Search Results → Add to Library → /library or /dashboard
```

#### 2. Tracking Progress
```
/library → Media Item → Update Progress → Episode Tracker (TV) or Runtime (Movie)
```

#### 3. Managing Queue
```
/queue → Reorder Items → Mark Watched → Auto-remove or Keep
```

#### 4. Adding Notes
```
Media Detail Page → Add Note → Timestamp Selection → Save
```

#### 5. Viewing Statistics
```
/stats → Overview/Activity/Achievements/Patterns → Export Data
```

## 🔍 Development Navigation

### File Organization Patterns

#### Pages (App Router)
```
src/app/
├── (route-groups)/ (Grouped routes)
├── [dynamic]/ (Dynamic segments)  
├── [[...catch-all]]/ (Catch-all routes)
├── page.tsx (Route component)
├── layout.tsx (Route layout)
└── loading.tsx (Loading UI)
```

#### Component Structure
```
src/components/[category]/[feature]/
├── index.ts (Exports)
├── [component].tsx (Main component)
├── [component].test.tsx (Tests)
└── [sub-components]/ (Related components)
```

#### Utility Organization
```
src/lib/
├── [domain].ts (Domain utilities)
├── constants/[category].ts (Constants)
└── [integration].ts (External integrations)
```

## 🎯 Quick Access Reference

### Frequently Modified Files

| Task | Primary Files |
|------|---------------|
| **Add New Route** | `src/app/[route]/page.tsx`, `src/components/layout/app-sidebar.tsx` |
| **New Feature Component** | `src/components/features/[feature]/`, `src/hooks/use-[feature].ts` |
| **API Changes** | `src/server/api/routers/[router].ts`, `src/types/index.ts` |
| **State Updates** | `src/stores/[store].ts`, `src/hooks/use-[hook].ts` |
| **UI Components** | `src/components/ui/[component].tsx` |
| **Database Schema** | `prisma/schema.prisma` |
| **Styling Changes** | `src/app/globals.css`, `tailwind.config.ts` |

### Common Development Paths

1. **Feature Development**: `types/` → `server/api/routers/` → `components/features/` → `hooks/` → `app/`
2. **UI Enhancement**: `components/ui/` → `components/features/` → styling updates
3. **API Extension**: `server/api/routers/` → `types/` → client components
4. **State Management**: `stores/` → `hooks/` → component integration

### Testing Navigation

```
src/__tests__/ (Test files)
├── components/ (Component tests)
├── hooks/ (Hook tests)
├── utils/ (Utility tests)
└── api/ (API tests)
```

---

This navigation map serves as a comprehensive guide for understanding the project structure, component relationships, and development workflows in the Watch Tracker application.