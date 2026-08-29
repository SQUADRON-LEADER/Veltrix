# =============================================================================
# Veltrix Backend — Production-Grade Multi-Stage Dockerfile
# Author: Aayush | Module 1: Docker & Containerization
# Stage 1: deps    → install ALL dependencies (including devDeps for build)
# Stage 2: test    → run unit tests (skipped in prod, kept for CI audit)
# Stage 3: prod    → lean image with only production deps, non-root user
# =============================================================================

# ── Stage 1: Dependency installer ────────────────────────────────────────────
FROM node:18-alpine AS deps

# Install system packages needed for native npm builds (e.g. bcrypt)
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy only manifest files first — leverages Docker layer cache
# If package.json hasn't changed, this layer is reused on rebuild
COPY package.json package-lock.json ./

# Install ALL deps (prod + dev) for the test stage
RUN npm ci --frozen-lockfile


# ── Stage 2: Test runner (executed by Jenkins CI, not in final image) ─────────
FROM deps AS tester

WORKDIR /app

# Copy source into test stage
COPY . .

# Run unit tests — pipeline will fail here if tests break
# jest is configured with --passWithNoTests so empty suite doesn't fail
RUN npm test -- --passWithNoTests --ci --forceExit


# ── Stage 3: Production-only dependency builder ───────────────────────────────
FROM node:18-alpine AS prod-deps

RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./

# Install ONLY production dependencies — strips devDependencies
RUN npm ci --frozen-lockfile --omit=dev


# ── Stage 4: Final Production Runner ─────────────────────────────────────────
FROM node:18-alpine AS runner

# OCI image labels (shown in docker inspect + ECR console)
LABEL org.opencontainers.image.title="Veltrix Backend API"
LABEL org.opencontainers.image.description="Veltrix Node.js/Express API with Socket.io"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.authors="Aayush <devops@veltrix.io>"
LABEL org.opencontainers.image.source="https://github.com/SQUADRON-LEADER/Veltrix"

# Install wget for healthcheck probe — smallest possible footprint
RUN apk add --no-cache wget tini

WORKDIR /app

# Hardened runtime: non-root user (UID 1001)
# tini is used as PID 1 to handle signals correctly (graceful shutdown)
RUN addgroup -g 1001 -S nodejs && \
    adduser  -u 1001 -S nodejs -G nodejs

# Copy production node_modules from prod-deps stage
COPY --from=prod-deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application source (only what's needed at runtime)
COPY --chown=nodejs:nodejs index.js        ./index.js
COPY --chown=nodejs:nodejs package.json    ./package.json
COPY --chown=nodejs:nodejs controllers/    ./controllers/
COPY --chown=nodejs:nodejs routes/         ./routes/
COPY --chown=nodejs:nodejs models/         ./models/
COPY --chown=nodejs:nodejs middleware/     ./middleware/
COPY --chown=nodejs:nodejs config/         ./config/

# Switch to non-root user
USER nodejs

# Environment defaults (overridden by docker-compose / K8s ConfigMap)
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Healthcheck — Jenkins and K8s liveness probe depends on this
# Checks the /health endpoint every 30s; 3 failures = container unhealthy
HEALTHCHECK --interval=30s \
            --timeout=10s  \
            --start-period=15s \
            --retries=3    \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

# Use tini as init system — proper SIGTERM/SIGINT handling
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "index.js"]
