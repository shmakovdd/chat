
// const PORT = process.env.PORT || 5000;
// const INDEX = '/index.html';
// var path = require('path');
// const { Server } = require('ws');

// const express = require("express");
// const app = express()
// app.use('/p', express.static(public));
// const server = app
//   .get("/", (req, res) => res.sendFile(__dirname + INDEX))
//   .listen(PORT, () => console.log(`Listening on ${PORT}`));




// const wss = new Server({ server });
// wss.on('connection', (ws) => {
//     console.log('Client connected');
//     ws.on('message', message => {
//         wss.clients.forEach( client => {
//             client.send(message)
//         })
//     })
// })


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




const wss = new Server({ server });
wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('message', message => {
        wss.clients.forEach( client => {
            client.send(message)
        })
    })
})


// let public = path.join(__dirname, '/public');