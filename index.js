const express = require('express');
const uid = require('./functions/uid');
const http = require('http');
const url = require('url');
const app = new express();
const port = 8000;
const server = http.createServer(app);
const ws = require('ws');
const wss = new ws.Server({ noServer: true });

app.use(express.static('www'));
let clients = new Set();

let numUsers = 0;


server.on('upgrade', (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, function (ws) {
        wss.emit('connection', ws, req);
    });
});

wss.on('connection', wsConnection);

function wsConnection(ws, req) {
    let addedUser = false;
    ws.room = [];
    let urlQuery = url.parse(req.url, true).query;

    if (urlQuery.name !== undefined) {
        //ws.room = [...ws.room, urlQuery.room];
        ws.name = urlQuery.name;
    }
    // ws.on('open', (msg) => {
    //     console.log(msg);
    // })
    // ws.send(JSON.stringify({ event: 'ion', data: { name: 'ion', message: 'red' } }))
    ws.send(JSON.stringify({ event: 'joined', data: { name: ws.name, message: 'Welcome ' + ws.name } }))

    ws.on('message', msg => {
        console.log(msg)
    })
    ws.on('newUser', (username) => {
        if (addedUser === true) {
            return;
        }
        ws.username = username;
        ++numUsers;
        addedUser = true;
        ws.emit('login', {
            users
        })
        wss.clients.forEach(client => {
            client.send('userJoined', {
                username,
                numUsers
            })
        })
    })

    ws.on('close', () => {
        wss.clients.delete(ws);

    });
}

// function broadcast(message) {
//   clients.forEach(client => {
//     if (client.room.indexOf(JSON.parse(message).room) > -1) {
//       client.send(message)
//     }
//   });
// }

server.listen(port, () => {
    console.log(`Server started on port ${server.address().port} :)`)
})
