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

  // Input progress life
  var container = document.querySelector('#heart-progress-bar')

  container.innerHTML = `
    <progress id="${currentPlayer.id}" style="left: ${currentPlayer.x-25}px; top: ${currentPlayer.y-25}px" value="100" max="100"></progress>
  `
  
}


const Canvas = document.querySelector('canvas')
const context = Canvas.getContext('2d')

const gameConfigs = {
  myTank: new Image(),
  tankEnemy: new Image(),
  keysPressed: [],

  gameMap: new Image(),
  centerMap: new Image(),

}

gameConfigs.myTank.src = "./images/i_tank.png"
gameConfigs.tankEnemy.src = "./images/enemy.png"

gameConfigs.gameMap.src = './images/map.png'
gameConfigs.centerMap.src = './images/center_map.png'


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
  
  if (gameConfigs.keysPressed['ArrowUp'] || gameConfigs.keysPressed['ArrowDown'] || gameConfigs.keysPressed['ArrowRight'] || gameConfigs.keysPressed['ArrowLeft']) {
    Observer()
    var heart = document.querySelector(`#${currentPlayer.id}`)

    heart.style.left = `${currentPlayer.x-20}px`
    heart.style.top = `${currentPlayer.y-40}px`
  }

  
  currentPlayer.angle += currentPlayer.directionAngle*Math.PI/180

  currentPlayer.x += currentPlayer.speed*Math.sin(currentPlayer.angle)
  currentPlayer.y -= currentPlayer.speed*Math.cos(currentPlayer.angle)

}


function drawAtScreen() {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height)

  context.drawImage(gameConfigs.gameMap, 0, 0)

  if (currentPlayer.play === true) {
    // My tank
    context.save()
    context.translate(currentPlayer.x, currentPlayer.y)
    context.rotate(currentPlayer.angle)
    context.drawImage(gameConfigs.myTank, -gameConfigs.myTank.width/2, -gameConfigs.myTank.height/2)
    context.restore()  

    // my life
    // context.save()
    // context.translate(currentPlayer.x, currentPlayer.y)
    // context.font = "10px Arial";
    // var txtLife = '❤ ' + currentPlayer.life
    // context.fillText(txtLife, -gameConfigs.myTank.width/2, -gameConfigs.myTank.height/2);
    // context.restore()
    document.querySelector(`#${currentPlayer.id}`)//.setAttribute('value', currentPlayer.life)


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

    // My name 
    context.save()
    context.translate(currentPlayer.x, currentPlayer.y)
    const txtName = currentPlayer.name
    const txtNameWidth = context.measureText(txtName).width
    context.font = "12px Arial";
    context.fillText(txtName, -gameConfigs.myTank.width/2+25-(txtNameWidth/2), -gameConfigs.myTank.height/2+60)
    context.restore()


    // for (let c = 0; c < 5; c++) {
    //   if (c === 0) 
    //     roundedRect(context, { x: 0, y: 40, width: 30, height: 20, radius: 50, color: 'red' })
    //   // else 
    //   //   context.rect(30*c, 40, 30, 20)
    // }
    
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

  context.drawImage(gameConfigs.centerMap, 591, 411)

}

function ObstaclesMap() {

  (() => { // Circular collision
    var tank = { x: currentPlayer.x, y: currentPlayer.y, radius: 25 }
    var allObstacles = [

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

    ]

    for (var obstacle of allObstacles) {

      let dx = obstacle.x - tank.x
      let dy = obstacle.y - tank.y
    
      let distance = Math.sqrt(dx*dx + dy*dy)
      let sumRadios = tank.radius + obstacle.radius
    
      if (distance < sumRadios) { // My tank collision
        if (tank.x < obstacle.x)
          currentPlayer.x -= currentPlayer.velocity
  
        else if (tank.x > obstacle.x)    
          currentPlayer.x += currentPlayer.velocity
    
        if (tank.y < obstacle.y)
          currentPlayer.y -= currentPlayer.velocity
    
        else if (tank.y > obstacle.y)
          currentPlayer.y += currentPlayer.velocity 
      }

      // My gunshots collision
      for (var count in currentPlayer.gunshots) {
        var gunshot = currentPlayer.gunshots[count]

        let dx = obstacle.x - gunshot.x
        let dy = obstacle.y - gunshot.y

        let distance = Math.sqrt(dx*dx + dy*dy)
        let sumRadios = 5 + obstacle.radius

        if (distance < sumRadios) 
          currentPlayer.gunshots.splice(count, 1)
      }

      // Enemy gunshots collision
      for (var c in allEnemies) {
        var enemy = allEnemies[c]

        for (var count in enemy.gunshots) {
          var gunshot = enemy.gunshots[count]

          let dx = obstacle.x - gunshot.x
          let dy = obstacle.y - gunshot.y
  
          let distance = Math.sqrt(dx*dx + dy*dy)
          let sumRadios = 5 + obstacle.radius
  
          if (distance < sumRadios)
            allEnemies[c].gunshots.splice(count, 1)
        }
      }

      // Ver forma ao redor dos obstaculos
      // context.beginPath()
      // context.arc(obstacle.x, obstacle.y, obstacle.radius, 0, 2*Math.PI)
      // context.stroke()      
    }

  })();

  (() => { // Rectangles collisions
    const tankUp = currentPlayer.y - gameConfigs.myTank.height/2
    const tankBottom = currentPlayer.y + gameConfigs.myTank.height/2
    const tankLeft = currentPlayer.x - gameConfigs.myTank.width/2
    const tankRight = currentPlayer.x + gameConfigs.myTank.width/2

    var allObstacles = [
      {Top: 622, Bottom: 726, Left: 295, Right: 325},
      {Top: 520, Bottom: 545, Left: 100, Right: 280},
      {Top: 267, Bottom: 287, Left: 72, Right: 217},
      {Top: 215, Bottom: 238, Left: 552, Right: 791},
      {Top: 0, Bottom: 117, Left: 1154, Right: 1175},
      {Top: 288, Bottom: 307, Left: 1306, Right: 1424},

      // Cars
      {Top: 514, Bottom: 611, Left: 1177, Right: 1217},
      {Top: 514, Bottom: 611, Left: 1357, Right: 1398},
      {Top: 693, Bottom: 796, Left: 1352, Right: 1398},
      {Top: 491, Bottom: 587, Left: 710, Right: 761},

      // fence 
      {Top: 509, Bottom: 683, Left: 1058, Right: 1072},
      {Top: 745, Bottom: 800, Left: 1058, Right: 1071},
      {Top: 496, Bottom: 509, Left: 1058, Right: 1500},

    ]

    for (let obstacle of allObstacles) {

      // Tank Collision
      if ((tankBottom > obstacle.Top && tankBottom < obstacle.Top+5) && (tankRight > obstacle.Left && tankLeft < obstacle.Right))
        currentPlayer.y -= currentPlayer.velocity

      if ((tankUp < obstacle.Bottom && tankUp > obstacle.Bottom-5) && (tankRight > obstacle.Left && tankLeft < obstacle.Right))
        currentPlayer.y += currentPlayer.velocity

      if ((tankRight > obstacle.Left && tankRight < obstacle.Left+5) && (tankBottom > obstacle.Top && tankUp <  obstacle.Bottom))
        currentPlayer.x -= currentPlayer.velocity

      if ((tankLeft < obstacle.Right && tankLeft > obstacle.Right-5) && (tankBottom > obstacle.Top && tankUp <  obstacle.Bottom))
        currentPlayer.x += currentPlayer.velocity


      // My gunshots collision
      for (var c in currentPlayer.gunshots) {
        var gunshot = currentPlayer.gunshots[c]

        if ((gunshot.y > obstacle.Top && gunshot.y < obstacle.Top+5) && (gunshot.x < obstacle.Right && gunshot.x > obstacle.Left))
          currentPlayer.gunshots.splice(c, 1)
        
        if ((gunshot.y < obstacle.Bottom && gunshot.y > obstacle.Bottom-5) && (gunshot.x < obstacle.Right && gunshot.x > obstacle.Left))
          currentPlayer.gunshots.splice(c, 1)

        if ((gunshot.x > obstacle.Left && gunshot.x < obstacle.Left+5) && (gunshot.y > obstacle.Top && gunshot.y < obstacle.Bottom))
          currentPlayer.gunshots.splice(c, 1)
        
        if ((gunshot.x < obstacle.Right && gunshot.x > obstacle.Right-5) && (gunshot.y > obstacle.Top && gunshot.y < obstacle.Bottom))
          currentPlayer.gunshots.splice(c, 1)
      }


      // enemy gunshots collision
      for (var c in allEnemies) {
        var enemy = allEnemies[c]

        for (var count in enemy.gunshots) {
          var gunshot = enemy.gunshots[count]

          if ((gunshot.y > obstacle.Top && gunshot.y < obstacle.Top+5) && (gunshot.x < obstacle.Right && gunshot.x > obstacle.Left))
            enemy.gunshots.splice(count, 1)
          
          if ((gunshot.y < obstacle.Bottom && gunshot.y > obstacle.Bottom-5) && (gunshot.x < obstacle.Right && gunshot.x > obstacle.Left))
            enemy.gunshots.splice(count, 1)

          if ((gunshot.x > obstacle.Left && gunshot.x < obstacle.Left+5) && (gunshot.y > obstacle.Top && gunshot.y < obstacle.Bottom))
            enemy.gunshots.splice(count, 1)
          
          if ((gunshot.x < obstacle.Right && gunshot.x > obstacle.Right-5) && (gunshot.y > obstacle.Top && gunshot.y < obstacle.Bottom))
            enemy.gunshots.splice(count, 1)          
        }
      }


      // Ver forma ao redor dos obstaculos
      // context.beginPath()
      // context.rect(obstacle.Left, obstacle.Top, obstacle.Right-obstacle.Left, obstacle.Bottom-obstacle.Top)
      // context.rect(currentPlayer.x-25, currentPlayer.y-25, 50, 50)
      // context.stroke()

    }  

  })();

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
  ObstaclesMap()



  requestAnimationFrame(renderScreen)
}

renderScreen()