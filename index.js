var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

const port = process.env.PORT || '8000';

server.listen(port);

app.use(function(req, res, next) {
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
    socket.emit('currentlyOnline', { online: totalPlayer });
    socket.on('joinGame', player => {
        console.log('Player joining the lobby', player);
        players.push(player);
        totalPlayer = players.length;

        socket.emit('currentlyOnline', { online: totalPlayer });
        socket.emit('allPlayers', { players: players });
    });
});
