# ── Stage 1: Install all deps + build ─────────────────────────────────────────
FROM node:20-alpine AS builder

# Native build tools needed for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy manifests first for layer-cache efficiency
COPY package*.json ./

# Install ALL deps (including devDependencies needed for `next build`)
RUN npm ci

# Copy source
COPY . .

# Build Next.js production bundle
RUN npm run build

# ── Stage 2: Lean production image ────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache python3 make g++

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy built app from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Persistent SQLite data directory
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["npm", "start"]
