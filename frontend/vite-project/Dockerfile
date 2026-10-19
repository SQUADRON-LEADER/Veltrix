# =============================================================================
# Veltrix Frontend — Production-Grade Multi-Stage Dockerfile
# Author: Aayush | Module 1: Docker & Containerization
# Stage 1: deps    → install all npm packages
# Stage 2: builder → run vite build (outputs /app/dist)
# Stage 3: runner  → nginx:alpine serving the static bundle
# =============================================================================

# ── Stage 1: Dependency installer ────────────────────────────────────────────
FROM node:18-alpine AS deps

WORKDIR /app

# Copy only manifest files — layer cache optimization
COPY package.json package-lock.json ./

# Install all dependencies (devDeps needed for Vite build + Tailwind)
RUN npm ci --frozen-lockfile


# ── Stage 2: Vite Build ───────────────────────────────────────────────────────
FROM deps AS builder

WORKDIR /app

# Copy source files into builder
COPY . .

# Build args injected at build time by Jenkins/docker-compose
# These are ONLY available during build — not baked into runtime image
ARG VITE_API_BASE_URL=https://veltrix-rz9z.onrender.com/api
ARG VITE_SOCKET_URL=https://veltrix-rz9z.onrender.com

# Pass build args into Vite via VITE_ prefix env vars
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# Run Vite production build — outputs to /app/dist
RUN npm run build


# ── Stage 3: Production Nginx Runner ─────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# OCI image labels
LABEL org.opencontainers.image.title="Veltrix Frontend"
LABEL org.opencontainers.image.description="Veltrix React/Vite SPA served via Nginx"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.authors="Aayush <devops@veltrix.io>"
LABEL org.opencontainers.image.source="https://github.com/SQUADRON-LEADER/Veltrix"

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our hardened nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx runs as non-root by default on Alpine — verify permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx       && \
    chown -R nginx:nginx /var/log/nginx         && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

# Healthcheck — K8s readiness probe checks this
HEALTHCHECK --interval=30s \
            --timeout=5s   \
            --start-period=10s \
            --retries=3    \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
