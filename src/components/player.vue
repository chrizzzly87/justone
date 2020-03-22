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
                <div class="field has-addons">
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
                </div>
                

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
    import { toast } from 'bulma-toast';

    export default {
        name: 'Player',
        props: {

        },
        data() {
            return {
                socket: {},
                serverMessages: [],
                data: {},
                playerName: '',
                client: '',
                clients: [],
                allPlayers: [],
                totalPlayers: 0,
                online: 0,
                joined: false,
                nameTaken: false,
                ready: false,
                chat: [],
                msg: '',
                minPlayers: 1,
                gameIsRunning: false,
            }
        },
        computed: {
            players() {
                return this.clients.filter(client => client.entered === true);
            },
            readyPlayers() {
                return this.players.filter(client => client.ready === true);
            },
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
        },
        watch: {
            ready() {
                console.log('=> playerReady: ' + this.playerName);
                this.socket.emit('ready', {name: this.playerName, ready: this.ready});
            },
        },
        created() {
            this.socket = io('http://localhost:8000');
            console.log('=== CLIENT SOCKET RUNNING ===');
        },
        mounted() {
            this.socket.on('checkLogin', login => {
                console.log('=> callback for checklogin');
                console.log(login);
                this.nameTaken = !login;
                if (login) {
                    this.joined = true;
                    toast({
                        message: "Hello There",
                        type: "is-primary",
                        position: "top-right",
                        closeOnClick: true,
                        dismissible: true,
                        pauseOnHover: true,
                        opacity: 0.8
                    });
                }
            });
            this.socket.on('server_msg', msg => {
                console.log('=> server msg');
                this.serverMessages.push(msg);
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
            this.socket.on('start', started => {
                console.log('======> game started %s', started);
                if (this.ready) {
                    this.gameIsRunning = started;
                }
            });
        },
    };
</script>

<style scoped>

</style>
