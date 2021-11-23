const socket = io({transports: ['websocket'], autoConnect: false})

socket.on('connect', () => {
  console.log('Conectado com o id -> ', socket.id)
})

socket.on('disconnect', () => {
  gameArea.disconnected()
})

socket.on('delete-player', (playerID) => {
  gameArea.deletePlayer(playerID)
})

socket.on('initial-state', (state, callback) => {
  gameArea.setState(state)

  // send playername to backend
  gameArea.players[socket.id].name = localStorage.getItem('player_name')

  callback({
    playerID: gameArea.players[socket.id].id, 
    name: gameArea.players[socket.id].name 
  })
})

socket.on('player-name', (state) => {
  gameArea.players[state.playerID].name = state.name
})

socket.on('add-player', (player) => {
  gameArea.createPlayer(player)
})

socket.on('receive-moviment', (newMoviment) => {
  gameArea.receiveMoviment(newMoviment)
})

socket.on('receive-gunshot', (newShot) => {
  gameArea.addGunshot(newShot)
})

socket.on('receive-lost-life', (id) => {
  gameArea.players[id].life -= 10
})

// -------------------- GAME ----------------------


const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const gameArea = {
  canvasWidth: 1500,
  canvasHeight: 800,
  players: {},
  gunshots: [],
  keys: [],
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
  setState,
  disconnected,
  movePlayer,
  receiveMoviment,
  newGunshot,
  addGunshot,
  gunshotCollision,
  updateGunshots,
}


function setState(state) {
  console.log('[State] --> ', state)

  Object.assign(gameArea.players, state)
}

function createPlayer(newPlayer) {
  console.log('[New Player] --> ', newPlayer.id)

  gameArea.players[newPlayer.id] = {...newPlayer}
}

function deletePlayer(id) {
  console.log('[Delete player] --> ', id)

  delete gameArea.players[id]
}

function disconnected() {
  console.log('[disconnected]')

  document.querySelector('.blur-screen').style.display = 'block'
  document.querySelector('.dead-container').style.left = '50%'

  socket.disconnect()
}

function movePlayer(key) {
  // console.log('[Send Moviment] --> ', socket.id)

  socket.emit('move-player', {id: socket.id, type: key})
}

function receiveMoviment(newMoviment) {
  // console.log('\n[Receive Moviment] --> ', newMoviment)

  Object.assign(gameArea.players[newMoviment.id], newMoviment)  
}

function newGunshot() {
  console.log('[Send Gunshot]')

  socket.emit('new-gunshot', socket.id)
}

function addGunshot(newShot) {
  gameArea.gunshots.push(newShot)
}

function updateGunshots() {

  for (var i in gameArea.gunshots) {
    var gunshot = gameArea.gunshots[i]

    gunshot.x += 6*Math.sin(gunshot.angle)
    gunshot.y -= 6*Math.cos(gunshot.angle)

    gunshotCollision(gunshot, i)
  }
}

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
gameArea.pushCollisionPos()

function gunshotCollision(gunshot, i) {

  // walk Collision
  if (gunshot.x < 0 || gunshot.y < 0 || gunshot.y > gameArea.canvasHeight || gunshot.x > gameArea.canvasWidth) {
    gameArea.gunshots.splice(i, 1)
    console.log('Colisão')
    console.log("Tiros atualizados: ", gameArea.gunshots)
  }

  // Tanks gunshot collisions
  for (var i in gameArea.players) {
    const player = gameArea.players[i]
    if (player.id !== gunshot.id) {
      var tank = { x: player.x, y: player.y, radius: 25 }

      let dx = gunshot.x - tank.x
      let dy = gunshot.y - tank.y
  
      let distance = Math.sqrt(dx*dx + dy*dy)
      let sumRadios = tank.radius + 4
  
      if (distance < sumRadios) {
        gameArea.gunshots.splice(i, 1)
      }
        
    }
  }

  // Obstacle gunshot collision
  for (var obstacle of gameArea.collisionPositions) {

    for (var i in gameArea.gunshots) {
      var gunshot = gameArea.gunshots[i]

      var dx = gunshot.x - obstacle.x
      var dy = gunshot.y - obstacle.y

      var distance = Math.sqrt(dx*dx + dy*dy)
      var sumRadios = obstacle.radius + 4

      if (distance < sumRadios) {
        gameArea.gunshots.splice(i, 1)
        console.log("Colisão, novo: ", gameArea.gunshots)
      }
    
    }
  }


}
