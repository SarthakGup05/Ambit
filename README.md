# Ambit Monorepo

Welcome to the **Ambit** monorepo workspace, built with [Turborepo](https://turbo.build/) and managed with [pnpm](https://pnpm.io/).

---

## Repository Structure

This monorepo manages all the apps and packages for the Ambit ecosystem:

```
ambit/
├── apps/
│   ├── api/                         # Node.js + Express + Drizzle Backend API
│   │   ├── src/
│   │   │   ├── controllers/         # Onboarding & business logic controllers
│   │   │   ├── db/                  # Drizzle DB connection
│   │   │   ├── models/              # Postgres database schema
│   │   │   ├── routes/              # Express endpoint routers
│   │   │   ├── auth.ts              # better-auth configuration
│   │   │   └── index.ts             # App entry point
│   │   ├── Dockerfile               # Production API image builder
│   │   └── package.json
│   │
│   └── mobile/                      # Expo SDK 54 Mobile Client App
│       ├── app/                     # Expo Router file-based screens
│       │   ├── (auth)/              # Landing page, Register, Login
│       │   ├── (welcome)/           # 3-Step welcome carousel
│       │   ├── (onboarding)/        # Society signup / join selections
│       │   ├── (resident)/          # Resident dashboards tab group
│       │   ├── (admin)/             # Admin cockpit & manage tab group
│       │   ├── (guard)/             # Security guard entries log
│       │   ├── _layout.tsx
│       │   └── index.tsx            # Main router redirection switch
│       ├── assets/                  # Fonts & illustration graphics
│       ├── src/
│       │   ├── features/            # Feature-specific components
│       │   ├── lib/                 # Auth-client & secure store utils
│       │   └── store/               # Zustand global state stores
│       └── package.json
│
├── packages/                        # Shared monorepo workspace packages
│   ├── eslint-config/               # Shared ESLint parameters
│   ├── typescript-config/           # Centralized TS compiler configs
│   └── ui/                          # Shared UI design-system components
│
├── docker-compose.yml               # Development multi-container script
├── pnpm-workspace.yaml              # Workspace directory configurations
└── turbo.json                       # Turborepo task configuration
```

---

## Development Guide

### Prerequisite

Make sure you have [pnpm](https://pnpm.io/) installed.

### Setup and Install

From the root directory, run:
```bash
pnpm install
```

This will resolve all dependencies and link the shared package workspace dependencies (e.g. `@repo/typescript-config`, `@repo/ui`) using symlinks.

### Commands

Run scripts across workspace apps concurrently using **Turbo**:

#### Start Development Servers
```bash
pnpm dev
```
*Starts both backend API server and Metro Bundler for Expo.*

#### Build All Apps
```bash
pnpm build
```

#### Run Linter
```bash
pnpm lint
```

#### Run TypeScript Type Checks
```bash
pnpm check-types
```

---

## Specific App Development

### API Server (`apps/api`)
Run backend-only tasks:
```bash
pnpm --filter api dev
pnpm --filter api build
```

To run with docker-compose:
```bash
docker-compose up --build
```

### Mobile App (`apps/mobile`)
Run mobile-only tasks:
```bash
pnpm --filter mobile start
```

For clearing Metro cache (e.g. if NativeWind compiler configs change or route changes need to be re-indexed):
```bash
pnpm --filter mobile start --clear
```

---

## Recent Implementations & Architecture

### 1. Dynamic API Connections (Expo & Physical Devices)
* The mobile client resolves the host machine's IP address dynamically in development mode (`expo-constants`), letting physical devices (running EAS development builds) and emulators connect seamlessly to the API server without manual `.env` updates.

### 2. Multi-Tenant Auth Security & Origin Validation
* Refactored `trustedOrigins` in `apps/api/src/auth.ts` to verify incoming origins dynamically, preventing `Invalid origin` errors across dynamic local IP configurations while maintaining secure `ambit://` callback schemes.

### 3. Route Collision Resolution
* Avoided route collision bugs in Expo Router by renaming conflicting default root index routes. Welcome Carousel is located at `/welcome` and Auth landing is at `/landing`, ensuring clean redirection post-authentication.

### 4. Admin Navigation Restructure
* Restructured the Admin portal to match the resident's premium bottom-tab layout. Sells administrative cockpits (Society configurations, SaaS Plan details, Member management, Staff & Guard invites, and Bulletin controls) through an exclusive **Manage** dashboard tab.

### 5. Tactical Haptic UX
* Configured `expo-haptics` to trigger light, satisfying tactile feedback on all key operations: welcome page transitions, dashboard button triggers, settings switcher flips, and logout buttons.
