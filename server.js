const server = require('http').createServer();
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });
});

const listener = server.listen(process.env.PORT || 3000, () => {
  console.log('Signaling server running on port ' + listener.address().port);
});
