# 줄없냥 - Campus Congestion & Queue Management Web App

## Overview

줄없냥 (JulEobsNyang - "No Lines Cat") is a mobile-optimized web application for real-time campus facility congestion monitoring and queue management. The app displays live congestion levels for university facilities (cafeterias, libraries, gyms) and provides a GPS-based queue registration system. Built as a prototype for Hanyang University, the system simulates real-time crowd data that would eventually connect to YOLO-based video analysis.

**Core Value Proposition:** "Match your free time between classes - eat without waiting in line"

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework:** React 18 with TypeScript, bundled via Vite
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** React Query for server state, React Context for local state (WaitingContext, ThemeContext)
- **UI Components:** shadcn/ui component library with Radix UI primitives
- **Styling:** Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Charts:** Recharts for time-series congestion visualization
- **Real-time Updates:** WebSocket connection for live data push

### Backend Architecture
- **Runtime:** Node.js with Express.js
- **API Design:** RESTful endpoints under `/api/*` prefix
- **Real-time:** WebSocket server (ws library) on `/ws` path for broadcasting facility updates
- **Build System:** esbuild for server bundling, Vite for client bundling

### Data Layer
- **ORM:** Drizzle ORM with PostgreSQL dialect
- **Schema Location:** `shared/schema.ts` - contains Zod schemas for type validation
- **Current Storage:** In-memory mock data in `server/storage.ts` (simulates real database)
- **Session Management:** connect-pg-simple configured for PostgreSQL session storage

### Key Design Decisions

1. **Shared Schema Pattern:** Types defined in `shared/schema.ts` are used by both client and server, ensuring type safety across the stack. Zod is used for runtime validation.

2. **Monorepo Structure:**
   - `/client` - React frontend application
   - `/server` - Express backend
   - `/shared` - Shared types and schemas

3. **Path Aliases:** TypeScript paths configured for clean imports:
   - `@/*` → `./client/src/*`
   - `@shared/*` → `./shared/*`

4. **Mobile-First Design:** The app targets mobile viewports with PWA capabilities (manifest, service worker ready)

5. **Simulated Data:** Currently uses mock data with random congestion fluctuations. Designed for future integration with:
   - YOLO v11 real-time video analysis (external edge devices)
   - University dining service API crawling

### API Structure
- `GET /api/facilities` - List all facilities with congestion data
- `GET /api/facilities/:id` - Single facility details
- `GET /api/waiting` - Current user's active waiting status
- `POST /api/waiting` - Register for queue
- `DELETE /api/waiting` - Cancel queue registration
- `GET /api/history` - User's waiting history
- `WebSocket /ws` - Real-time facility updates

## Recent Changes (January 2026)

1. **Full API Integration:** WaitingContext now uses React Query mutations for queue registration/cancellation instead of local mock state
2. **Proper Routing:** All navigation uses wouter routes (/, /waiting, /mypage, /facility/:id)
3. **SEO Implementation:** Added Open Graph and Twitter Card meta tags, per-page title/description updates via custom hooks
4. **UI Compliance:** Removed custom hover styles, using shadcn Button with built-in interactions
5. **Accessibility:** Added data-testid attributes to all interactive elements
6. **Time Slot Predictions:** Added TimeSlotSelector component showing 30-minute interval time slots (6:00-22:00), with prediction mode for future time slots showing calculated congestion/wait times
7. **Date-Aware Menu Display:** Future dates show "[음식메뉴] - 추후구현" placeholder with "가격 미정" pricing; registration disabled with "예약 불가" button
8. **Prediction System:** client/src/lib/prediction.ts contains multiplier-based calculations for congestion predictions:
   - **Meal times only**: Breakfast 7:00-9:00, Lunch 11:00-13:00, Dinner 17:00-19:00
   - Non-meal time slots are not shown (TimeSlotSelector only displays meal time slots)
   - Lunch peak (12:00-12:30): multiplier 1.6, gradual increase from 11:00, decrease to 13:00
   - Dinner peak (18:00-18:30): multiplier 1.5, gradual increase from 17:00, decrease to 19:00
   - Breakfast: multiplier 0.8 (consistent)
   - Wait time = congestion × 4 minutes (synced calculation)
9. **FacilityDetailPage Navigation:** Uses wouter's useLocation hook for back navigation; z-index fixes ensure back button is clickable above icon overlays

## External Dependencies

### Database
- **PostgreSQL** - Primary database (configured via `DATABASE_URL` environment variable)
- **Drizzle Kit** - Database migrations in `/migrations` directory

### UI/Component Libraries
- **Radix UI** - Headless accessible component primitives (dialogs, dropdowns, tabs, etc.)
- **shadcn/ui** - Pre-styled component collection built on Radix
- **Lucide React** - Icon library
- **Recharts** - Charting library for congestion graphs

### Build & Development
- **Vite** - Frontend dev server and bundler with HMR
- **esbuild** - Server-side bundling for production
- **TypeScript** - Full type coverage across the stack

### Replit-Specific
- `@replit/vite-plugin-runtime-error-modal` - Error overlay for development
- `@replit/vite-plugin-cartographer` - Development tooling
- `@replit/vite-plugin-dev-banner` - Development banner

### Date/Time
- **date-fns** - Date manipulation with Korean locale support

### Korean Language Support
- Application UI is in Korean
- Uses Noto Sans KR and Inter fonts