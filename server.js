const express = require('express')
const app = express()
const http = require('http')
const path = require('path')
const { Server } = require('socket.io')

const server = http.createServer(app)
const io = new Server(server)

app.use(express.static(path.join(__dirname, 'public')))
app.get('*', (request, response) => {
    response.sendFile(path.join(__dirname, "public", "index.html"))
})

var GameState = []

io.on('connection', (socket) => {
    
    socket.on('player-move', (state) => {
        for (var c in GameState) {
            if (GameState[c].id === state.id) {

                GameState[c] = {...GameState[c], ...state}
                break
            }
        }

        socket.broadcast.emit('enemy-move', state)
    })

    socket.on("disconnect", () => {
        for (var count in GameState) { // Remove disconnected player
            if (GameState[count].id === socket.id) {
                GameState.splice(count, 1)
                break
            }
        }

        io.sockets.emit('disconnected-player', GameState)
    })

    socket.on('new-player', (player, callback) => {
        socket.broadcast.emit('add-player', player)

        callback({allEnemies: GameState})

        GameState.push(player)
    })

    socket.on('new-gunshot', (gunshoot) => {

        for (var c in GameState) {
            if (GameState[c].id === gunshoot.playerID) {

                GameState[c].gunshots.push(gunshoot)
                break
            } 
        }

        socket.broadcast.emit('add-gunshot', gunshoot)
    })

})


server.listen(process.env.PORT || 8081, () => console.log('Server is running!'))