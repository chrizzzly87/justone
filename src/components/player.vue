<template>
    <div class="columns">
        <div class="column is-three-quarters" v-if="gameIsRunning == false">
            <h1 class="title">Just One Lobby</h1>
            <div v-if="joined === false">
                <p>
                    Welcome to the online version of JustOne.<br/>
                    Please enter a username to process to the lobby!
                </p>
                <br/>

                <div class="buttons" v-if="this.lobby === null">
                    <button class="button is-link" 
                        @click="createLobby">
                        Create a lobby
                    </button>
                    <button class="button is-primary" 
                        @click="joinLobby">
                        Join a Lobby
                    </button>
                </div>

                <div v-else>
                    <p>
                        You successfully created a new lobby called {{lobby}}!
                    </p>
                    <p>
                        Copy and paste the url to let other people join your game!<br/>
                    </p>
                    <div class="control">
                        <input class="input" type="text" value="This text is readonly" readonly autofocus v-model="lobbyUrl">
                    </div>
                </div>

                <!-- <div class="field has-addons">
                    <div class="control has-icons-left ">
                        <input class="input" type="text" placeholder="Enter a name" v-model="playerName" >
                        <span class="icon is-small is-left">
                            <i class="fas fa-user"></i>
                        </span>
                    </div>
                    <div class="control">
                        <button class="button is-link " @click="joinGame">
                            Join lobby
                        </button>
                    </div>
                </div> -->
                

                <template v-if="nameTaken">
                    <div class="notification is-danger is-light">
                        Sorry, but this name is already taken. Choose another one!
                    </div>
                </template>
            </div> 
            <div v-else>
                <h1 class="subtitle">Congratulations, {{ playerName }}.</h1>
                <p class="">
                    You successfully joined the Server.<br/>
                    Wait for other players to start the game :) <br/>
                </p>

                <div class="">
                    <label>
                        <input type="checkbox" v-model="ready" :disabled="totalPlayers < 2">
                            Ready for some fun
                    </label>
                </div>
                <div class="notification">
                    <p>
                        Waiting for at least {{ minPlayers }} players to start the game
                    </p>
                    <button class="button is-link" 
                        :disabled="readyPlayers.length < minPlayers"
                        @click="startGame">Start game</button>
                </div>

                <div class="field has-addons">
                    <div class="control has-icons-left ">
                        <input class="input" type="text" placeholder="Chat with the others" v-model="msg" >
                        <span class="icon is-small is-left">
                            <i class="fas fa-user"></i>
                        </span>
                    </div>
                    <div class="control">
                        <button class="button is-link " @click="sendMsg">
                            <span class="icon">
                                <i class="fa fa-paper-plane"></i>
                            </span>
                            <span>
                                Send message
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="column is-three-quarters" v-if="gameIsRunning == true">
            <h1>Current GuessingPlayer: {{ currentPlayer.name }}</h1>
            <div v-if="currentPhase === 'drawCard'">
                <p v-if="currentPlayer.id == player.id">
                    It's your turn, {{ player.name }}! Please select a card
                </p>
                card selection here
            </div>
            <div v-if="currentPhase === 'voteItem'">
                
                <p v-if="currentPlayer.id !== player.id">
                    It's your turn, {{ player.name }}! 
                    Please vote for an item that <strong>{{ currentPlayer.name }}</strong> has to guess
                </p>
                Item selection here
            </div>
            <div v-if="currentPhase === 'writeHint'">
                
                <p v-if="currentPlayer.id !== player.id">
                    It's your turn, {{ player.name }}! 
                    Please write down <strong>JUST ONE</strong> word to help {{currentPlayer.name}}
                </p>
                <div class="field has-addons">
                    <div class="control has-icons-left ">
                        <input class="input" type="text" placeholder="Enter your hint">
                        <span class="icon is-small is-left">
                            <i class="fas fa-user"></i>
                        </span>
                    </div>
                    <div class="control">
                        <button class="button is-link ">
                            Enter
                        </button>
                    </div>
                </div>
            </div>
            <div v-if="currentPhase === 'checkHints'">
                
                <p v-if="currentPlayer.id !== player.id">
                    It's your turn, {{ player.name }}! 
                    Please check all hints and select the duplicates that should be <strong>removed</strong>
                </p>
                Hint selection here
            </div>
            <div v-if="currentPhase === 'guessWord'">
                
                <p v-if="currentPlayer.id == player.id">
                    It's your turn, {{ player.name }}! 
                    Guess the word! Here are your hints
                </p>
                <div class="field has-addons">
                    <div class="control has-icons-left ">
                        <input class="input" type="text" placeholder="Enter your guess">
                        <span class="icon is-small is-left">
                            <i class="fas fa-user"></i>
                        </span>
                    </div>
                    <div class="control">
                        <button class="button is-link ">
                            Enter
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <aside class="column has-background-light">
            <div>
                <h2 class="">
                    <i class="fas fa-users"></i> Players ({{ online }} online, {{ totalPlayers }} in lobby)
                </h2>
                <template v-if="allPlayers.length">
                    <ul>
                        <li v-for="player in players" :key="player.id">
                            <template v-if="player.ready">
                                <i class="fas fa-check-circle has-text-success"></i>
                            </template>
                            <template v-else>
                                <i class="fas fa-circle has-text-grey-lighter"></i>
                            </template>
                            {{ player.name }}
                        </li>
                    </ul>
                </template>
            </div>
            <div>
                <h2 class="">
                    <i class="fas fa-comment-dots"></i> Server messages
                </h2>
                <ul>
                    <li v-for="(message, index) in serverMessages" :key="index">
                        {{message}}
                    </li>
                </ul>
            </div>
            <div class="chat">
                <div class="textarea">
                    <ul>
                        <li v-for="(item, index) in chat" :key="index">
                            {{ item.name }}: {{item.msg }}
                        </li>
                    </ul>
                </div>
            </div>
        </aside>
    </div>
</template>

<script>
    import io from 'socket.io-client';
    import { DialogProgrammatic as Dialog, ToastProgrammatic as Toast } from 'buefy';
    import 'buefy/dist/buefy.css'

    const DOMAIN = process.env.SERVER_DOMAIN || 'http://localhost:8000';
    const GAME_PHASE = [
        'idle',
        'drawCard', // active player
        'voteItem', // others need to choose item
        'writeHint', // others
        'checkHints', // others
        'guessWord', // active player
        'vote' // others
    ];

    export default {
        name: 'Player',
        props: {

        },
        data() {
            return {
                socket: {},
                id: null,
                serverMessages: [],
                playerName: '',
                client: '',
                clients: [],
                allPlayers: [],
                lobby: null,
                totalPlayers: 0,
                online: 0,
                joined: false,
                nameTaken: false,
                ready: false,
                chat: [],
                msg: '',
                minPlayers: 1,
                gameIsRunning: false,
                currentPhase: GAME_PHASE[0],
                currentPlayer: {},
            }
        },
        computed: {
            players() {
                return this.clients.filter(client => client.entered === true);
            },
            readyPlayers() {
                return this.players.filter(client => client.ready === true);
            },
            player() {
                return this.clients.find(client => client.id === this.id);
            },
            lobbyUrl() {
                return window.location.href;
            }
        },
        methods: {
            joinGame() {
                console.log('=> emitting join game with: ' + this.playerName);
                this.socket.emit('joinGame', this.playerName);
            },
            sendMsg() {
                console.log('=> sending message: ' + this.msg);
                this.socket.emit('chat', {name: this.playerName, msg: this.msg});
                this.msg = '';
            },
            startGame() {
                console.log('=> starting game');
                this.socket.emit('startGame', this.readyPlayers);
            },
            joinLobby() {
                console.log('=> join lobby');
                Dialog.prompt({
                    message: `What lobby do you want to join?`,
                    inputAttrs: {
                        type: 'string',
                        placeholder: 'Input Lobby Name',
                    },
                    trapFocus: true,
                    onConfirm: (value) => this.socket.emit('join lobby', value)
                });
            },
            createLobby() {
                console.log('=> create lobby');
                this.socket.emit('create lobby', this.id);
                // lobby returns a value that should change the url and be used to invite new players
            },
            setGamePhase(phase) {
                if (GAME_PHASE.indexOf(phase) > -1) {
                    this.currentPhase = GAME_PHASE.indexOf(phase);
                }
            }
        },
        watch: {
            ready() {
                console.log('=> playerReady: ' + this.playerName);
                this.socket.emit('ready', {name: this.playerName, ready: this.ready});
            },
        },
        created() {
            this.socket = io(DOMAIN);
            console.log('=== CLIENT SOCKET RUNNING ===');

            let url = window.location.href; 
            let pathname = new URL(url).pathname;
            let pathes = pathname.split('/');
            let lobbyIndex = pathes.indexOf('lobby');
            if (lobbyIndex > -1 && pathes.length >= lobbyIndex + 1) {
                this.socket.emit('join lobby', pathes[lobbyIndex + 1]);
            }
        },
        mounted() {
            this.socket.on('checkLogin', login => {
                console.log('=> callback for checklogin');
                console.log(login);
                this.nameTaken = !login;
                if (login) {
                    this.joined = true;
                }
            });
            this.socket.on('server_msg', msg => {
                console.log('=> server msg');
                this.serverMessages.push(msg);
            });
            this.socket.on('client', player => {
                console.log('=> callback: client info');
                this.player = player;
            });
            this.socket.on('broadcast', data => {
                console.log('=> callback for broadcast');
                console.log(data);
                this.clients = data.clients;
                this.online = this.clients.length;
                this.allPlayers = this.clients.map(client => {
                    if (client.entered === true) {
                        return client.name
                    }
                });
                this.totalPlayers = this.clients.filter(client => client.entered === true).length;
            });
            this.socket.on('chat', chatObj => {
                console.log('=> chat msg');
                this.chat.push(chatObj);
            });
            this.socket.on('lobby joined', result => {
                console.log('=> lobby joined');
                if (result.success) {
                    this.lobby = result.lobby;
                    history.pushState(null, null,`/lobby/${this.lobby}`);
                    Toast.open({
                        duration: 5000,
                        message: `Welcome to the lobby! Have fun!`,
                        position: 'is-bottom',
                        type: 'is-dansuccessger'
                    });
                } else {
                    console.error('no such lobby found');
                    Toast.open({
                        duration: 5000,
                        message: `Lobby not found. Please try another name.`,
                        position: 'is-bottom',
                        type: 'is-danger'
                    });
                }
            });
            this.socket.on('start', started => {
                console.log('======> game started %s', started);
                this.gameIsRunning = started;
                this.currentPhase = GAME_PHASE[1];
            });
            this.socket.on('currentPlayer', player => {
                console.log('Current player is %s', player.name);
                this.currentPlayer = player;
            });
            this.socket.on('connect', () => {
                this.id = this.socket.id;
            });
        },
    };
</script>

<style scoped>

</style>
