# Website Review Hub — Profitia

Internal tool for systematic review and feedback on Profitia website content pillars.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS v4 + shadcn/ui |
| Database | PostgreSQL (Neon) |
| ORM | Prisma v7 |
| Validation | Zod |
| Forms | React Hook Form + @hookform/resolvers |
| State | Zustand |
| Icons | Lucide React |
| Toasts | Sonner |
| Linting | ESLint |
| Formatting | Prettier + prettier-plugin-tailwindcss |

## Setup

### 1. Clone and install

```bash
git clone https://github.com/profitia/ankieta-strona-www.git
cd ankieta-strona-www
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Edit `.env` and set your Neon database credentials:

```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-dark-hall-aqes4gy0-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Prisma — push schema to database

```bash
npm run db:push
```

### 4. Seed initial data

```bash
npm run db:seed
```

This creates:
- **Pillars**: Doradztwo, Edukacja, Career
- **Sections** (per pillar): Hero, Value Proposition, Offer, CTA, Footer

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/dashboard`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run db:push` | Push Prisma schema to DB |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
.
├── app/
│   ├── (dashboard)/          # Dashboard route group
│   │   ├── layout.tsx        # Dashboard shell (sidebar + topbar)
│   │   └── dashboard/
│   │       ├── page.tsx      # Dashboard home
│   │       ├── pillars/      # Pillars management
│   │       ├── reviews/      # Review sessions
│   │       └── analytics/    # Analytics
│   ├── api/
│   │   ├── pillars/route.ts
│   │   ├── sections/route.ts
│   │   └── reviews/route.ts
│   ├── globals.css
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # → redirect /dashboard
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── layout/               # Sidebar, Topbar
│   └── shared/               # EmptyState, etc.
├── features/                 # Feature modules (pillars, sections, reviews, analytics)
├── lib/
│   ├── prisma/client.ts      # Prisma singleton
│   ├── db/                   # DB query helpers
│   ├── validations/          # Zod schemas
│   ├── constants/            # App constants
│   └── utils/cn.ts           # cn utility
├── stores/
│   └── app-store.ts          # Zustand global store
├── types/
│   └── index.ts              # Shared TypeScript types
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed script
└── .env.example
```

## Database Models

- **Pillar** — Content pillar (slug, name)
- **Section** — Page section within a pillar (slug, name, order)
- **ReviewSession** — A full review of one pillar (status, timestamps)
- **SectionReview** — Scored feedback for one section (5 scores, severity, text fields)

## Deploy to Vercel

```bash
vercel --prod
```

Set environment variables in Vercel dashboard:
- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`

**Vercel Project ID:** `prj_jL6jjzIQoyF6ZBYORSJbWIIXcchZ`
