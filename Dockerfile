FROM node:16-bullseye

# Significantly reduced dependencies since we're not using browser automation
RUN apt-get update && apt-get install -y \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./
RUN npm install --production=false

# Copy source code
COPY tsconfig.json ./
COPY src ./src
COPY public ./public

# Build TypeScript
RUN npm run build

# Configure environment
ENV NODE_ENV=production
ENV PORT=2000

# Install axios explicitly (required for direct method)
RUN npm install axios

# Expose port
EXPOSE 2000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O - http://localhost:2000/health || exit 1

# Start app
CMD ["node", "dist/index.js"]
