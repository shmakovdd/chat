const {MongoClient} = require('mongodb')
const DB_URL = 'mongodb+srv://mortex:12345chat@cluster0.20i75.mongodb.net/my_chat?retryWrites=true&w=majority'
const client = new MongoClient(DB_URL)


const PORT = process.env.PORT || 5000;
const INDEX = '/index.html';
var path = require('path');
const { Server } = require('ws');
let public = path.join(__dirname, '/public');
const express = require("express");
const app = express()
app.use('/', express.static(public));


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


const startApp = async () => {
    let online = 0;

    await client.connect();
    const db = client.db('my_chat');
    const messageCollection = db.collection('messages');

    const server = app
    .get("/", (req, res) => res.sendFile(__dirname + INDEX))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));
        

    const wss = new Server({ server });
    wss.on('connection', (ws) => {
        online += 1;
        pingPong(wss.clients)

        ws.on('message', async message => {
            
            message = JSON.parse(message);

            if (message.type === 'connection') {
                const allMessages = await messageCollection.find({}).toArray()
                message.online = online;
                message.messageHistory = allMessages;
            }

            if (message.type === 'message') {
                messageCollection.insertOne({
                    nickname: message.nickname,
                    message: message.message
                })
            }

            if(message.type !== 'pong') {
                wss.clients.forEach( client => {
                    client.send(JSON.stringify(message))
                })
            }

        })
        ws.on('close', ws => {
            online -= 1;

            let message = {
                type: 'connection_is_lost',
                online: online,
            }
            wss.clients.delete(ws)


            wss.clients.forEach( client => {
                client.send(JSON.stringify(message))
            })
        })
    })

}

startApp()








