# Multi-stage build for production efficiency
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Build the application
FROM base AS builder
WORKDIR /app

# Copy all files
COPY . .
COPY package.json package-lock.json* ./

# Install all dependencies (including dev)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 opensprint
RUN adduser --system --uid 1001 opensprint

# Copy built application
COPY --from=builder --chown=opensprint:opensprint /app/dist ./dist
COPY --from=builder --chown=opensprint:opensprint /app/prisma ./prisma
COPY --from=deps --chown=opensprint:opensprint /app/node_modules ./node_modules
COPY --from=builder --chown=opensprint:opensprint /app/package.json ./package.json

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Switch to non-root user
USER opensprint

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/server/index.js"] 