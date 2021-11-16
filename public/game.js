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

socket.on('initial-state', (state) => {
  gameArea.setState(state)
})

socket.on('add-player', (player) => {
  gameArea.createPlayer(player)
})

socket.on('receive-moviment', (newMoviment) => {
  gameArea.receiveMoviment(newMoviment)
})


// -------------------- GAME ----------------------


const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const gameArea = {
  canvasWidth: 1500,
  canvasHeight: 800,
  players: {},
  keys: [],
  createPlayer,
  deletePlayer,
  setState,
  disconnected,
  movePlayer,
  receiveMoviment,
  newGunshot,
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
  console.log('[Gunshot]')

  var player = gameArea.players[socket.id]

  gameArea.players[socket.id].gunshots[Math.floor(Date.now() * Math.random()).toString(36)] = {
    id: socket.id,
    x: player.x,
    y: player.y,
    angle: player.angle,
  }

  // socket.emit('new-gunshot', socket.id)
}