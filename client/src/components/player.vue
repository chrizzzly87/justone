<template>
    <div>
        {{ totalPlayers }}
        <button @click="addPlayer">Add</button> 
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
                totalPlayers: 0,
            }
        },
        methods: {
            click() {
              this.socket.emit('addPlayer', 1);
            }
        },
        created() {
            this.socket = io('http://localhost:8000');
        },
        mounted() {
            this.socket.on('players', total => {
                this.totalPlayers = total;
            });
        }
    }
</script>

<style scoped>

</style>
