// src/index.ts
import express, { Request, Response } from 'express';
import path from 'path';
import { captureWebSocketUrl } from './services/websocketCapture';
import { getDirectWebSocketUrl } from './services/directWebsocket';
import { capturePuppeteerWebSocketUrl } from './services/puppeteerCapture';

const app = express();
const port = process.env.PORT || 2000;

// Body parsing
app.use(express.json());

// Serve frontend static assets
app.use(express.static(path.join(__dirname, '../public')));

// Capture WebSocket URL endpoint
app.get('/capture-websocket/:character', async (req: Request, res: Response) => {
  const character = req.params.character.toLowerCase();
  if (character !== 'maya' && character !== 'miles') {
    return res.status(400).json({ success: false, error: 'Character must be "maya" or "miles"' });
  }

  try {
    let wsUrl = null;
    
    // Try puppeteer method first (most likely to work)
    try {
      console.log('Trying Puppeteer method...');
      wsUrl = await capturePuppeteerWebSocketUrl({ character: character as 'maya' | 'miles' });
      if (wsUrl) {
        console.log('Puppeteer method succeeded');
      }
    } catch (e) {
      console.error('Puppeteer method failed:', e);
    }
    
    // Try playwright method if puppeteer fails
    if (!wsUrl) {
      try {
        console.log('Trying Playwright method...');
        wsUrl = await captureWebSocketUrl({ character: character as 'maya' | 'miles' });
        if (wsUrl) {
          console.log('Playwright method succeeded');
        }
      } catch (e) {
        console.error('Playwright method failed:', e);
      }
    }
    
    // Try direct URL method as last resort
    if (!wsUrl) {
      console.log('Trying direct WebSocket URL method...');
      wsUrl = await getDirectWebSocketUrl({ character: character as 'maya' | 'miles' });
      if (wsUrl) {
        console.log('Direct method succeeded');
      }
    }
    
    if (!wsUrl) {
      return res.status(404).json({ 
        success: false, 
        error: 'Failed to get WebSocket URL through all available methods' 
      });
    }
    
    res.json({ success: true, character, websocketUrl: wsUrl });
  } catch (error) {
    console.error('Error capturing WebSocket URL:', error);
    res.status(500).json({ success: false, error: 'Failed to capture WebSocket URL' });
  }
});

// Add health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback for SPA routing
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
