// src/services/directWebsocket.ts
import axios from 'axios';

interface DirectWebSocketOptions {
  character: 'maya' | 'miles';
}

// These are the direct WebSocket URLs from network analysis of the Sesame site
// Note: These might need periodic updates if they change their infrastructure
const CHARACTER_WS_URLS: Record<string, string> = {
  'maya': 'wss://api.research.sesame.com/v1/ws/maya',
  'miles': 'wss://api.research.sesame.com/v1/ws/miles'
};

/**
 * Fallback method that returns direct WebSocket URLs without browser automation
 */
export async function getDirectWebSocketUrl({
  character
}: DirectWebSocketOptions): Promise<string | null> {
  try {
    // First try to verify the URL still works by making a test request
    const wsUrl = CHARACTER_WS_URLS[character];
    if (!wsUrl) return null;
    
    // Check if the API endpoint is valid by making a health check request
    // This will validate the base API domain is still correct
    const apiBase = wsUrl.replace('wss://', 'https://').split('/v1/ws')[0];
    await axios.get(`${apiBase}/health`, { timeout: 5000 });
    
    return wsUrl;
  } catch (error) {
    console.error('Direct WebSocket URL verification failed:', error);
    return null;
  }
}
