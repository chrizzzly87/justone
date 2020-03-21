import createApplication from 'express';
import { Server } from 'http';
import socketIo from 'socket.io';

const app = createApplication();
const server = new Server(app);
const io = socketIo(server);

const port = process.env.PORT || '8000';

server.listen(port);

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/', function (req, res) {
    res.status(200).send('Running JustOne Server');
});

let players = [];

/* FAQ

io.sockets.emit will send to all the clients
socket.broadcast.emit will send the message to all the other clients except the newly created connection

*/

io.on('connection', function (socket) {
    console.log('\x1b[37msocket io connection started... Send all player info');
    socket.emit('broadcast', {allPlayers: players});

    socket.on('joinGame', player => {
        console.log('\x1b[37mPlayer joining the lobby: \x1b[36m%s\x1b[37m', player);

        if (players.includes(player)) {
            // name already taken
            console.log('\x1b[31m%s\x1b[37m - name already taken', player);
            socket.emit('checkLogin',false);
        } else {
            // new player joining
            socket.userName = player;

            players.push(player);
            socket.emit('checkLogin',true);


            socket.broadcast.emit('broadcast', {allPlayers: players});
            socket.broadcast.emit('server_msg', `${player} joined the lobby.`);
        }
    });
    socket.on('disconnect', function () {
        console.log(socket.userName + ' tries to disconnect');
        let index = players.indexOf(socket.userName);
        if (index > -1) {
            console.log('\x1b[31m%s - player disconnected \x1b[37m', socket.userName);
            players.splice(index,1);

            socket.broadcast.emit('broadcast', {allPlayers: players});
            socket.broadcast.emit('server_msg', `${socket.userName} left the lobby.`);
        }
    });
});
