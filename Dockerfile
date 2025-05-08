# ── Builder Stage ─────────────────────────────────────────────
FROM node:22 AS builder

WORKDIR /usr/src/app

# Copy package files and install deps (skip optional to avoid fsevents)
COPY package.json package-lock.json ./
RUN npm install --no-optional

# Copy source and build
COPY . .
RUN npm run build

# ── Runtime Stage ─────────────────────────────────────────────
FROM node:22 AS runner

WORKDIR /usr/src/app

# Copy only prod dependencies
COPY package.json package-lock.json ./
RUN npm install --production --no-optional

# Copy built app from builder
COPY --from=builder /usr/src/app/dist ./dist

# Expose port
EXPOSE 3000

CMD ["node", "dist/index.js"]
