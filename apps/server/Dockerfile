FROM node:20-alpine
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy lockfile and package configs first to cache dependencies install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies (cached layer)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Re-run install to link workspace packages
RUN pnpm install --frozen-lockfile

EXPOSE 3001

CMD ["pnpm", "--filter", "api", "dev"]
