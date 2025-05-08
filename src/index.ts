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
    console.log('Using direct WebSocket URL method...');
    const wsUrl = await getDirectWebSocketUrl({ character: character as 'maya' | 'miles' });
    
    if (!wsUrl) {
      return res.status(404).json({ 
        success: false, 
        error: 'Failed to get WebSocket URL' 
      });
    }
    
    res.json({ success: true, character, websocketUrl: wsUrl });
  } catch (error) {
    console.error('Error getting WebSocket URL:', error);
    res.status(500).json({ success: false, error: 'Failed to get WebSocket URL' });
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
