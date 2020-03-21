<template>
    <div>
        <section>
        <h1>Just One Lobby</h1>
        <p>
            ({{ totalPlayers }} players online)
            <template v-if="allPlayers.length">
                <ul>
                    <li v-for="name in allPlayers" :key="name">
                        {{ name }}
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
                totalPlayers: 0,
                joined: false,
                nameTaken: false,
                
            }
        },
        methods: {
            joinGame() {
                console.log('=> emitting join game with: ' + this.playerName);
                this.socket.emit('joinGame', this.playerName);
            }
        },
        created() {
            this.socket = io('http://localhost:8000');
            console.log('=== CLIENT SOCKET RUNNING ===');
        },
        mounted() {
            this.socket.on('allPlayers', players => {
                console.log('=> callback for allPlayers');
                console.log(players);
                this.allPlayers = players; // not updating though
                this.totalPlayers = this.allPlayers.length;
            });
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
                this.totalPlayers = this.allPlayers.length;
            });
        },
    };
</script>

<style scoped>

</style>
