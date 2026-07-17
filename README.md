# Ambit Monorepo

Welcome to the **Ambit** monorepo workspace, built with [Turborepo](https://turbo.build/) and managed with [pnpm](https://pnpm.io/).

---

## Repository Structure

This monorepo manages all the apps and packages for the Ambit ecosystem:

### Apps (`apps/`)

- [**`api`**](file:///c:/Users/DELL/Desktop/portl/apps/api): Backend Node.js / TypeScript API server.
  * Uses Express, Drizzle ORM, and better-auth.
  * Supports multi-tenant isolation via dynamic society validation.
  * Includes Docker infrastructure for containerized deployment.
- [**`mobile`**](file:///c:/Users/DELL/Desktop/portl/apps/mobile): Mobile client built with [Expo SDK 54](https://expo.dev/), [Expo Router](https://docs.expo.dev/router/introduction/), [Zustand](https://zustand.docs.pmnd.rs/), [NativeWind v4](https://www.nativewind.dev/), and [Tailwind CSS v3](https://tailwindcss.com/).
  * Custom 3-step welcome onboarding carousel with premium illustration assets.
  * Unified glassmorphic bottom tab navigation for both Residents and Admins.
  * Interactive settings panels with spring-based toggles and tactile haptic feedback.

### Shared Packages (`packages/`)

- [**`typescript-config`**](file:///c:/Users/DELL/Desktop/portl/packages/typescript-config): Centralized `tsconfig.json` files for standard compilation configuration.
- [**`eslint-config`**](file:///c:/Users/DELL/Desktop/portl/packages/eslint-config): Shared linting rules.
- [**`ui`**](file:///c:/Users/DELL/Desktop/portl/packages/ui): Shared React Native component design system.

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
