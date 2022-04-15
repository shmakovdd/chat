// import {WebSocketServer}  from 'ws';
const PORT = process.env.PORT || 3000;


const WebSocket = require("ws");
const wss = new WebSocket.Server({
    port: PORT,
  });
wss.on('connection', (ws) => {
    ws.on('message', message => {
        wss.clients.forEach( client => {
            client.send(message)
        })
    })
})