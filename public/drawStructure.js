const screenElements = {
  map: new Image(),
  myTank: new Image(),
  enemyTank: new Image(),
  centerObstacle: new Image(),
  players,
  drawGunshots,
  gunshotCollision
}

screenElements.map.src = './images/map.png'
screenElements.myTank.src = './images/i_tank.png'
screenElements.enemyTank.src = './images/enemy.png'
screenElements.centerObstacle.src = './images/center_map.png'


function renderScreen() {
  ctx.drawImage(screenElements.map, 0, 0)

  screenElements.players()
  screenElements.drawGunshots()
  screenElements.gunshotCollision()

  ctx.drawImage(screenElements.centerObstacle, 591, 411)

  requestAnimationFrame(renderScreen)
}


function players() {
  for (var c in gameArea.players) {
    const player = gameArea.players[c]
    
    ctx.save()
    ctx.translate(player.x, player.y)
    ctx.rotate(player.angle)
    ctx.drawImage(player.id === socket.id ? screenElements.myTank : screenElements.enemyTank, -screenElements.myTank.width/2, -screenElements.myTank.height/2)
    ctx.restore()

  }
}

function drawGunshots() {
  for (var gunshot of gameArea.gunshots) {
    ctx.save()
    ctx.translate(gunshot.x, gunshot.y)
    ctx.rotate(gunshot.angle)
    
    ctx.beginPath()
    ctx.arc(-2, -2, 4, 0, 2 * Math.PI)
    ctx.fillStyle = "red"
    ctx.fill()
    ctx.stroke()

    ctx.restore()

    // update position
    gunshot.x += 6*Math.sin(gunshot.angle)
    gunshot.y -= 6*Math.cos(gunshot.angle)
  }
}

function gunshotCollision() {
  // walk Collision
  for (var i in gameArea.gunshots) {
    var gunshot = gameArea.gunshots[i]

    if (gunshot.x > gameArea.canvasWidth) {
      gameArea.gunshots.splice(i, 1)
      console.log("COlisão, bala removida")
    }
  }
}


renderScreen()