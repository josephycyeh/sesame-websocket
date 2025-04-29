import express, { Request, Response } from 'express';
import { captureWebSocketUrl } from './services/websocketCapture';

const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON bodies
app.use(express.json());

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Voice AI Backend!' });
});

// WebSocket capture endpoint
app.get('/capture-websocket/:character', async (req: Request, res: Response) => {
  const character = req.params.character.toLowerCase();
  
  if (character !== 'maya' && character !== 'miles') {
    return res.status(400).json({
      success: false,
      error: 'Character must be either "maya" or "miles"'
    });
  }

  try {
    const wsUrl = await captureWebSocketUrl({ 
      character: character as 'maya' | 'miles',
      timeout: 15000
    });
    
    if (!wsUrl) {
      return res.status(404).json({
        success: false,
        error: 'No WebSocket URL was captured'
      });
    }

    res.json({ 
      success: true,
      character,
      websocketUrl: wsUrl 
    });
  } catch (error) {
    console.error('Error capturing WebSocket URL:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to capture WebSocket URL' 
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 