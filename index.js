const express = require('express');
const uid = require('./functions/uid');
const http = require('http');
const url = require('url');
const app = new express();
const port = 8000;
const server = http.createServer(app);
const ws = require('ws');
const wss = new ws.Server({ noServer: true });

let i = 0;
let clients = new Set();
app.use(express.static('www'));


server.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, function (ws) {
    wss.emit('connection', ws, req);
  });
});

wss.on('connection', wsConnection);

function wsConnection(ws, req) {
  i += 1;
  ws.room = []
  const currentClients = [];

  let urlQuery = url.parse(req.url, true).query;
  if (urlQuery.room !== undefined && urlQuery.name !== undefined) {
    if (currentClients.indexOf(urlQuery.name) > -1) {
      ws.send('the name is taken');
      return;
    } else {
      ws.room = [...ws.room, urlQuery.room];
      ws.name = urlQuery.name;
    }
    wss.clients.forEach(client => currentClients.push(client.name));
  }
  console.log(currentClients)

  ws.on('message', (message) => {
    // console.log(message + 'from ' + ws.name);
    // for (let client of clients) {
    //   client.send(message);
    // }
    wss.clients.forEach(client => {
      if (client.room.indexOf(urlQuery.room) > -1) {
        client.send(message)
      }
    })

  })

  ws.on('close', () => wss.clients.delete(ws));
}

function broadcast(message) {
  clients.forEach(client => {
    if (client.room.indexOf(JSON.parse(message).room) > -1) {
      client.send(message)
    }
  });
}

server.listen(port, () => {
  console.log(`Server started on port ${server.address().port} :)`)
})
