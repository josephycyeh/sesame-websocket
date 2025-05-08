# ── Builder Stage ─────────────────────────────────────────────────────────
FROM node:22-slim AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy dependency manifests and install all deps (skip optional like fsevents)
COPY package.json package-lock.json ./
RUN npm ci --no-optional

# Copy source and build
COPY . .
RUN npm run build

# ── Production Stage ──────────────────────────────────────────────────────
FROM node:22-slim

# Set working directory
WORKDIR /usr/src/app

# Install only production deps (skip optional)
COPY package.json package-lock.json ./
RUN npm ci --production --no-optional

# Copy built output from builder
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port your app uses (adjust if needed)
EXPOSE 3000

# Start the server
CMD ["node", "dist/index.js"]
