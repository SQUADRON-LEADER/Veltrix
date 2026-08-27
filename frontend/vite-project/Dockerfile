# Multi-stage production build for Veltrix React Frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Vite static bundle
RUN npm run build

# Stage 2: Serve with Nginx Alpine
FROM nginx:1.25-alpine AS runner

# Copy built static files to nginx web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
