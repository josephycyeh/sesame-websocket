#!/bin/bash
# Install Chromium and make sure it works with Playwright

# Install system Chromium
apt-get update && apt-get install -y chromium

# Create symlink if needed
if [ ! -f /usr/bin/chromium-browser ] && [ -f /usr/bin/chromium ]; then
  ln -s /usr/bin/chromium /usr/bin/chromium-browser
fi

# Verify Chromium is installed
chromium --version || chromium-browser --version

# Set environment variables
echo "export CHROMIUM_PATH=/usr/bin/chromium" >> /etc/environment
echo "export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1" >> /etc/environment

echo "Chromium installation complete."
