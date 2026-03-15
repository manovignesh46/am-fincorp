# Build stage
FROM node:20-slim AS builder

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy root workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy packages and apps (only what's needed for the API)
COPY packages/database ./packages/database
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the database package first
RUN pnpm --filter @am-fincorp/database build || true

# Build the API
RUN pnpm --filter api build

# Production stage
FROM node:20-slim AS runner

WORKDIR /app

# Install pnpm for production install
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Copy only the necessary files from builder
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/database/package.json ./packages/database/
COPY --from=builder /app/packages/database/index.js ./packages/database/
COPY --from=builder /app/packages/database/models ./packages/database/models
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

EXPOSE 5000

CMD ["pnpm", "--filter", "api", "start"]
