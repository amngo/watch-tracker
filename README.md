# 📺 Watch Tracker

A modern, feature-rich web application for tracking your movie and TV show viewing progress with timestamped notes, comprehensive statistics, and social sharing capabilities. Built with Next.js 15, TypeScript, and a powerful full-stack architecture.

## 🌟 Key Features

### Core Functionality
- **📊 Progress Tracking**: Track movies by runtime and TV shows by individual episodes
- **📝 Timestamped Notes**: Add detailed notes with specific timestamps and spoiler warnings
- **📈 Advanced Statistics**: Visualize viewing patterns, achievements, and personal analytics
- **👥 Public Profiles**: Share your watchlist with customizable privacy and spoiler controls
- **📱 Mobile-First Design**: Fully responsive with dedicated focus mode for distraction-free viewing
- **🎬 TMDB Integration**: Access rich metadata, posters, and details from The Movie Database

### Additional Features
- **🔍 Smart Search**: Real-time search with filters, sorting, and recent search history
- **📋 Watch Queue**: Organize your watchlist with drag-and-drop reordering
- **📅 Release Calendar**: Track upcoming releases for your favorite shows and movies
- **🏆 Achievements**: Unlock milestones based on your viewing habits
- **🌐 Multi-Language**: Support for international content and metadata
- **🎨 Beautiful UI**: Modern design with smooth animations and transitions

## 🛠️ Technology Stack

### Frontend Architecture
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router and Turbopack
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development experience
- **[TailwindCSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[ShadCN UI](https://ui.shadcn.com/)** - High-quality React components
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management
- **[React Query](https://tanstack.com/query/latest)** - Powerful data synchronization
- **[GSAP](https://greensock.com/gsap/)** - Professional-grade animations

### Backend Infrastructure
- **[tRPC](https://trpc.io/)** - End-to-end type-safe APIs
- **[Prisma](https://www.prisma.io/)** - Modern ORM with type safety
- **[PostgreSQL](https://www.postgresql.org/)** - Robust relational database
- **[Clerk](https://clerk.com/)** - Complete authentication solution
- **[Zod](https://zod.dev/)** - Runtime type validation

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting and standards
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Jest](https://jestjs.io/)** - Testing framework
- **[Testing Library](https://testing-library.com/)** - Component testing
- **[pnpm](https://pnpm.io/)** - Fast, efficient package management

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18.0.0 or higher
- **pnpm** 8.0.0 or higher
- **PostgreSQL** 14+ (local or hosted)
- **Git** for version control

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd watch-tracker
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Configure your `.env.local` file:
   ```env
   # Database (PostgreSQL)
   DATABASE_URL="postgresql://user:password@localhost:5432/watch_tracker"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."

   # TMDB API
   NEXT_PUBLIC_TMDB_API_KEY="your_tmdb_api_key"

   # Application URL
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Push schema to database
   pnpm db:push
   
   # Generate Prisma client
   pnpm db:generate
   
   # (Optional) Open Prisma Studio
   pnpm db:studio
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see your application running!

### External Service Setup

#### TMDB API Key
1. Visit [TMDB](https://www.themoviedb.org/) and create an account
2. Go to Settings → API → Create → Developer
3. Copy your API key to `.env.local`

#### Clerk Authentication
1. Sign up at [Clerk.com](https://clerk.com)
2. Create a new application
3. Copy your keys from the API Keys section

#### Database Options
- **Local**: Install PostgreSQL locally
- **Hosted**: Use [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app)

## 📁 Project Structure

```
watch-tracker/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (dashboard)/        # Dashboard route group
│   │   ├── api/               # API routes (tRPC)
│   │   ├── dashboard/         # Main dashboard
│   │   ├── library/           # Media library views
│   │   ├── movie/[id]/        # Movie detail pages
│   │   ├── tv/[id]/           # TV show detail pages
│   │   ├── stats/             # Statistics pages
│   │   ├── search/            # Search functionality
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components (ShadCN)
│   │   ├── features/         # Feature-specific components
│   │   ├── common/           # Shared components
│   │   ├── layout/           # Layout components
│   │   └── providers/        # Context providers
│   ├── server/               # Server-side code
│   │   ├── api/             # tRPC routers
│   │   │   └── routers/     # Individual API routers
│   │   └── db.ts           # Database client
│   ├── stores/              # Zustand state management
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   ├── types/               # TypeScript definitions
│   └── trpc/               # tRPC configuration
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── public/                  # Static assets
├── docs/                    # Documentation
└── tests/                   # Test files
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Run specific test file
pnpm test src/components/ui/button.test.tsx
```

## 📋 Available Scripts

### Development
```bash
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server
pnpm analyze      # Analyze bundle size
```

### Database
```bash
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema changes to database
pnpm db:migrate   # Create and run migrations
pnpm db:studio    # Open Prisma Studio GUI
pnpm db:seed      # Seed database with sample data
```

### Code Quality
```bash
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
pnpm format       # Format code with Prettier
pnpm format:check # Check code formatting
pnpm typecheck    # Run TypeScript compiler checks
```

### Testing
```bash
pnpm test         # Run Jest tests
pnpm test:watch   # Run tests in watch mode
pnpm test:coverage # Generate test coverage report
pnpm test:ui      # Run component tests
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Import Project**
   - Connect your GitHub repository to Vercel
   - Vercel will auto-detect Next.js configuration

2. **Configure Environment Variables**
   - Add all variables from `.env.local`
   - Set `NODE_ENV=production`

3. **Deploy**
   - Vercel handles build and deployment automatically
   - Preview deployments for each PR

### Manual Deployment

```bash
# Build the application
pnpm build

# Set production environment variables
export NODE_ENV=production
# ... other env vars

# Start production server
pnpm start
```

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
RUN npm install -g pnpm
RUN pnpm install --prod
CMD ["pnpm", "start"]
```

## 📖 Documentation

Comprehensive documentation is available in the `docs/` directory:

### Core Documentation
- **[Architecture Guide](./docs/architecture.md)** - System design and technical architecture
- **[API Documentation](./docs/api-documentation.md)** - Complete API reference with examples
- **[Component Library](./docs/components.md)** - UI component documentation and usage
- **[Development Guide](./docs/development-guide.md)** - Setup and development workflow

### Additional Resources
- **[Product Requirements](./docs/prd.md)** - Product specifications and requirements
- **[Project Index](./PROJECT_INDEX.md)** - Complete project overview and navigation
- **[Zustand Usage](./ZUSTAND_USAGE.md)** - State management patterns and best practices

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
   ```bash
   git fork <repository-url>
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the code style guide
   - Add tests for new features
   - Update documentation as needed

4. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add new feature"
   ```

5. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Convention
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Maintenance tasks

## 🔒 Security

- All user inputs are validated with Zod schemas
- Authentication handled by Clerk with secure sessions
- API endpoints are protected with rate limiting
- Database queries use Prisma to prevent SQL injection
- Environment variables for sensitive configuration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for movie and TV show data
- [Vercel](https://vercel.com/) for hosting and deployment
- [ShadCN](https://ui.shadcn.com/) for the component library
- All our contributors and users!

---

<p align="center">Made with ❤️ by the Watch Tracker team</p>