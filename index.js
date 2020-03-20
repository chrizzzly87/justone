const express = require('express');
const http = require('http').Server(express);
const allowedOrigins = "http://localhost:* http://127.0.0.1:*";
const socketio = require('socket.io')(http, {origins: allowedOrigins, transport: ['websocket']});
const path = require('path');



const app = express();
const port = process.env.PORT || '8000';

let totalPlayer = 1;

socketio.on('connection', socket => {
    socket.emit('players', totalPlayers);
    socket.on('addPlayer', player => {
        totalPlayer += player;
    });
});

app.get('/', (req, res) => {
    res.status(200).send('Running JustOne Server');
});

app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});

