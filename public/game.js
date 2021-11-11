var socket = io({transports: ['websocket']});


socket.on('connect', () => {
  console.log("Conectado com o id: ", socket.id)
  
  currentPlayer.id = socket.id
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

socket.on('add-gunshot', (gunshot) => {
  if (currentPlayer.play === true) 
    for (var c in allEnemies) {
      if (allEnemies[c].id === gunshot.playerID) {

        allEnemies[c].gunshots.push(gunshot)
        break
      }
    }
})

socket.on('add-gunshot-collision', (enemy) => {
  if (enemy.id === currentPlayer.id) {
    console.log("EU mesmo, atualizando: ", enemy)
    currentPlayer.life = enemy.life
  } else {
    for (var p in allEnemies) {
      if (allEnemies[p].id === enemy.id) {
        allEnemies[p].life = enemy.life
        break
      }
    }
  }

  for (var c in allEnemies) {
    if (allEnemies[c] === enemy.id) {
      allEnemies[c].life = enemy.life
    }
    console.log('Teste: ', enemy)
    if (allEnemies[c].id === enemy.removeID) {
      console.log("ENtrreii")
      allEnemies[c].gunshots.splice(Number(enemy.gunshotIndex), 1)
    }
  }

})

// ------------------------- GAME ------------------------- 

function play() {
  var inputName = document.querySelector('input')

  if (inputName.value.length !== 0) {
    socket.emit('new-player', currentPlayer, (response) => {
      allEnemies = response.allEnemies
    })
    
    currentPlayer.play = true
    currentPlayer.name = inputName.value
    localStorage.setItem('player_name', inputName.value)

    document.querySelector('.blur-screen').style.display = 'none'
    document.querySelector('.initial-container').style.display = 'none'

  } else {   
    var erroContainer = document.querySelector('.error-msg')
    erroContainer.innerHTML = `Por favor, digite um nome de Jogador.`

    setTimeout(() => {
      erroContainer.innerHTML = ""
    }, 3000)
  }
  
}


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
  play: false,
}
var allEnemies = []

document.addEventListener('keydown', (event) => {
  if (currentPlayer.play === true) {
    gameConfigs.keysPressed[event.code] = (event.type === 'keydown')

    if (event.code === 'Space') {
      var newGunshot = {
        playerID: currentPlayer.id,
        x: currentPlayer.x,
        y: currentPlayer.y,
        angle: currentPlayer.angle
      }
      currentPlayer.gunshots.push(newGunshot)
  
      socket.emit('new-gunshot', newGunshot)
    }
  }
})
document.addEventListener('keyup', (event) => {
  if (currentPlayer.play === true) 
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
    Observer()

  
  currentPlayer.angle += currentPlayer.directionAngle*Math.PI/180

  currentPlayer.x += currentPlayer.speed*Math.sin(currentPlayer.angle)
  currentPlayer.y -= currentPlayer.speed*Math.cos(currentPlayer.angle)

}

function drawAtScreen() {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height)

  if (currentPlayer.play === true) {
    // My tank
    context.save()
    context.translate(currentPlayer.x, currentPlayer.y)
    context.rotate(currentPlayer.angle)
    context.drawImage(gameConfigs.myTank, -gameConfigs.myTank.width/2, -gameConfigs.myTank.height/2)
    context.restore()  

    // my life
    context.save()
    context.translate(currentPlayer.x, currentPlayer.y)
    context.font = "10px Arial";
    var txtLife = '❤ ' + currentPlayer.life
    context.fillText(txtLife, -gameConfigs.myTank.width/2, -gameConfigs.myTank.height/2);
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

    context.save()
    context.translate(currentPlayer.x, currentPlayer.y)
    const txtName = currentPlayer.name
    const txtNameWidth = context.measureText(txtName).width

    context.font = "12px Arial";
    context.fillText(txtName, -gameConfigs.myTank.width/2+25-(txtNameWidth/2), -gameConfigs.myTank.height/2+60)
    context.restore()

  }
  
  // Enemy tank
  for (var tank of allEnemies) {
    context.save()
    context.translate(tank.x, tank.y)
    context.rotate(tank.angle)
    context.drawImage(gameConfigs.tankEnemy, -gameConfigs.tankEnemy.width/2, -gameConfigs.myTank.height/2)
    context.restore()
  }
  
  // Enemy gunshots
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

  // Enemy lifes
  for (var enemy of allEnemies) {
    context.save()
    context.translate(enemy.x, enemy.y)
    context.font = "10px Arial";
    var txtLife = '❤ ' + enemy.life
    context.fillText(txtLife, -gameConfigs.tankEnemy.width/2, -gameConfigs.tankEnemy.height/2);
    context.restore()
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

      Observer()
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

function Observer() {
  console.log("[Enviando State]")

  socket.emit('player-move', {
    id: currentPlayer.id,
    x: currentPlayer.x,
    y: currentPlayer.y,
    angle: currentPlayer.angle,
    directionAngle: currentPlayer.directionAngle,
    gunshots: currentPlayer.gunshots
  })
    
}

function tanksCollisions() {
  for (var enemy of allEnemies) {
    var enemyX = enemy.x-19
    var enemyY = enemy.y-19

    var playerX = currentPlayer.x-19
    var playerY = currentPlayer.y-19

    if ((playerX > enemyX-42) && (playerY < enemyY+37) && (playerY > enemyY-37) && (playerX < enemyX)) { // Esquerda
      currentPlayer.x -= 4
    }

    if ((playerX-42 < enemyX) && (playerY < enemyY+37) && (playerY > enemyY-37) && (playerX > enemyX)) { // Direita
      currentPlayer.x += 4
    }

    if ((playerY > enemyY-42) && (playerX > enemyX-37) && (playerX < enemyX+37) && (playerY < enemyY)) { // Cima
      currentPlayer.y -= 4
    }

    if ((playerY < enemyY+42) && (playerX > enemyX-37) && (playerX < enemyX+37) && (playerY > enemyY)) { // Baixo
      currentPlayer.y += 4
    }
  }
}

function gunshotCollision() {
  for (var enemy of allEnemies) {

    // my gunshots collision
    for (var c in currentPlayer.gunshots) {
      var enemyX = enemy.x
      var enemyY = enemy.y

      var gunshotX = currentPlayer.gunshots[c].x
      var gunshotY = currentPlayer.gunshots[c].y

      if ((gunshotX > enemyX-20) && (gunshotX < enemyX+20) && (gunshotY > enemyY-20) && (gunshotY < enemyY+25)) {
        console.log('Colisão')

        socket.emit('gunshot-collision', {
          playerGunshot: currentPlayer.id,
          enemy: enemy.id,
          gunshotPosition: c
        })

        currentPlayer.gunshots.splice(c, 1)
      } 
    }

  }

}

function renderScreen() {

  drawAtScreen()
  keysPressed()
  walkCollision()
  tanksCollisions()
  gunshotCollision()


  requestAnimationFrame(renderScreen)
}

renderScreen()