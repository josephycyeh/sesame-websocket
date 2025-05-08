// src/services/puppeteerCapture.ts
// Empty placeholder file to maintain imports
// This method is no longer used as we've switched to direct WebSocket URLs

interface WebSocketCaptureOptions {
  character: 'maya' | 'miles';
  timeout?: number;
}

export async function capturePuppeteerWebSocketUrl({
  character,
  timeout = 30_000
}: WebSocketCaptureOptions): Promise<string | null> {
  console.warn('Puppeteer method is deprecated and will always return null');
  return null;
}
