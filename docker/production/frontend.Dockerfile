# Frontend Production Dockerfile with multi-stage build

# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.14.1 --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/frontend/package.json ./packages/frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter frontend

# Stage 2: Builder
FROM node:18-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.14.1 --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/frontend/node_modules ./packages/frontend/node_modules

# Copy source code
COPY . .

# Set build-time environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the application
WORKDIR /app/packages/frontend
RUN pnpm run build

# Stage 3: Runner
FROM nginx:alpine AS runner

# Copy nginx configuration
COPY docker/production/nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

# Add runtime environment variable injection script
COPY docker/production/env-config.sh /docker-entrypoint.d/20-envsubst-on-runtime.sh
RUN chmod +x /docker-entrypoint.d/20-envsubst-on-runtime.sh

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1