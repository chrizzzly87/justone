<template>
    <div>
        <section>
        <h1>Just One Lobby</h1>
        <p>
            ({{ totalPlayers }} players online)
            <template v-if="allPlayers.length">
                <ul>
                    <li v-for="name in allPlayers" :key="name">
                        {{ name }} <span v-if="readyPlayers.includes(name)">(ready)</span>
                    </li>
                </ul>
            </template>
        </p>

        <div v-if="joined === false">
            <input type="text" v-model="playerName" placeholder="Playername"/>
            <button @click="joinGame">Join lobby</button>

            <template v-if="nameTaken">
                Sorry, but this name is already taken. Choose another one!
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
        </section>
        <aside>
        <ul>
            <li v-for="(message, index) in serverMessages" :key="index">
                {{message}}
            </li>
        </ul>
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
