# replit.md

## Overview

This is a Korean vehicle sales radar dashboard that analyzes "급상승" (rapidly rising) car models based on KAMA/KAIDA official sales data from Danawa Auto. The application displays domestic and imported vehicle models ranked by a composite score combining month-over-month sales changes, percentage growth, and rank improvements.

The MVP focuses on derived metrics (surge scores, growth rates, rank changes) rather than raw data redistribution, with links back to Danawa source pages for detailed information.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Build Tool**: Vite with hot module replacement

The frontend is a single-page dashboard (`Dashboard.tsx`) featuring:
- Month selector for browsing historical data (12 months)
- Nation toggle (domestic/imported vehicles)
- Filter controls (minimum sales threshold, exclude new entries)
- Model cards displaying rank, sales data, and surge scores

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful JSON API

Key endpoints:
- `GET /api/radar?month=YYYY-MM&nation=domestic|export` - Returns ranked model data with surge scores

### Data Processing
The `radarService.ts` generates mock data simulating Danawa's vehicle sales structure:
- Predefined brand/model lists for domestic and imported vehicles
- Z-score normalization across three metrics for composite scoring
- Ranking based on month-over-month changes, percentage growth, and rank movement

### Storage Layer
- **Current**: In-memory cache (`MemStorage` class) with Map-based storage
- **Schema**: Drizzle ORM configured for PostgreSQL (schema defined but not actively used)
- **Design**: Storage interface (`IStorage`) allows easy swap to persistent database

### Build System
- **Development**: tsx for TypeScript execution, Vite dev server with HMR
- **Production (Replit)**: Custom build script using esbuild (server) + Vite (client)
- **Production (Netlify)**: Vite for frontend, serverless functions for backend
- **Output**: Single `dist/` folder with bundled server and static client assets

### Netlify Deployment
- **Configuration**: `netlify.toml` defines build settings and redirects
- **Serverless Function**: `netlify/functions/api.ts` wraps Express routes for serverless
- **API Redirect**: `/api/*` requests are redirected to `/.netlify/functions/api/:splat`
- **Build Command**: `npx vite build --outDir dist/public`

## External Dependencies

### Database
- **Drizzle ORM**: Schema definition and query building configured for PostgreSQL
- **PostgreSQL**: Connection via `DATABASE_URL` environment variable (required for db:push)
- **connect-pg-simple**: Session storage capability (installed but not actively used)

### UI Framework
- **Radix UI**: Full primitive component suite (dialog, popover, select, tabs, etc.)
- **shadcn/ui**: Pre-styled component variants using class-variance-authority
- **Lucide React**: Icon library

### Data Validation
- **Zod**: Schema validation for API parameters and data types
- **drizzle-zod**: Bridge between Drizzle schemas and Zod validators

### Development Tools
- **Replit plugins**: Runtime error overlay, cartographer, dev banner for Replit environment
- **React Day Picker**: Calendar component for date selection
- **Embla Carousel**: Carousel functionality