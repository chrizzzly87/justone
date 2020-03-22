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
let ready = [];

// better: store all clients in global array as objects
// client -> connected (tstamp), id (internal use), name (as given by input), ready (bool), playing (bool), points, idLobby ??
let clients = [];

/* FAQ

io.sockets.emit will send to all the clients
socket.broadcast.emit will send the message to all the other clients except the newly created connection

*/

io.on('connection', function (socket) {
    console.log('\x1b[37msocket io connection started... Send all player info');
    let currentClient = {
        connected: Date.now(),
        id: Date.now(),
        name: '',
        ready: false,
        playing: false,
        entered: false,
        points: 0,
    };
    this.socket = currentClient;
    clients.push(currentClient);

    socket.emit('broadcast', {clients: clients});

    socket.on('joinGame', name => {
        console.log('\x1b[37mPlayer joining the lobby: \x1b[36m%s\x1b[37m', name);
        if (clients.filter(client => client.name === name).length > 0) {
            // name already taken
            console.log('\x1b[31m%s\x1b[37m - name already taken', name);
            socket.emit('checkLogin',false);
        } else {
            // new player joining
            currentClient.name = name;
            currentClient.entered = true;
            // clients.push(player);
            socket.emit('checkLogin',true);

            socket.emit('broadcast', {clients: clients});
            socket.broadcast.emit('broadcast',{clients: clients});
            socket.broadcast.emit('server_msg', `${name} joined the lobby.`);
        }
    });
    socket.on('ready', player => {
        ready.push(player);
        socket.emit('readyPlayers', ready);
    });
    socket.on('disconnect', function () {
        console.log(currentClient.name + ' tries to disconnect');
        let index = clients.findIndex(client => client.id === currentClient.id);;
        if (index > -1) {
            console.log('\x1b[31m%s - player disconnected \x1b[37m', currentClient.name);
            clients.splice(index,1);

            socket.emit('broadcast', {clients: clients});
            socket.broadcast.emit('broadcast',{clients: clients});
            socket.broadcast.emit('server_msg', `${currentClient.name} left the lobby.`);
        }
    });
});
