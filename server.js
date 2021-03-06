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

function postMessageHistory(messagesCollection, client) {
    let messageToLoad = 30
    let spliceFrom = 0
  
    return async function() {
        const messages = (await messagesCollection.find({})
                                                            .sort({$natural: -1})
                                                            .limit(messageToLoad)
                                                            .toArray()).splice(spliceFrom, messageToLoad)     
        messageToLoad += 30
        spliceFrom += 30                                                                            
        let message = {
        type: 'history',
        messageHistory: messages
        };
        client.send(JSON.stringify(message))
    }
}


const startApp = async () => {
    let online = 0;
    let nicknamesArray = [];
    await client.connect();
    const db = client.db('my_chat');
    const messageCollection = db.collection('messages');

    const server = app
    .get("/", (req, res) => res.sendFile(__dirname + INDEX))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));
        

    const wss = new Server({ server });
    wss.on('connection', async (ws) => {
        let nickname = ''

        let postChatHistory = postMessageHistory(messageCollection, ws)
        online += 1;
        pingPong(wss.clients)
        ws.on('message', async message => {
            
            message = JSON.parse(message);
            
            if (message.type === 'connection') {
                message.online = online;
                nickname = message.nickname
                nicknamesArray.push(nickname)
                message.nicknames = nicknamesArray
            }

            if (message.type === 'message') {
                messageCollection.insertOne({
                    nickname: message.nickname,
                    message: message.message
                })
            }

            if (message.type === 'history') {
                await postChatHistory()
            }

            if(message.type !== 'pong' && message.type !== 'history') {
                wss.clients.forEach( client => {
                    client.send(JSON.stringify(message))
                })
            }
        })
        await postChatHistory()
        ws.on('close', ws => {
            online -= 1;
            nicknamesArray = nicknamesArray.filter(nick => nick !== nickname)
            let message = {
                type: 'connection_is_lost',
                online: online,
                nickname: nickname,
                nicknames: nicknamesArray
            }
            wss.clients.delete(ws)

            wss.clients.forEach( client => {
                client.send(JSON.stringify(message))
            })
        })
    })

}

startApp()








