# NFL GameDay Hub

## Overview

NFL GameDay Hub is a comprehensive NFL fan experience platform providing real-time game scores, standings, team information, news, and ticket marketplace functionality. The application features live game tracking with auto-refresh, team-branded interfaces for all 32 NFL teams, and global localization support including timezone detection and currency conversion.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for UI transitions and animations
- **Theme**: Dark/light mode support with system preference detection

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints under `/api/*` prefix
- **Build System**: Custom build script using esbuild for server bundling and Vite for client

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` - shared between client and server
- **Validation**: Zod schemas generated from Drizzle tables via drizzle-zod
- **Migrations**: Drizzle Kit for database schema management (`npm run db:push`)

### Key Design Patterns
- **Monorepo Structure**: Client code in `client/`, server in `server/`, shared types in `shared/`
- **Path Aliases**: `@/*` maps to client source, `@shared/*` maps to shared directory
- **Data Generation**: Mock NFL data generated server-side for games, standings, news, and tickets
- **Real-time Updates**: Polling-based refresh (10-second intervals) for live game scores

### AI Integration
- **OpenAI Integration**: Translation services via OpenAI API for multilingual support
- **Replit AI Integrations**: Pre-built modules for chat, audio, image generation, and batch processing in `server/replit_integrations/`
- **Voice Support**: Audio utilities for voice chat with PCM16 decoding and AudioWorklet playback

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Session Storage**: connect-pg-simple for Express session persistence

### AI Services
- **OpenAI API**: Used for text translation (`OPENAI_API_KEY`)
- **Replit AI Integrations**: Alternative OpenAI endpoint (`AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`)

### Third-Party APIs (Planned/Mock)
- **Ticket Brokers**: Integration points for Ticketmaster, StubHub, SeatGeek (currently mock data)
- **ESPN CDN**: Team logos and images sourced from ESPN's CDN

### Key NPM Dependencies
- **UI Components**: Radix UI primitives, shadcn/ui, Lucide icons
- **Data Handling**: date-fns for date formatting, Zod for validation
- **Development**: Replit-specific Vite plugins for error overlay and dev tools