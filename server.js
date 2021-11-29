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
  gunshots: {},
  collisionPositions: [
    { x: 591+(180/2)-10, y: 411+(206/2)+30, radius: 75 },

    // Truck car collision
    { x: 319+(55/2), y: 276+(55/2), radius: 27.5 },
    { x: 330+(55/2), y: 254+(55/2), radius: 27.5 },
    { x: 342+(55/2), y: 224+(55/2), radius: 27.5 },
    { x: 351+(55/2), y: 200+(55/2), radius: 27.5 },
    { x: 362+(55/2), y: 169+(55/2), radius: 27.5 },
    { x: 374+(55/2), y: 145+(55/2), radius: 27.5 },

    // barricade collision
    { x: 1141+(18/2), y: 198+(18/2), radius: 9 },
    { x: 1149+(18/2), y: 209+(18/2), radius: 9 },
    { x: 1157+(18/2), y: 215+(18/2), radius: 9 },
    { x: 1165+(18/2), y: 224+(18/2), radius: 9 },
    { x: 1175+(18/2), y: 233+(18/2), radius: 9 },
    { x: 1184+(18/2), y: 242+(18/2), radius: 9 },
    { x: 1193+(18/2), y: 251+(18/2), radius: 9 },
    { x: 1202+(18/2), y: 258+(18/2), radius: 9 },
    { x: 1211+(18/2), y: 267+(18/2), radius: 9 },

    { x: 1054+11, y: 613+11, radius: 11 },
    { x: 1054+11, y: 713+11, radius: 11 },
    { x: 1053+14.5, y: 491+14.5, radius: 14.5 },
  ],
  pushCollisionPos,
  createPlayer,
  deletePlayer,
  movePlayer,
  sendMoviment,
  obstaclesCollision,
  newGunshot,
  sendGunshot,
  updateGunshot,
  collisionGunshot,
  updatePlayername,
  sendLostLife,
  deadPlayer,
}

io.on('connection', (socket) => {
  console.log('[New player] --> ', socket.id)

  gameArea.createPlayer(socket.id)

  socket.emit('initial-state', gameArea.players, (state) => {
    gameArea.updatePlayername(socket, state)
  })

  socket.broadcast.emit('add-player', gameArea.players[socket.id])


  socket.on('disconnect', () => {
    console.log('[Disconnect] --> ', socket.id)

    gameArea.deletePlayer(socket.id)
    
    socket.broadcast.emit('delete-player', socket.id)

    socket.disconnect()
  })

  socket.on('move-player', (newMoviment) => {
    gameArea.movePlayer(newMoviment)    
  })

  socket.on('new-gunshot', (playerID) => {
    var newShot = gameArea.newGunshot(playerID)

    gameArea.sendGunshot(newShot)
  })

});

setInterval(() => {
  gameArea.updateGunshot()
}, 20);


gameArea.pushCollisionPos()

function pushCollisionPos() {
  var rectanglesCollision = [
    {x: 69, y: 265, radius: 12.5, end: 213, horizontal: true},
    {x: 95, y: 521, radius: 15, end: 265, horizontal: true},
    {x: 297, y: 630, radius: 15, end: 731, vertical: true},
    {x: 560, y: 215, radius: 11.5, end: 790, horizontal: true},
    {x: 1154, y: 0, radius: 11.5, end: 117, vertical: true},
    {x: 1312, y: 288, radius: 11.5, end: 1423, horizontal: true},
    {x: 1180, y: 525, radius: 16.5, end: 606, vertical: true},
    {x: 1361, y: 525, radius: 16.5, end: 606, vertical: true},
    {x: 1356, y: 705, radius: 19, end: 800, vertical: true},  
    {x: 719, y: 515, radius: 25, end: 580, vertical: true},  
  ]
  for (var rect of rectanglesCollision) {
    var initialPos = rect.horizontal ? rect.x : rect.y
  
    for (var c=initialPos; c < rect.end; c+=rect.radius) {
      gameArea.collisionPositions.push({
        x: rect.horizontal ? c : rect.x+rect.radius,
        y: rect.vertical ? c : rect.y+rect.radius,
        radius: rect.radius
      })
    }
  }
}

function createPlayer(id) {
  gameArea.players[id] = {
    id: id,
    name: 'Jogador',
    x: Math.floor(120),//Math.random() * 500 + 1),
    y: Math.floor(130),//Math.random() * 500 + 1),
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


  // Circle Collisions
  var tank = { x: newPlayerX, y: newPlayerY, radius: 25 }

  for (var obstacle of gameArea.collisionPositions) {
    let dx = obstacle.x - tank.x
    let dy = obstacle.y - tank.y

    let distance = Math.sqrt(dx*dx + dy*dy)
    let sumRadios = tank.radius + obstacle.radius

    if (distance < sumRadios) {
      let removeSpace = distance-sumRadios 

      if (tank.x < obstacle.x)
        newPlayerX += removeSpace/2
      
      if (tank.x > obstacle.x)
        newPlayerX -= removeSpace/2
        
      if (tank.y < obstacle.y)
        newPlayerY += removeSpace/2
      
      if (tank.y > obstacle.y)
        newPlayerY -= removeSpace/2
    }
  }

  // Rectangles collisions
  let tankLeft = newPlayerX - 25
  let tankRight = newPlayerX + 25
  let tankUp = newPlayerY - 25
  let tankBottom = newPlayerY + 25
  
  const rectsPositions = [
    {Left: 1059, Top: 496, Bottom: 620, Right: 1072},
    {Left: 1059, Top: 723, Bottom: 800, Right: 1072},
    {Left: 1072, Top: 496, Bottom: 509, Right: 1500},
  ]

  for (var obstacle of rectsPositions) {
    const xCondition = tankLeft < obstacle.Right && tankRight > obstacle.Left
    const yCondition = tankBottom > obstacle.Top && tankUp < obstacle.Bottom

    if (tankBottom > obstacle.Top && tankBottom < obstacle.Top+5 && xCondition)
      haveCollision.y = true

    else if (tankUp < obstacle.Bottom && tankUp > obstacle.Bottom-5 && xCondition)
      haveCollision.y = true

    else if (tankRight > obstacle.Left && tankRight < obstacle.Left+5 && yCondition)
      haveCollision.x = true

    else if (tankLeft < obstacle.Right && tankLeft > obstacle.Right-5 && yCondition)
      haveCollision.x = true
  }

  // Tanks collision
  for (var currentIndex in gameArea.players) {
    const tankPlayer = gameArea.players[currentIndex]

    if (tankPlayer.id !== playerMoveID) {
      let dx = tankPlayer.x - tank.x
      let dy = tankPlayer.y - tank.y
  
      let distance = Math.sqrt(dx*dx + dy*dy)
      let sumRadios = tank.radius + 25


      if (distance < sumRadios) {
        let removeSpace = distance-sumRadios 
  
        if (tank.x < tankPlayer.x)
          newPlayerX += removeSpace/2
        
        if (tank.x > tankPlayer.x)
          newPlayerX -= removeSpace/2
          
        if (tank.y < tankPlayer.y)
          newPlayerY += removeSpace/2
        
        if (tank.y > tankPlayer.y)
          newPlayerY -= removeSpace/2
      }

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
  const playerShot = gameArea.players[playerID]
  
  return gameArea.gunshots[uuid()] = {
    id: playerID,
    x: playerShot.x,
    y: playerShot.y,
    angle: playerShot.angle,
  }
}

function sendGunshot(gunshot) {
  io.sockets.emit('receive-gunshot', gunshot)
}

function updateGunshot() {
  for (var i in gameArea.gunshots) {
    var gunshot = gameArea.gunshots[i]

    gunshot.x += 6*Math.sin(gunshot.angle)
    gunshot.y -= 6*Math.cos(gunshot.angle)

    gameArea.collisionGunshot(gunshot, i)
  }
}

function collisionGunshot(gunshot, indice) {

  // Walk Collision
  if (gunshot.x < 0 || gunshot.y < 0 || gunshot.y > gameArea.canvasHeight || gunshot.x > gameArea.canvasWidth) {
    delete gameArea.gunshots[indice]
  }

  //player gunshot collision
  for (var i in gameArea.players) {
    const player = gameArea.players[i]

    if (player.id !== gunshot.id) {
      var tank = { x: player.x, y: player.y, radius: 25 }

      let dx = gunshot.x - tank.x
      let dy = gunshot.y - tank.y
  
      let distance = Math.sqrt(dx*dx + dy*dy)
      let sumRadios = tank.radius + 4
  
      if (distance < sumRadios) {
        delete gameArea.gunshots[indice]

        lostLife({ shooter: gunshot.id, victim: player.id })
      }

    }
  }

  // Obstacle collision
  for (var obstacle of gameArea.collisionPositions) {
    var dx = gunshot.x - obstacle.x
    var dy = gunshot.y - obstacle.y

    var distance = Math.sqrt(dx*dx + dy*dy)
    var sumRadios = obstacle.radius + 4

    if (distance < sumRadios) {
      delete gameArea.gunshots[indice]
    }
  }

}

function updatePlayername(socket, state) {
  gameArea.players[state.playerID].name = state.name
  socket.broadcast.emit('player-name', state)
} 

function lostLife(state) {
  const { shooter, victim } = state

  gameArea.players[victim].life -= 10

  gameArea.sendLostLife(victim)

  // Verificar perca do player
  if (gameArea.players[victim].life === 0) {
    gameArea.deadPlayer(victim, shooter)

    gameArea.players[shooter].kills += 1
  }
}

function sendLostLife(id) {
  io.sockets.emit('receive-lost-life', id)
}

function deadPlayer(victimID, shooterID) {
  gameArea.deletePlayer(victimID)
  
  io.sockets.emit('dead-player', {victimID, shooterID})
}

server.listen(process.env.PORT || 8081, () => console.log('Server is running!'))