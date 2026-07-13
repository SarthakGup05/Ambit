# Ambit Monorepo

Welcome to the **Ambit** monorepo workspace, built with [Turborepo](https://turbo.build/) and managed with [pnpm](https://pnpm.io/).

## Repository Structure

This monorepo manages all the apps and packages for the Ambit ecosystem:

### Apps (`apps/`)

- [**`api`**](file:///c:/Users/DELL/Desktop/portl/apps/api): Backend Node.js / TypeScript API server.
- [**`mobile`**](file:///c:/Users/DELL/Desktop/portl/apps/mobile): Mobile client built with [Expo SDK 54](https://expo.dev/), [Expo Router v6](https://docs.expo.dev/router/introduction/), [Zustand](https://zustand-demo.pmnd.rs/), [NativeWind v4](https://www.nativewind.dev/), and [Tailwind CSS v3](https://tailwindcss.com/).

### Shared Packages (`packages/`)

- [**`typescript-config`**](file:///c:/Users/DELL/Desktop/portl/packages/typescript-config): Centralized `tsconfig.json` files for standard compilation configuration.
- [**`eslint-config`**](file:///c:/Users/DELL/Desktop/portl/packages/eslint-config): Shared linting rules.
- [**`ui`**](file:///c:/Users/DELL/Desktop/portl/packages/ui): Shared React component package stub.

---

## Development Guide

### Prerequisite

Make sure you have [pnpm](https://pnpm.io/) installed.

### Setup and Install

From the root directory, run:
```bash
pnpm install
```

This will resolve all dependencies and link the shared package workspace dependencies (e.g. `@repo/typescript-config` and `@repo/eslint-config`) using symlinks.

### Commands

Run scripts across workspace apps concurrently using **Turbo**:

#### Start Development Servers
```bash
pnpm dev
```
*Starts both backend API and Metro Bundler for Expo.*

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

### Mobile App (`apps/mobile`)
Run mobile-only tasks:
```bash
pnpm --filter mobile start
```

For clearing Metro cache (e.g. if NativeWind compiler configs change):
```bash
pnpm --filter mobile start --clear
```
