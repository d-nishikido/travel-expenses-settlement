#!/bin/bash

# Build script for production deployment

set -e  # Exit on error

echo "🚀 Starting production build process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if NODE_ENV is set
if [ -z "$NODE_ENV" ]; then
    export NODE_ENV=production
    print_warning "NODE_ENV not set, defaulting to production"
fi

# Validate environment variables
print_status "Validating environment variables..."
node scripts/validate-env.js || {
    print_error "Environment validation failed"
    exit 1
}

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf packages/*/dist
rm -rf packages/*/build

# Install dependencies
print_status "Installing dependencies..."
pnpm install --frozen-lockfile

# Run tests
print_status "Running tests..."
pnpm run test || {
    print_error "Tests failed"
    exit 1
}

# Run linting
print_status "Running linting..."
pnpm run lint || {
    print_error "Linting failed"
    exit 1
}

# Run type checking
print_status "Running type checking..."
pnpm run typecheck || {
    print_error "Type checking failed"
    exit 1
}

# Build backend
print_status "Building backend..."
cd packages/backend
pnpm run build || {
    print_error "Backend build failed"
    exit 1
}
cd ../..

# Build frontend
print_status "Building frontend..."
cd packages/frontend
pnpm run build || {
    print_error "Frontend build failed"
    exit 1
}
cd ../..

# Build Docker images if requested
if [ "$1" == "--docker" ]; then
    print_status "Building Docker images..."
    docker-compose -f docker/docker-compose.prod.yml build || {
        print_error "Docker build failed"
        exit 1
    }
    
    # Tag images with git hash
    GIT_HASH=$(git rev-parse --short HEAD)
    docker tag expense-backend:latest expense-backend:$GIT_HASH
    docker tag expense-frontend:latest expense-frontend:$GIT_HASH
    print_status "Docker images tagged with: $GIT_HASH"
fi

# Generate build info
BUILD_INFO="build-info.json"
cat > $BUILD_INFO <<EOF
{
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "gitCommit": "$(git rev-parse HEAD)",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD)",
  "nodeVersion": "$(node --version)",
  "environment": "$NODE_ENV"
}
EOF

print_status "Build info generated: $BUILD_INFO"

# Summary
echo ""
echo "========================================="
echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Review the build artifacts"
echo "2. Deploy using: npm run deploy"
echo "3. Monitor application logs after deployment"
echo ""

exit 0