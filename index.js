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

let totalPlayer = 1;

io.on('connection', function (socket) {
    console.log('socket io connection started...');
    socket.emit('news', { hello: 'world' });
    console.log('emitting hello world...');
    socket.on('addPlayer', player => {
        console.log('getting new player info', addPlayer);
        totalPlayer += player;
    });
});

