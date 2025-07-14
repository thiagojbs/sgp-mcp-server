# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S sgp -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=sgp:nodejs /app/dist ./dist
COPY --from=builder --chown=sgp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=sgp:nodejs /app/package*.json ./

# Create logs directory
RUN mkdir -p logs && chown sgp:nodejs logs

# Switch to non-root user
USER sgp

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/http/index.js"]