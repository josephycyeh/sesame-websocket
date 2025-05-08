# ── Base Node Image (has npm) ─────────────────────────────────────────────
FROM node:18

# Create & set working directory
WORKDIR /usr/src/app

# Copy manifests (lockfile ensures exact versions)
COPY package.json package-lock.json ./

# Install dependencies, skip optional (no more fsevents noise)
RUN npm install --no-optional

# Copy the rest of your source
COPY . .

# Build TS and then remove devDependencies from node_modules
RUN npm run build \
 && npm prune --production

# Expose your app’s port (adjust if needed)
EXPOSE 3000

# Start the compiled server
CMD ["node", "dist/index.js"]
