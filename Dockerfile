FROM node:22-alpine

RUN corepack enable

WORKDIR /app

# Copy all files from the monorepo root
COPY . .

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Build the server (package name is "api")
RUN pnpm turbo build --filter=api

EXPOSE 3001

# Start the server using the package name "api"
CMD ["pnpm", "--filter", "api", "start"]
