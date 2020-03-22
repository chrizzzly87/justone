<template>
    <div class="columns">
        <div class="column is-three-quarters">
            <h1 class="title">Just One Lobby</h1>
            <p>
                Welcome to the online version of JustOne.<br/>
                Please enter a username to process to the lobby!
            </p>

            <div v-if="joined === false">
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
                <h4>Congratulations, {{ playerName }}.</h4>
                You successfully joined the Server. Wait for other players to start the game :)

                <div>
                    <label>
                        <input type="checkbox" v-model="ready" :disabled="totalPlayers < 2"> Ready for some fun
                    </label>
                    <p v-if="totalPlayers < 2">Waiting for at least 2 players</p>
                </div>
            </div>
        </div>
        <aside class="column has-background-light">
            <div>
                <h2 class="">
                    <i class="fas fa-users"></i> Players ({{ totalPlayers }} online)
                </h2>
                <template v-if="allPlayers.length">
                    <ul>
                        <li v-for="name in allPlayers" :key="name">
                            {{ name }} <span v-if="readyPlayers.includes(name)">(ready)</span>
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
        </aside>
    </div>
</template>

<script>
    import io from 'socket.io-client';
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
                allPlayers: [],
                readyPlayers: [],
                totalPlayers: 0,
                joined: false,
                nameTaken: false,
                ready: false,
            }
        },
        methods: {
            joinGame() {
                console.log('=> emitting join game with: ' + this.playerName);
                this.socket.emit('joinGame', this.playerName);
            },
        },
        watch: {
            ready() {
                console.log('=> playerReady: ' + this.playerName);
                this.socket.emit('ready', this.playerName);
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
                }
            });
            this.socket.on('server_msg', msg => {
                console.log('=> server msg');
                this.serverMessages.push(msg);
            });
            this.socket.on('broadcast', data => {
                console.log('=> callback for broadcast');
                console.log(data);
                this.allPlayers = data.allPlayers; // not updating though
                this.totalPlayers = data.allPlayers.length;
            });
            this.socket.on('readyPlayers', readyPlayers => {
                console.log('=> callback for ready');
                console.log(readyPlayers);
                this.readyPlayers = readyPlayers;
            });
        },
    };
</script>

<style scoped>

</style>
