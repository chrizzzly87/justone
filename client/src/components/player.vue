<template>
    <div>
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
                data: {},
                playerName: '',
                totalPlayers: 0,
                allPlayers: [],
                joined: false,
                nameTaken: false,
            }
        },
        methods: {
            joinGame() {
                console.log('emitting join game with: ' + this.playerName);
                this.socket.emit('joinGame', this.playerName);
            }
        },
        created() {
            this.socket = io('http://localhost:8000');
        },
        mounted() {
            this.socket.on('currentlyOnline', res => {
                console.log('=> callback for currentlyOnline');
                console.log(res);
                this.totalPlayers = res.online;
            });
            this.socket.on('allPlayers', res => {
                console.log('=> callback for allPlayers');
                console.log(res);
                this.allPlayers = res.players;
            });
            this.socket.on('checkLogin', login => {
              console.log('checklogin');
              console.log(login);
                this.nameTaken = !login;
                if (login) {
                  this.joined = true;
                }
            });
        }
    }
</script>

<style scoped>

</style>
