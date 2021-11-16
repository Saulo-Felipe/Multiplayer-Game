const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const path = require('path')
const { v4: uuid } = require('uuid');

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
  obstaclesCollision,
  newGunshot,
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

  socket.on('new-gunshot', (playerID) => {
    gameArea.newGunshot(playerID)
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
    gunshots: {},
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
      currentPlayer.speed = 5
      break;
    case 'ArrowDown':
      currentPlayer.speed = -5
      break;
    case 'ArrowRight':
      currentPlayer.directionAngle = 5
      break;
    case 'ArrowLeft':
      currentPlayer.directionAngle = -5
      break;
    default:
      break;
  }

  gameArea.obstaclesCollision(currentPlayer.id)
}

function sendMoviment(movedPlayer) {
  io.sockets.emit('receive-moviment', {
    id: movedPlayer.id, 
    angle: movedPlayer.angle, 
    x: movedPlayer.x, 
    y: movedPlayer.y
  })
}

function obstaclesCollision(playerMoveID) {
  const player = gameArea.players[playerMoveID]
  
  player.angle += player.directionAngle*Math.PI/180

  let newPlayerX = player.x + player.speed*Math.sin(player.angle)
  let newPlayerY = player.y - player.speed*Math.cos(player.angle)

  let haveCollision = {
    x: false,
    y: false
  }

  // Walk Collision
  if (newPlayerX-25 < 0 || newPlayerX+25 > gameArea.canvasWidth)
    haveCollision.x = true

  if (newPlayerY-25 < 0 || newPlayerY+25 > gameArea.canvasHeight)
    haveCollision.y = true
  

  // Rectangles collisions
  let tankLeft = newPlayerX - 25
  let tankRight = newPlayerX + 25
  let tankUp = newPlayerY - 25
  let tankBottom = newPlayerY + 25

  const rectsPositions = [
    {Left: 92, Top: 526, Bottom: 549, Right: 270},
  ]

  for (var obstacle of rectsPositions) {
    const xCondition = tankLeft < obstacle.Right && tankRight > obstacle.Left
    const yCondition = tankBottom > obstacle.Top && tankUp < obstacle.Bottom

    if (tankBottom > obstacle.Top && tankBottom < obstacle.Top+10 && xCondition) {
      haveCollision.y = true
    }

    if (tankUp < obstacle.Bottom && tankUp > obstacle.Bottom-10 && xCondition) {
      haveCollision.y = true
    }

    if (tankRight > obstacle.Left && tankRight < obstacle.Left+10 && yCondition) {
      haveCollision.x = true
    }

    if (tankLeft < obstacle.Right && tankLeft > obstacle.Right-10 && yCondition) {
      haveCollision.x = true
    }
  }


  // Circle collisions

  const circleObstacles = [
    { x: 591+(180/2)-10, y: 411+(206/2)+30, radius: 75 },
  ]

  var tank = { x: newPlayerX, y: newPlayerY, radius: 25 }

  for (var obstacle of circleObstacles) {
    let dx = obstacle.x - tank.x
    let dy = obstacle.y - tank.y

    let distance = Math.sqrt(dx*dx + dy*dy)
    let sumRadios = tank.radius + obstacle.radius
    
    if (distance < sumRadios) { // My tank collision

      if (tank.x < dx)
        haveCollision.x = true

      else if (tank.x > dx)    
        haveCollision.x = true
  
      if (tank.y < obstacle.y)
        haveCollision.y = true
  
      else if (tank.y > obstacle.y)
        haveCollision.y = true
    }

  }



  if (haveCollision.x === false)
    player.x = newPlayerX

  if (haveCollision.y === false)
    player.y = newPlayerY


  if (haveCollision.x === false || haveCollision.y === false)
    gameArea.sendMoviment(player)

}


function newGunshot(playerID) {
  // gameArea.players[playerID].gunshots[uuid()] = {
  //   userID: playerID,
  // }

  console.log("Tiro adicionado: ", gameArea.players[playerID])
}


server.listen(process.env.PORT || 8081, () => console.log('Server is running!'))