var socket = io({transports: ['websocket']});


socket.on('connect', () => {
  console.log("Conectado com o id: ", socket.id)
  
  currentPlayer.id = socket.id

  socket.emit('new-player', currentPlayer, (response) => {
    allEnemies = response.allEnemies
  })
})

socket.on('add-player', (player) => {
  console.log('Novo jogador: ', player)

  allEnemies.push(player)
})

socket.on("disconnected-player", (response) => {

  for (var count in response) { // Remove id do atual player da lista de inimigos
    if (response[count].id === currentPlayer.id) {
      response.splice(count, 1)
      break
    }
  }

  allEnemies = response
})

socket.on('enemy-move', (state) => {

  for (var c in allEnemies) {
    if (allEnemies[c].id === state.id) {
      allEnemies[c] = {...allEnemies[c], ...state}
      break
    }
  }
  
})

socket.on('add-gunshot', (gunshoot) => {
  console.log("bala inimiga recebida")
  for (var c in allEnemies) {
    if (allEnemies[c].id === gunshoot.playerID) {
      console.log("Detectei")
      allEnemies[c].gunshots.push(gunshoot)
      break
    }
  }
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
  gunshots: [],
}
var allEnemies = []

document.addEventListener('keydown', (event) => {
  gameConfigs.keysPressed[event.code] = (event.type === 'keydown')

  if (event.code === 'Space') {
    var newGunshoot = {
      playerID: currentPlayer.id,
      x: currentPlayer.x,
      y: currentPlayer.y,
      angle: currentPlayer.angle
    }
    currentPlayer.gunshots.push(newGunshoot)

    socket.emit('new-gunshot', newGunshoot)
  }

})
document.addEventListener('keyup', (event) => {
  gameConfigs.keysPressed[event.code] = (event.type === 'keydown')
})


function keysPressed() {

  currentPlayer.directionAngle = 0
  currentPlayer.speed = 0

  if (gameConfigs.keysPressed['ArrowUp'])
    currentPlayer.speed = 4

  if (gameConfigs.keysPressed['ArrowDown'])
    currentPlayer.speed = -4

  if (gameConfigs.keysPressed['ArrowRight'])
    currentPlayer.directionAngle = 4

  if (gameConfigs.keysPressed['ArrowLeft'])
    currentPlayer.directionAngle = -4
  
  if (gameConfigs.keysPressed['ArrowUp'] || gameConfigs.keysPressed['ArrowDown'] || gameConfigs.keysPressed['ArrowRight'] || gameConfigs.keysPressed['ArrowLeft'])
    Observer('move')

  
  currentPlayer.angle += currentPlayer.directionAngle*Math.PI/180

  currentPlayer.x += currentPlayer.speed*Math.sin(currentPlayer.angle)
  currentPlayer.y -= currentPlayer.speed*Math.cos(currentPlayer.angle)

}

function drawAtScreen() {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height)

  // My tank
  context.save()
  context.translate(currentPlayer.x, currentPlayer.y)
  context.rotate(currentPlayer.angle)
  context.drawImage(gameConfigs.myTank, -gameConfigs.myTank.width/2, -gameConfigs.myTank.height/2)
  context.restore()

  // My gunshots
  for (var gunshot of currentPlayer.gunshots) {

    context.save()
    context.translate(gunshot.x, gunshot.y)
    context.rotate(gunshot.angle)
    context.beginPath()
    context.fillRect(-2, -5, 4, 10)
    context.stroke()
    context.restore()

    gunshot.x += 5*Math.sin(gunshot.angle)
    gunshot.y -= 5*Math.cos(gunshot.angle)
  }
  
  // Enemy tank
  for (var tank of allEnemies) {
    context.save()
    context.translate(tank.x, tank.y)
    context.rotate(tank.angle)
    context.drawImage(gameConfigs.tankEnemy, -gameConfigs.tankEnemy.width/2, -gameConfigs.myTank.height/2)
    context.restore()
  }
  
  for (var enemy of allEnemies) {
    for (var gunshot of enemy.gunshots) {

      context.save()
      context.translate(gunshot.x, gunshot.y)
      context.rotate(gunshot.angle)
      context.beginPath()
      context.fillRect(-2, -5, 4, 10)
      context.stroke()
      context.restore()
  
      gunshot.x += 5*Math.sin(gunshot.angle)
      gunshot.y -= 5*Math.cos(gunshot.angle)
    }
  }

}

function walkCollision() {

  // my tank collision
  var playerX = parseInt(currentPlayer.x-25)
  var playerY = parseInt(currentPlayer.y-25)

  if (playerX+50 > context.canvas.width)
    currentPlayer.x -= currentPlayer.velocity
  
  if (playerX < 0)
    currentPlayer.x += currentPlayer.velocity

  if (playerY+50 > context.canvas.height)
    currentPlayer.y -= currentPlayer.velocity

  if (playerY < 0)
    currentPlayer.y += currentPlayer.velocity
  
  
  // my gunshots collision
  for (var index in currentPlayer.gunshots) {
    var gunshot = currentPlayer.gunshots[index]

    if (
      (gunshot.x > context.canvas.width) ||
      (gunshot.x < 0) ||
      (gunshot.y > context.canvas.height) ||
      (gunshot.y < 0)
    ) {
      console.log("bala saiu da tela")
      currentPlayer.gunshots.splice(index, 1)
    }
  }

  // enemy gunshots collision
  for (enemy of allEnemies) {
    for (var index in enemy.gunshots) {
      var gunshot = enemy.gunshots[index]
  
      if (
        (gunshot.x > context.canvas.width) ||
        (gunshot.x < 0) ||
        (gunshot.y > context.canvas.height) ||
        (gunshot.y < 0)
      ) {
        console.log("bala inimiga saiu da tela")
        enemy.gunshots.splice(index, 1)
      }
    }
  
  }  
  
}


function Observer(type) {
  console.log("[Enviando State]")

  if (type === 'move')
    socket.emit('player-move', {
      id: currentPlayer.id,
      x: currentPlayer.x,
      y: currentPlayer.y,
      angle: currentPlayer.angle,
      directionAngle: currentPlayer.directionAngle
    })
    
}


function renderScreen() {

  drawAtScreen()
  keysPressed()
  walkCollision()


  requestAnimationFrame(renderScreen)
}

renderScreen()