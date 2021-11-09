var socket = io({transports: ['websocket']});


socket.on('connect', () => {
  console.log("Conectado com o id: ", socket.id)
})

// ------------------------- GAME ------------------------- 

const Canvas = document.querySelector('canvas')
const context = Canvas.getContext('2d')

const gameConfigs = {
  myTank: new Image(),
  tankEnemy: new Image(),
  keysPressed: []
}
gameConfigs.myTank.src = "./images/i_tank.png"
gameConfigs.tankEnemy.src = "./images/enemy.png"

var currentPlayer = {
  name: 'Jogador',
  id: 'Guest',
  x: 200,
  y: 200,
  angle: 0,
  directionAngle: 0,
  speed: 0,
  velocity: 4,
  life: 100,
  shots: [],
}
var allEnemies = []

document.addEventListener('keydown', (event) => {
  gameConfigs.keysPressed[event.code] = (event.type === 'keydown')
})
document.addEventListener('keyup', (event) => {
  gameConfigs.keysPressed[event.code] = (event.type === 'keydown')
})


function keysPressed() {
  if (gameConfigs.keysPressed['ArrowUp'])
    currentPlayer.y -= currentPlayer.velocity

  if (gameConfigs.keysPressed['ArrowDown'])
    currentPlayer.y += currentPlayer.velocity

  if (gameConfigs.keysPressed['ArrowLeft'])
    currentPlayer.x -= currentPlayer.velocity

  if (gameConfigs.keysPressed['ArrowRight'])
    currentPlayer.x += currentPlayer.velocity
}

function drawAtScreen() {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height)
  context.drawImage(gameConfigs.myTank, currentPlayer.x, currentPlayer.y)

  

}

function walkCollision() {
  var playerX = currentPlayer.x
  var playerY = currentPlayer.y

  if (playerX+50 > context.canvas.width)
    currentPlayer.x -= currentPlayer.velocity
  
  if (playerX < 0)
    currentPlayer.x += currentPlayer.velocity

  if (playerY+50 > context.canvas.height)
    currentPlayer.y -= currentPlayer.velocity

  if (playerY < 0)
    currentPlayer.y += currentPlayer.velocity
}


function renderScreen() {

  drawAtScreen()
  keysPressed()
  walkCollision()


  requestAnimationFrame(renderScreen)
}

renderScreen()