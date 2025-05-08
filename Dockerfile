# ── Builder Stage ─────────────────────────────────────────────────────────
FROM node:22-slim AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install all dependencies (skip optional like fsevents)
RUN npm install --no-optional

# Copy source and build
COPY . .
RUN npm run build

# ── Production Stage ──────────────────────────────────────────────────────
FROM node:22-slim AS runner

# Set working directory
WORKDIR /usr/src/app

# Copy only prod deps manifests
COPY package.json package-lock.json ./

# Install only production deps (skip optional)
RUN npm install --production --no-optional

# Copy built output and any other needed assets
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port your app uses (adjust if needed)
EXPOSE 3000

# Start the server
CMD ["node", "dist/index.js"]
