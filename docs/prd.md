# 📄 Product Requirements Document – Watch Tracker App

## 🧠 Purpose

Enable users to track their watch progress across movies and shows using the TMDB API, add timestamped notes, and view progress data through a clean and socially shareable UI.

## 🎯 Goals

- Track show/movie watch progress by episode or runtime
- Add detailed notes per episode with timestamps
- Visualize personal viewing statistics
- Provide a mobile-friendly, minimal focus mode
- Support public profiles with spoiler controls

## ❌ Non-Goals

- Media streaming
- Offline usage
- Real-time syncing without authentication

---

## 🛠 Tech Stack

### 🔧 Frontend

- **Framework:** Next.js 15 (App Router + Turbopack)
- **UI Components:** ShadCN UI (Radix + TailwindCSS)
- **Styling:** TailwindCSS (custom-configured)
- **State Management:** Zustand
- **Markdown Input:** ShadCN-styled textarea + optional MDE plugin

### 🌐 API Layer

- **Routing:** tRPC (fully type-safe)
- **Validation:** zod
- **Data Fetching:** React Query (TanStack Query)

### 🔐 Auth

- **Authentication:** Clerk (`@clerk/nextjs`)
- **Session Management:** Clerk hooks, middleware, and `auth()` utility

### 🗄️ Backend & ORM

- **Runtime:** Vercel Edge Functions
- **Database:** PostgreSQL (hosted via Neon)
- **ORM:** Prisma (Neon-compatible)

### ☁️ DevOps & Infra

- **Package Manager:** pnpm (preferred)
- **CI/CD & Hosting:** Vercel
- **Testing:** Jest, @testing-library/react, Playwright
- **Linting:** ESLint, Prettier, Tailwind plugin
- **Caching (optional):** Upstash Redis (rate-limiting, session/metadata cache)

---

## 🔧 Additional Technical Standards

### 🚨 Error Handling

- All API errors follow this standardized format:

```ts
{
  code: "BAD_REQUEST",
  message: "Missing timestamp field",
  status: 400
}
```

- Zod validation errors mapped to user-friendly messages
- Use ShadCN `Alert` or `Toast` components to display errors

### ⌛ Loading States

- ShadCN `Skeleton` components for lists, posters, notes
- Optimistic updates with React Query
- Suspense support for server components

### ♿ Accessibility (a11y)

- Semantic HTML (e.g., `<article>` for notes)
- Full keyboard navigation for modals, dropdowns, focus mode
- Accessible spoiler overlays with proper contrast

### 🧰 Caching Strategy

- React Query caching for `/api/user/:username`, `/api/stats`, etc.
- SWR-style deduping for TMDB search results
- Zustand selectors memoized for dashboard performance

### 💛 Feature Flags (Optional)

- Controlled rollouts via `@happykit/flags` or internal hook
- Gating for AI summaries, shared lists, and experimental features

### 🚧 Environment Configuration

- `dev`: local dev via `.env.local`
- `preview`: Vercel preview deployments
- `prod`: live environment (Clerk + Neon + CDN)
- Log and analytics gated by environment guard

---

✅ **This stack supports high-performance development, scales with team size, and prioritizes great user experience through strict UI/UX consistency.**
