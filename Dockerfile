FROM node:16-bullseye

# Install dependencies for Playwright
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxcb1 \
    libxkbcommon0 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libatspi2.0-0 \
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

# Install only Chromium browser and ensure skip browser download validation
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0
RUN npx playwright install chromium --with-deps

# Configure environment
ENV NODE_ENV=production
ENV PORT=2000
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV BROWSER_ARGS="--no-sandbox --disable-setuid-sandbox --use-fake-ui-for-media-stream --use-fake-device-for-media-stream"

# Install axios explicitly (required for fallback method)
RUN npm install axios

# Expose port
EXPOSE 2000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O - http://localhost:2000/health || exit 1

# Start app
CMD ["node", "dist/index.js"]
