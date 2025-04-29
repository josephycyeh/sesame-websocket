import { Browser, Page } from 'puppeteer-core';
import puppeteer from 'puppeteer-core';

interface WebSocketCaptureOptions {
  character: 'maya' | 'miles';
  timeout?: number;
}

const SESAME_URL = 'https://www.sesame.com/research/crossing_the_uncanny_valley_of_voice#demo';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

export async function captureWebSocketUrl({
  character,
  timeout = 15000
}: WebSocketCaptureOptions): Promise<string | null> {
  const browser = await initializeBrowser();

  try {
    const page = await setupPage(browser);

    // Set up WebSocket capture with Promise
    const client = await page.createCDPSession();
    await client.send('Network.enable');

    const wsUrlPromise = new Promise<string>((resolve) => {
      client.on('Network.webSocketCreated', ({url}: {url: string}) => {
        console.log('WebSocket Created:', url);
        resolve(url);
      });
    });

    // Navigate and interact with the page
    await navigateToSesame(page, timeout);
    await clickCharacterButton(page, character);
    
    // Wait for WebSocket URL with timeout
    try {
      const wsUrl = await Promise.race([
        wsUrlPromise,
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('WebSocket capture timeout')), 5000)
        )
      ]);
      return wsUrl;
    } catch (error) {
      console.log('Failed to capture WebSocket URL:', error);
      return null;
    }
  } finally {
    await browser.close();
  }
}

async function initializeBrowser(): Promise<Browser> {
  return puppeteer.launch({
    headless: false,
    executablePath: CHROME_PATH,
    args: [
      '--no-sandbox',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream'
    ],
    devtools: true
  });
}

async function setupPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();
  const context = browser.defaultBrowserContext();
  await context.overridePermissions('https://www.sesame.com', ['microphone']);
  return page;
}

async function navigateToSesame(page: Page, timeout: number): Promise<void> {
  await page.goto(SESAME_URL, {
    waitUntil: 'domcontentloaded',
    timeout
  });
  
  await page.waitForSelector('[data-sentry-component="ButtonChoiceView"]', { timeout: 5000 });
}

async function clickCharacterButton(page: Page, character: 'maya' | 'miles'): Promise<void> {
  const testId = `${character}-button`;
  const buttonSelector = `[data-testid="${testId}"]`;
  
  await page.waitForSelector(buttonSelector, { timeout: 5000 });
  await page.click(buttonSelector);
} 