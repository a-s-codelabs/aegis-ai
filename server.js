/**
 * Custom Next.js Server with WebSocket Support
 * 
 * This server handles both HTTP requests (Next.js app) and WebSocket connections
 * for ElevenLabs media streaming at /ws/elevenlabs-media
 * 
 * IMPORTANT: This requires the 'ws' package. Install with:
 *   npm install ws
 *   npm install --save-dev @types/ws
 * 
 * Usage: 
 *   node server.js
 *   Or add to package.json: "dev:server": "node server.js"
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Import WebSocket server handler (we'll need to compile TS or use a different approach)
// For now, we'll start the WebSocket server inline
let wss = null;

app.prepare().then(async () => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Start WebSocket server on the same port, handling /ws/elevenlabs-media path
  wss = new WebSocketServer({ noServer: true });

  // Handle WebSocket upgrade requests
  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url);

    // Handle WebSocket upgrade for /ws/elevenlabs-media
    if (pathname === '/ws/elevenlabs-media') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        // Import and use the WebSocket handler
        // Note: This requires the websocket-server to be compiled or we need to use a different approach
        handleWebSocketConnection(ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // WebSocket connection handler (simplified version - in production, use the full websocket-server.ts)
  async function handleWebSocketConnection(ws, req) {
    console.log('[WS Server] New connection from ElevenLabs');

    // Try to import the WebSocket server handler
    // In production, you might want to compile TS to JS or use ts-node
    try {
      // For now, we'll use a basic handler
      // In production, compile server/websocket-server.ts and import it
      console.log('[WS Server] WebSocket connection established');
      console.log('[WS Server] Note: Full WebSocket server handler should be imported from server/websocket-server.ts');
      
      // Basic message handling
      ws.on('message', (data) => {
        console.log('[WS Server] Received message:', data.toString().substring(0, 100));
      });

      ws.on('error', (error) => {
        console.error('[WS Server] WebSocket error:', error);
      });

      ws.on('close', () => {
        console.log('[WS Server] WebSocket connection closed');
      });
    } catch (error) {
      console.error('[WS Server] Error setting up WebSocket handler:', error);
    }
  }

  server
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> WebSocket server ready at ws://${hostname}:${port}/ws/elevenlabs-media`);
      console.log(`> Note: For full WebSocket functionality, ensure server/websocket-server.ts is properly integrated`);
    });
});

