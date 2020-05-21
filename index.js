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

app.use(express.static('www'));


server.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, function (ws) {
    wss.emit('connection', ws, req);
  });
});

wss.on('connection', wsConnection);

function wsConnection(ws, req) {
  i += 1;
  ws.id = "unique Id " + uid(4);
  const randomRoomId = uid(8);
  ws.room = []

  let urlQuery = url.parse(req.url, true).query;
  if (urlQuery.room !== undefined) {
    ws.room = [...ws.room, urlQuery.room];
  }
  ws.on('message', (message) => {
    console.log(message + 'from ' + ws.id);
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
