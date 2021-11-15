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
  canvasWidth: 1500,
  canvasHeight: 800,
  players: {},
  createPlayer,
  deletePlayer,
  movePlayer,
  sendMoviment,
  walkCollision,
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

  socket.on('move-player', (newMoviment) => {
    gameArea.movePlayer(newMoviment)
    
    gameArea.sendMoviment(gameArea.players[newMoviment.id])
  })

})

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

function deletePlayer(id) {
  delete gameArea.players[id]
}

function movePlayer(newMoviment) {
  const currentPlayer = gameArea.players[newMoviment.id]

  currentPlayer.directionAngle = 0
  currentPlayer.speed = 0

  switch (newMoviment.type) {
    case 'ArrowUp':
      currentPlayer.speed = 10
      break;
    case 'ArrowDown':
      currentPlayer.speed = -10
      break;
    case 'ArrowRight':
      currentPlayer.directionAngle = 10
      break;
    case 'ArrowLeft':
      currentPlayer.directionAngle = -10
      break;
    default:
      break;
  }
    
  currentPlayer.angle += currentPlayer.directionAngle*Math.PI/180

  currentPlayer.x += currentPlayer.speed*Math.sin(currentPlayer.angle)
  currentPlayer.y -= currentPlayer.speed*Math.cos(currentPlayer.angle)


  gameArea.walkCollision(currentPlayer.id)
}

function sendMoviment(movedPlayer) {
  io.sockets.emit('receive-moviment', {
    id: movedPlayer.id, 
    angle: movedPlayer.angle, 
    x: movedPlayer.x, 
    y: movedPlayer.y 
  })
}

function walkCollision(playerMoveID) {
  const player = gameArea.players[playerMoveID]

  if (player.y-25 < 0)
    player.y += 10

  if (player.y+25 > gameArea.canvasHeight)
    player.y -= 10

  if (player.x-25 < 0) 
    player.x += 10

  if (player.x+25 > gameArea.canvasWidth) 
    player.x -= 10


  gameArea.sendMoviment(player)
}


server.listen(process.env.PORT || 8081, () => console.log('Server is running!'))