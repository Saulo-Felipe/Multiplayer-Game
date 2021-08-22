import express from 'express'
import http from 'http'
import createGame from './public/game.js'
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)
const sockets = new Server(server)

app.use(express.static('./pulic'))

const game = createGame()
game.addPlayer({ playerId: 'player1', playerX: 0, playerY: 0 })
game.addPlayer({ playerId: 'player2', playerX: 2, playerY: 2 })
game.addFruit({ fruitId: 2, fruitX: 4, fruitY: 4 })
game.addFruit({ fruitId: 3, fruitX: 6, fruitY: 2 })
game.addFruit({ fruitId: 4, fruitX: 6, fruitY: 9 })

game.movePlayer({ playerId: 'player1', keyPressed: "ArrowRight" })

console.log(game.state)

sockets.on('connection', (socket) => {
    const playerId = socket.id

    console.log(`> Player is connected on server with id: ${playerId}`)
})


server.listen(3000, () => console.log('Server is running!'))