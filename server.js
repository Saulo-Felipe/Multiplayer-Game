const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const path = require('path')

app.use(express.static(path.join(__dirname, 'public')))
app.get('*', (request, response) => {
  response.sendFile(path.join(__dirname, "public", "index.html"))
})


const gameArea = {
  canvasWidth: 10,
  canvasHeight: 10,
  players: {},
  createPlayer,
  deletePlayer,
}


io.on('connection', (socket) => {
  console.log('[New player] --> ', socket.id)

  gameArea.createPlayer(socket.id)

  socket.emit('initial-state', gameArea.players)

  socket.broadcast.emit('add-player', gameArea.players[socket.id])



  socket.on('disconnect', () => {
    console.log('[Disconnect] --> ', socket.id)

    gameArea.deletePlayer(socket.id)
    
    socket.broadcast.emit('delete-player', socket.id)

    socket.disconnect()
  })

  socket.on('test', () => {
    console.log('Recebi')
    io.sockets.emit('teste', 'De volta')
  })

})


function deletePlayer(id) {
  delete gameArea.players[id]
}

function createPlayer(id) {
  gameArea.players[id] = {
    id: id,
    name: 'Jogador',
    x: Math.floor(Math.random() * 500 + 1),
    y: Math.floor(Math.random() * 500 + 1),
    angle: 0,
    directionAngle: 0,
    speed: 0,
    velocity: 4,
    life: 100,
    gunshots: [],
    kills: 0,
  }
}


server.listen(process.env.PORT || 8081, () => console.log('Server is running!'))