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
let totalPlayer = players.length;

io.on('connection', function (socket) {
    console.log('socket io connection started...');
    socket.emit('currentlyOnline', totalPlayer);
    socket.on('joinGame', player => {
        console.log('\x1b[37mPlayer joining the lobby: \x1b[36m%s\x1b[37m', player);

        if (players.includes(player)) {
            // name already taken
            console.log('\x1b[31mName already taken');
            socket.emit('checkLogin',false);
        } else {
            players.push(player);
            totalPlayer = players.length;
            socket.emit('checkLogin',true);
            socket.emit('currentlyOnline', totalPlayer);
            socket.emit('allPlayers', players);
        }
    });
});
