FROM mcr.microsoft.com/playwright:v1.35.0-focal

WORKDIR /app

# Install Node.js dependencies first (for better caching)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript project
RUN npm run build

# Set browser flags for containerized environment
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Additional browser arguments for headless mode
ENV BROWSER_ARGS="--no-sandbox --disable-setuid-sandbox --use-fake-ui-for-media-stream --use-fake-device-for-media-stream"

# Expose the application port
EXPOSE 2000

# Default environment variables
ENV PORT=2000
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/index.js"]
