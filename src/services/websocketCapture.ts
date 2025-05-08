// src/services/websocketCapture.ts
import { chromium, Browser, Page } from 'playwright';

interface WebSocketCaptureOptions {
  character: 'maya' | 'miles';
  timeout?: number;
}

const SESAME_URL = 'https://www.sesame.com/research/crossing_the_uncanny_valley_of_voice#demo';

export async function captureWebSocketUrl({
  character,
  timeout = 30_000
}: WebSocketCaptureOptions): Promise<string | null> {
  const browser: Browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--no-sandbox'
    ]
  });

  try {
    const context = await browser.newContext({ permissions: ['microphone'] });
    const page: Page = await context.newPage();

    // Set global timeouts
    page.setDefaultTimeout(timeout);
    page.setDefaultNavigationTimeout(timeout);

    // Enable CDP to listen for WebSocket creation
    const client = await context.newCDPSession(page);
    await client.send('Network.enable');

    let resolveWs!: (url: string) => void;
    const wsPromise = new Promise<string>(resolve => (resolveWs = resolve));
    client.on('Network.webSocketCreated', ({ url }) => resolveWs(url));

    // 1) Navigate until DOM content is loaded
    await page.goto(SESAME_URL, { waitUntil: 'domcontentloaded' });

    // 2) Wait for the button choice view
    await page.waitForSelector('[data-sentry-component="ButtonChoiceView"]');

    // 3) Click the character button by accessible role
    const btn = page.getByRole('button', { name: new RegExp(character, 'i') });
    await btn.waitFor();
    await btn.click();

    // 4) Race between WebSocket capture and a short timeout
    let wsUrl: string | null = null;
    try {
      wsUrl = (await Promise.race([
        wsPromise,
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('WebSocket capture timed out')), 20_000)
        )
      ])) as string;
    } catch {
      console.warn('WebSocket URL not captured in time');
    }

    return wsUrl;
  } finally {
    await browser.close();
  }
}
