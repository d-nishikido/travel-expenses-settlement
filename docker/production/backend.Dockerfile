# Backend Production Dockerfile with multi-stage build

# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.14.1 --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend/package.json ./packages/backend/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter backend

# Stage 2: Builder
FROM node:18-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.14.1 --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/backend/node_modules ./packages/backend/node_modules

# Copy source code
COPY . .

# Build the application
WORKDIR /app/packages/backend
RUN pnpm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
RUN apk add --no-cache libc6-compat

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy necessary files
COPY --from=builder --chown=nodejs:nodejs /app/packages/backend/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/backend/package.json ./package.json
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nodejs:nodejs /app/packages/backend/node_modules ./node_modules

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["node", "dist/index.js"]