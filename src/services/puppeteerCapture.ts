// src/services/puppeteerCapture.ts
import puppeteer from 'puppeteer';

interface WebSocketCaptureOptions {
  character: 'maya' | 'miles';
  timeout?: number;
}

const SESAME_URL = 'https://www.sesame.com/research/crossing_the_uncanny_valley_of_voice#demo';

export async function capturePuppeteerWebSocketUrl({
  character,
  timeout = 30_000
}: WebSocketCaptureOptions): Promise<string | null> {
  // Launch puppeteer with system Chrome
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Enable request interception to capture WebSocket URLs
    await page.setRequestInterception(true);
    
    let wsUrl: string | null = null;
    
    // Set up a listener for WebSocket requests
    page.on('request', request => {
      const url = request.url();
      if (url.includes('ws') && url.includes(character.toLowerCase())) {
        wsUrl = url;
      }
      request.continue();
    });

    // Set a timeout for the entire operation
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error('WebSocket capture timed out')), timeout);
    });

    // Navigate to the page and interact with it
    const navigationPromise = (async () => {
      await page.goto(SESAME_URL, { waitUntil: 'domcontentloaded', timeout });
      
      // Wait for buttons to appear and click the character button
      await page.waitForSelector('[data-sentry-component="ButtonChoiceView"]', { timeout });
      
      // Find and click the button with character name
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent?.toLowerCase());
        if (text && text.includes(character.toLowerCase())) {
          await button.click();
          break;
        }
      }
      
      // Wait for WS URL to be captured or timeout
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (wsUrl) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 500);
      });
      
      return wsUrl;
    })();

    // Race between navigation and timeout
    return await Promise.race([navigationPromise, timeoutPromise]);
  } catch (error) {
    console.error('Puppeteer error:', error);
    return null;
  } finally {
    await browser.close();
  }
}
