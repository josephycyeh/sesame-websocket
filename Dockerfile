# ── Builder Stage ─────────────────────────────────────────────────────────
FROM node:22-slim AS builder

# Where our app lives in the container
WORKDIR /usr/src/app

# Copy only package manifests and lockfile
COPY package.json package-lock.json ./

# Install ALL dependencies (no-optional skips fsevents et al)
RUN npm ci --no-optional

# Bring in source code and build
COPY . .
RUN npm run build

# ── Production Stage ──────────────────────────────────────────────────────
FROM node:22-slim

WORKDIR /usr/src/app

# Only production deps, again skipping optional ones
COPY package.json package-lock.json ./
RUN npm ci --production --no-optional

# Copy compiled output from builder
COPY --from=builder /usr/src/app/dist ./dist

# If your server listens on another port, change this
EXPOSE 3000

# Run the built JS
CMD ["node", "dist/index.js"]
