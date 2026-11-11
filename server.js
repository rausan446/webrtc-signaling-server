
const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 10000;

// Create HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebRTC Signaling Server is Running!');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    // Broadcast message to other connected clients
    wss.clients.forEach((client) => {
      if (
        client !== ws &&
        client.readyState === WebSocket.OPEN
      ) {
        client.send(message.toString());
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Listen on Render's assigned port
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Signaling server running on port ${PORT}`);
});
