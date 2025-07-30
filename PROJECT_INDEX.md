# 📺 Watch Tracker - Project Index

## 🌟 Overview

Watch Tracker is a modern web application for tracking movie and TV show progress with timestamped notes and social sharing features. Built with Next.js 15, TypeScript, and a full-stack architecture using tRPC, Prisma, and PostgreSQL.

## 🎯 Core Features

- **Progress Tracking**: Track movies by runtime and TV shows by episodes
- **Timestamped Notes**: Add detailed notes with specific timestamps
- **Personal Statistics**: Visualize viewing data and habits
- **Public Profiles**: Share watch lists with spoiler controls
- **Mobile-Friendly**: Responsive design with focus mode
- **TMDB Integration**: Rich metadata from The Movie Database

## 🛠 Technology Stack

### Frontend
- **Next.js 15** - App Router with Turbopack
- **TypeScript** - Type safety throughout
- **TailwindCSS** - Custom styling with ShadCN UI
- **Zustand** - State management
- **React Query** - Data fetching and caching

### Backend
- **tRPC** - Type-safe API routes
- **Prisma** - ORM with PostgreSQL
- **Clerk** - Authentication
- **Zod** - Runtime validation

### Development
- **ESLint + Prettier** - Code quality
- **Jest + Testing Library** - Unit tests
- **pnpm** - Package management

## 📁 Project Structure

### Core Directories

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Dashboard-specific routes
│   ├── api/               # API routes (tRPC)
│   ├── dashboard/         # Main dashboard
│   ├── library/           # Media library views
│   ├── movie/             # Movie detail pages
│   ├── tv/                # TV show detail pages
│   ├── stats/             # Statistics and analytics
│   ├── search/            # Search functionality
│   ├── notes/             # Notes management
│   ├── profile/           # User profile
│   ├── releases/          # Upcoming releases
│   └── sign-in|sign-up/   # Authentication
├── components/            # React components
│   ├── ui/               # ShadCN UI components
│   ├── layout/           # Layout components
│   ├── features/         # Feature-specific components
│   ├── common/           # Shared components
│   └── providers/        # Context providers
├── server/               # Server-side code
│   ├── api/             # tRPC routers
│   └── db.ts           # Database connection  
├── stores/              # Zustand state management
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── types/               # TypeScript definitions
└── trpc/               # tRPC configuration
```

## 🗂 API Architecture

### tRPC Routers

| Router | File | Purpose |
|--------|------|---------|
| `search` | `/server/api/routers/search.ts` | TMDB search, trending content |
| `watchedItem` | `/server/api/routers/watchedItem.ts` | Media tracking CRUD |
| `note` | `/server/api/routers/note.ts` | Notes management |
| `user` | `/server/api/routers/user.ts` | Profile & public data |
| `stats` | `/server/api/routers/stats.ts` | Analytics & achievements |
| `queue` | `/server/api/routers/queue.ts` | Watch queue management |
| `releases` | `/server/api/routers/releases.ts` | Upcoming releases |

### Key API Features

- **Type Safety**: End-to-end TypeScript with tRPC
- **Rate Limiting**: IP and user-based limits
- **Caching**: In-memory cache with TTL
- **Error Handling**: Standardized error format
- **Authentication**: Clerk integration

## 📊 Database Schema

### Core Models

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `User` | User accounts | `clerkId`, `username`, `email`, `isPublic` |
| `WatchedItem` | Media tracking | `tmdbId`, `mediaType`, `status`, `progress` |
| `Note` | User notes | `content`, `timestamp`, `hasSpoilers` |
| `WatchedEpisode` | Episode tracking | `seasonNumber`, `episodeNumber`, `status` |
| `QueueItem` | Watch queue | `position`, `contentType`, `watched` |
| `Profile` | Public profiles | `isPublic`, `showSpoilers`, `bio` |

### Relationships

- Users have many WatchedItems, Notes, QueueItems
- WatchedItems have many Notes and WatchedEpisodes
- Profiles are 1:1 with Users

## 🎨 Component Architecture

### UI Components (`/components/ui/`)

| Component | Purpose |
|-----------|---------|
| `media-poster.tsx` | Media poster display |
| `media-badges.tsx` | Status/rating badges |
| `progress-display.tsx` | Progress indicators |
| `navigation-badge.tsx` | Navigation counters |
| `optimistic-indicator.tsx` | Loading states |

### Feature Components (`/components/features/`)

| Feature | Components | Purpose |
|---------|------------|---------|
| **search** | `media-search`, `search-results`, `search-filters` | TMDB search interface |
| **media** | `watched-item-card` | Media item display |
| **tv** | `episode-tracker`, `season-overview`, `progress-update-dialog` | TV show tracking |
| **stats** | `key-metrics`, `activity-chart`, `viewing-heatmap` | Analytics display |
| **queue** | `simple-queue-list`, `bulk-actions-bar` | Watch queue management |
| **notes** | `note-card`, `add-note-form` | Notes interface |
| **profile** | `user-profile-form` | Profile management |
| **releases** | `releases-calendar`, `upcoming-releases` | Release tracking |

### Layout Components (`/components/layout/`)

- `app-sidebar.tsx` - Main navigation sidebar
- `dashboard-layout.tsx` - Dashboard wrapper

### Common Components (`/components/common/`)

- `loading-states.tsx` - Loading indicators
- `error-boundary.tsx` - Error handling
- `page-transition.tsx` - Route transitions
- `optimistic-update-boundary.tsx` - Optimistic updates

## 🧠 State Management

### Zustand Stores

| Store | File | Purpose |
|-------|------|---------|
| `AppStore` | `app-store.ts` | Global app state |
| `UserStore` | `user-store.ts` | User profile & preferences |
| `UIStore` | `ui-store.ts` | UI state, modals, filters |
| `MediaStore` | `media-store.ts` | Media data & statistics |

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useMedia()` | Media management with tRPC |
| `useSearch()` | Search functionality |
| `useUI()` | UI state management |
| `useQueue()` | Watch queue operations |
| `useOptimisticUpdates()` | Optimistic UI updates |
| `useEpisodeActions()` | TV episode management |
| `useStatusActions()` | Status change operations |

## 🔧 Utilities & Libraries

### Core Libraries (`/lib/`)

| File | Purpose |
|------|---------|
| `tmdb.ts` | TMDB API integration |
| `cache.ts` | In-memory caching |
| `rate-limit.ts` | Request rate limiting |
| `errors.ts` | Error handling utilities |
| `format.ts` | Data formatting |
| `episode-utils.ts` | TV episode utilities |
| `logger.ts` | Structured logging |

### Constants (`/lib/constants/`)

- `status.ts` - Watch status definitions
- `episode.ts` - Episode-related constants
- `formatting.ts` - Display formatting

## 🎭 Key Features Implementation

### Episode Tracking System

**Files**: `/components/features/tv/episode/`

- **Episode Cards**: Grid/list view with status badges
- **Quick Actions**: Mark watched, add notes, spoiler toggle
- **Progress Tracking**: Season-by-season progress display
- **Bulk Operations**: Mark multiple episodes watched

### Search & Discovery

**Files**: `/components/features/search/`

- **TMDB Integration**: Movies, TV shows, trending content
- **Advanced Filters**: Year, rating, media type, sorting
- **Recent Searches**: Search history tracking
- **Add to Library**: Direct integration with watchlist

### Statistics & Analytics

**Files**: `/components/features/stats/`

- **Overview Dashboard**: Key metrics and charts
- **Activity Tracking**: Viewing patterns over time
- **Achievements**: Milestone tracking
- **Data Export**: JSON/CSV export functionality

### Queue Management

**Files**: `/components/features/queue/`

- **Drag & Drop**: Reorder queue items
- **Bulk Actions**: Mark multiple items watched
- **Episode Queueing**: Add specific episodes
- **Smart Ordering**: Automatic position management

## 🚀 Performance Features

### Optimizations

- **Optimistic Updates**: Instant UI feedback
- **Smart Caching**: tRPC + React Query caching
- **Code Splitting**: Dynamic imports for routes
- **Image Optimization**: Next.js image component
- **Bundle Analysis**: Webpack bundle analyzer

### Loading States

- **Skeleton Components**: Loading placeholders
- **Staggered Animations**: Progressive loading
- **Error Boundaries**: Graceful error handling
- **Suspense**: React Suspense for async components

## 🔒 Security & Privacy

### Authentication

- **Clerk Integration**: Social + email authentication
- **Protected Routes**: Middleware-based protection
- **Session Management**: Automatic token refresh

### Privacy Controls

- **Public Profiles**: User-controlled visibility
- **Spoiler Management**: Content filtering
- **Data Export**: GDPR compliance

### Rate Limiting

- **API Protection**: 30-60 req/min limits
- **User-based**: Authenticated user limits
- **IP-based**: Anonymous user limits

## 📝 Development Workflows

### Available Scripts

```bash
pnpm dev          # Development server with Turbopack
pnpm build        # Production build
pnpm start        # Production server
pnpm lint         # ESLint checking
pnpm format       # Prettier formatting
pnpm test         # Jest unit tests
pnpm typecheck    # TypeScript checking
pnpm db:push      # Push schema to database
pnpm db:migrate   # Run database migrations
pnpm db:studio    # Open Prisma Studio
```

### Quality Gates

- **TypeScript**: Strict type checking
- **ESLint**: Code quality rules
- **Prettier**: Code formatting
- **Jest**: Unit test coverage
- **Husky**: Pre-commit hooks

## 📚 Documentation

### Available Docs

- [README.md](./README.md) - Getting started guide
- [docs/prd.md](./docs/prd.md) - Product requirements
- [docs/api-documentation.md](./docs/api-documentation.md) - API reference
- [ZUSTAND_USAGE.md](./ZUSTAND_USAGE.md) - State management guide

### Key Patterns

- **Server Components**: Next.js App Router patterns
- **Type Safety**: End-to-end TypeScript
- **Error Handling**: Standardized error responses
- **Data Fetching**: tRPC + React Query patterns
- **State Management**: Zustand store patterns

## 🎯 Future Roadmap

### Planned Features

- **Redis Caching**: Production-ready caching
- **Real-time Features**: Live updates, notifications
- **Advanced Analytics**: Genre preferences, patterns
- **Mobile App**: React Native companion
- **Social Features**: Friends, sharing, reviews

### Technical Improvements

- **Database Optimization**: Query performance
- **CDN Integration**: Static asset optimization
- **Monitoring**: Error tracking, performance
- **Testing**: E2E test coverage
- **CI/CD**: Automated deployment pipeline

---

## 🔗 Quick Navigation

- [Getting Started](README.md#getting-started)
- [API Documentation](docs/api-documentation.md)
- [Product Requirements](docs/prd.md)
- [State Management Guide](ZUSTAND_USAGE.md)
- [Database Schema](prisma/schema.prisma)
- [Component Library](src/components/)
- [API Routes](src/server/api/routers/)

This index provides a comprehensive overview of the Watch Tracker project structure, features, and implementation details for developers and contributors.