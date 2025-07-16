FROM node:18-alpine

# Install dependencies for building native modules
RUN apk add --no-cache python3 make g++

# Create app directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-workspace.yaml ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/

# Install dependencies
RUN pnpm install

# Copy application source
COPY . .

# Build the applications
RUN pnpm run build

# Expose ports
EXPOSE 3000 5000

# Start the application
CMD ["pnpm", "run", "dev"]