const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PORT = process.env.PORT || 10000;

// HTTP server: serves the app page at "/"
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url.startsWith('/?') || req.url === '/index.html') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('index.html not found');
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
  } else if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebRTC Signaling Server is Running!');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.room = null;
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (message) => {
    const text = message.toString();
    let msg;
    try { msg = JSON.parse(text); } catch { return; }

    // First message must be a join with a room name (acts as a passcode)
    if (msg.type === 'join') {
      ws.room = String(msg.room || '').slice(0, 100);
      return;
    }
    if (!ws.room) return;

    // Relay only to other clients in the same room
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN && client.room === ws.room) {
        client.send(text);
      }
    });
  });
});

// Keep connections alive (Render closes idle sockets) and drop dead ones
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 25000);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Signaling server running on port ${PORT}`);
});
