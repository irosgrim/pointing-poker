const express = require('express');
const http = require('http');
const app = new express();
const port = 8000;
const server = http.createServer(app);
const ws = require('ws');
const wss = new ws.Server({ noServer: true });

const clients = new Set();

app.use(express.static('www'));


server.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, function (ws) {
    wss.emit('connection', ws, req);
  });
});

wss.on('connection', wsConnection);

function wsConnection(ws) {
  console.log(wss.clients.size);
  clients.add(ws);

  ws.on('message', (message) => {
    console.log(message);
    for (let client of clients) {
      client.send(message);
    }
  })

  ws.on('close', () => clients.delete(ws));
}

server.listen(port, () => {
  console.log(`Server started on port ${server.address().port} :)`)
})