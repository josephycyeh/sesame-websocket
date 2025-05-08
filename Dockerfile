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

# Copy everything and install with production flag
COPY . .
RUN npm install --production=false

# Build TypeScript
RUN npm run build

# Install only Chromium browser
RUN npx playwright install chromium

# Configure environment
ENV NODE_ENV=production
ENV PORT=2000
ENV BROWSER_ARGS="--no-sandbox --disable-setuid-sandbox --use-fake-ui-for-media-stream --use-fake-device-for-media-stream"

# Expose port
EXPOSE 2000

# Start app
CMD ["node", "dist/index.js"]
