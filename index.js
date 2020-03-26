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

// better: store all clients in global array as objects
// client -> connected (tstamp), id (internal use), name (as given by input), ready (bool), playing (bool), points, idLobby ??
let clients = [];
let currentPlayer = null;

/* FAQ

io.sockets.emit will send to all the clients
socket.broadcast.emit will send the message to all the other clients except the newly created connection

*/

io.on('connection', function (socket) {
    let currentClient = {
        connected: Date.now(),
        id: socket.id,
        name: '',
        ready: false,
        playing: false,
        entered: false,
        points: 0,
    };
    
    clients.push(currentClient);

    console.log('\x1b[37mNew client connected to socket. %s', currentClient.id);
    socket.emit('broadcast', {clients: clients});
    socket.broadcast.emit('broadcast', {clients: clients});


    // lobbies
    socket.on('create lobby', (lobby) => {
        console.log('\x1b[37mNew Lobby will be created: \x1b[36m%s\x1b[37m', lobby);
        socket.join(lobby);
        socket.emit('lobby joined',{success: true, lobby: lobby, client: currentClient});

    });

    socket.on('join lobby', (lobby) => {
        if (lobby in socket.rooms) {
            console.log('\x1b[37mLobby joined: \x1b[36m%s\x1b[37m', lobby);
            socket.join(lobby);
            socket.emit('lobby joined',{success: true, lobby: lobby, client: currentClient});
        } else {
            console.log('\x1b[31mLobby not found: \x1b[36m%s\x1b[37m', lobby);
            socket.emit('lobby joined',{success: false, client: currentClient});
            console.log(JSON.stringify(socket.rooms));
        }
    });


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
            socket.emit('checkLogin',true);

            socket.emit('broadcast', {clients: clients});
            socket.emit('server_msg', `${name} joined the lobby.`);
            socket.broadcast.emit('broadcast',{clients: clients});
            socket.broadcast.emit('server_msg', `${name} joined the lobby.`);

            // emit to player his own details!!
            console.log('\x1b[32mSending client info to %s\x1b[37m', currentClient.id);
            socket.broadcast.to(currentClient.id).emit('client', currentClient);
            socket.to(currentClient.id).emit('client', currentClient);
        }
    });
    socket.on('ready', player => {
        currentClient.ready = player.ready;
        socket.emit('broadcast', {clients: clients});
        socket.broadcast.emit('broadcast',{clients: clients});
        if (player.ready) {
            socket.emit('server_msg', `${currentClient.name} is ready.`);
            socket.broadcast.emit('server_msg', `${currentClient.name} is ready.`);
        }
    });
    socket.on('disconnect', function () {
        console.log(currentClient.name + ' tries to disconnect');
        let index = clients.findIndex(client => client.id === currentClient.id);
        if (index > -1) {
            console.log('\x1b[31m%s - client disconnected \x1b[37m', currentClient.id);
            clients.splice(index,1);

            socket.emit('broadcast', {clients: clients});
            socket.broadcast.emit('broadcast',{clients: clients});

            if (currentClient.entered) {
                socket.emit('server_msg', `${currentClient.name} left the lobby.`);
                socket.broadcast.emit('server_msg', `${currentClient.name} left the lobby.`); 
            }  
        }
    });
    socket.on('chat', chatObj => {
        console.log('= Chat msg from %s: %s', chatObj.name, chatObj.msg);
        socket.emit('chat', chatObj);
        socket.broadcast.emit('chat', chatObj);
    });

    /* === GAME LOGIC === */
    socket.on('startGame', readyPlayers => {
        console.log('Game started for ready players');
        
        socket.emit('start', true);

        // set current player
        currentPlayer = readyPlayers[Math.floor(Math.random() * readyPlayers.length)];
        socket.broadcast.emit('currentPlayer', currentPlayer);
        socket.broadcast.emit('start', true);
        socket.emit('currentPlayer', currentPlayer);
        socket.emit('start', true);
    });
});
