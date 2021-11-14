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
var ranking = []


function updateRanking() {
    GameState.sort((a, b) => a.kills > b.kills ? 1 : -1).reverse()
    ranking = []

    for (var c=0; c < 5; c++) {
        ranking.push(GameState[c])
    }
}


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
                updateRanking()
                break
            }
        }

        io.sockets.emit('disconnected-player', {GameState, playerID: socket.id})
    })

    socket.on('new-player', (player, callback) => {
        socket.broadcast.emit('add-player', player)

        callback({allEnemies: GameState})

        GameState.push(player)
    })

    socket.on('new-gunshot', (gunshot) => {

        for (var c in GameState) {
            if (GameState[c].id === gunshot.playerID) {

                GameState[c].gunshots.push(gunshot)
                break
            } 
        }

        socket.broadcast.emit('add-gunshot', gunshot)
    })

    socket.on('gunshot-collision', (state) => {
        const playerID = state.playerGunshot
        const enemyID = state.enemy

        for (var p in GameState) {
            if (GameState[p].id === playerID) {

                GameState[p].gunshots.splice(state.gunshotPosition, 1)
                break
            }
        }

        for (var c in GameState) {
            if (GameState[c].id === enemyID) {

                GameState[c].life -= 10

                io.sockets.emit('add-gunshot-collision', {
                    life: GameState[c].life, 
                    id: GameState[c].id, 
                    removeID: playerID, 
                    gunshotIndex: state.gunshotPosition
                })

                if (GameState[c].life <= 0) {
                    for (var count in GameState) {
                        if (GameState[count].id === playerID) {
                            GameState[count].kills += 1
                        }
                    }

                    console.log(`JOGADOR: ${playerID} MATOU ${enemyID}`)
                    updateRanking()
                    io.sockets.emit('update-ranking', ranking)
                }
                
                break
            }
        }

    })

    socket.on('player-dead', (id) => {

        for (var c in GameState) {
            if (GameState[c].id === id) {
                GameState.splice(c, 1)
            }
        }

        socket.broadcast.emit('player-dead-delete', id)
    })

})


server.listen(process.env.PORT || 8081, () => console.log('Server is running!'))