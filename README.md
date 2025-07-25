# 📺 Watch Tracker

A modern web application for tracking your movie and TV show progress with timestamped notes and social sharing features.

## ✨ Features

- **Progress Tracking**: Track movies by runtime and TV shows by episodes
- **Timestamped Notes**: Add detailed notes with specific timestamps
- **Personal Statistics**: Visualize your viewing data and habits
- **Public Profiles**: Share your watch list with spoiler controls
- **Mobile-Friendly**: Responsive design with focus mode
- **TMDB Integration**: Rich metadata from The Movie Database

## 🛠 Tech Stack

### Frontend
- **Next.js 15** with App Router and Turbopack
- **TypeScript** for type safety
- **TailwindCSS** with ShadCN UI components
- **Zustand** for state management

### Backend
- **tRPC** for type-safe API routes
- **Prisma** ORM with PostgreSQL
- **Clerk** for authentication
- **Zod** for validation

### Development
- **ESLint + Prettier** for code quality
- **Jest + Testing Library** for unit tests
- **pnpm** for package management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database

### Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd watch-tracker
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Fill in your environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk public key
- `CLERK_SECRET_KEY`: Clerk secret key
- `NEXT_PUBLIC_TMDB_API_KEY`: The Movie Database API key

4. Set up the database:
```bash
pnpm db:push
pnpm db:generate
```

5. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── sign-in/          # Authentication pages
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── ui/              # ShadCN UI components
│   ├── layout/          # Layout components
│   ├── features/        # Feature-specific components
│   └── common/          # Shared components
├── server/              # Server-side code
│   ├── api/            # tRPC routers
│   └── db.ts          # Database connection
├── trpc/               # tRPC configuration
├── lib/                # Utility functions
├── hooks/              # Custom React hooks
├── stores/             # Zustand stores
├── types/              # TypeScript types
└── middleware.ts       # Next.js middleware
```

## 🧪 Testing

- **Unit Tests**: `pnpm test`
- **Test Coverage**: `pnpm test:coverage`

## 📋 Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
pnpm test         # Run unit tests
pnpm db:push      # Push schema to database
pnpm db:migrate   # Run database migrations
pnpm db:studio    # Open Prisma Studio
```

## 🚀 Deployment

This project is optimized for deployment on Vercel:

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy!

## 📖 Documentation

For detailed documentation, see the [docs/](./docs/) directory:
- [PRD (Product Requirements Document)](./docs/prd.md)
- [API Documentation](./docs/api.md)
- [Component Library](./docs/components.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.