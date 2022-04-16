const PORT = process.env.PORT || 5000;
const INDEX = '/index.html';
var path = require('path');
const { Server } = require('ws');
let public = path.join(__dirname, '/public');
const express = require("express");
const app = express()
app.use('/', express.static(public));
const server = app
  .get("/", (req, res) => res.sendFile(__dirname + INDEX))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));


function pingPong(clients) {
    let message = {
        type: 'ping'
    }

    setInterval(() => {
        clients.forEach( client => {
            client.send(JSON.stringify(message))
        })
    }, 5000*10)

}

const wss = new Server({ server });
wss.on('connection', (ws) => {

    
    pingPong(wss.clients)

    ws.on('message', message => {
        
        message = JSON.parse(message);
        if(message.type !== 'pong') {
            wss.clients.forEach( client => {
                client.send(JSON.stringify(message))
            })
        }

    })
    ws.on('close', ws => {
        let message = {
            type: 'connection_is_lost',
        }
        wss.clients.delete(ws)
        wss.clients.forEach( client => {
            client.send(JSON.stringify(message))
        })
    })
})

