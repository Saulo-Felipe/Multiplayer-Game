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

socket.on('teste', (msg) => {
  console.log(msg)
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
}


function setState(state) {
  console.log('[State] --> ', state)
  gameArea.players = {...state}
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
  const currentPlayer = gameArea.players[socket.id]

  currentPlayer.directionAngle = 0
  currentPlayer.speed = 0

  switch (key) {
    case 'ArrowUp':
      currentPlayer.speed = 10
      break;
    case 'ArrowDown':
      currentPlayer.speed = -4
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

}