# Stage 1: Build stage
FROM node:22-alpine AS builder
RUN npm install -g pnpm

WORKDIR /app

# Copy package configurations and lockfile
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/server/package.json ./apps/server/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source files
COPY apps/server ./apps/server
COPY packages/db ./packages/db
COPY packages/shared ./packages/shared

# Build the Fastify server
RUN pnpm --filter @baza/server build

# Stage 2: Runtime stage
FROM node:22-alpine AS runner
RUN npm install -g pnpm

WORKDIR /app

# Copy lockfile and package configs for production dependency install
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/server/package.json ./apps/server/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/

# Install ONLY production dependencies to keep the image size minimal
RUN pnpm install --prod --frozen-lockfile

# Copy compiled backend code and database files needed for running migrations
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/packages/db ./packages/db

# Default environment configuration
ENV NODE_ENV=production
ENV SERVER_PORT=8080
ENV SERVER_HOST=0.0.0.0

EXPOSE 8080

CMD ["node", "apps/server/dist/server.js"]