import express from 'express'
import http from 'http'
import createGame from './public/game.js'
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)
const sockets = new Server(server)

app.use(express.static('./public'))

const game = createGame()

game.movePlayer({ playerId: 'player1', keyPressed: "ArrowRight" })

console.log(game.state)

sockets.on('connection', (socket) => {
    const playerId = socket.id
    console.log(`> Player is connected on server with id: ${playerId}`)
    
    game.addPlayer({ playerId: playerId, playerX: 8, playerY: 7 })


    socket.emit('setup', game.state)
})


server.listen(3000, () => console.log('Server is running!'))