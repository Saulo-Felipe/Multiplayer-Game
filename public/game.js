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

socket.on('add-player', (player) => {
  gameArea.createPlayer(player)
})

socket.on('receive-moviment', (newMoviment) => {
  gameArea.receiveMoviment(newMoviment)
})

socket.on('receive-gunshot', (newShot) => {
  gameArea.addGunshot(newShot)
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
  // console.log('\n[Receive Moviment] --> ', newMoviment.id)

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

function gunshotCollision(gunshot, i) {
  // walk Collision

  if (gunshot.x < 0 || gunshot.y < 0 || gunshot.y > gameArea.canvasHeight || gunshot.x > gameArea.canvasWidth) {
    gameArea.gunshots.splice(i, 1)
    console.log('Colisão')

    console.log("Tiros atualizados: ", gameArea.gunshots)
  }
}

