const screenElements = {
  map: new Image(),
  myTank: new Image(),
  enemyTank: new Image(),
  centerObstacle: new Image(),
  drawPlayers,
  drawGunshots,
  drawPlayername,
}

screenElements.map.src = './images/map.png'
screenElements.myTank.src = './images/i_tank.png'
screenElements.enemyTank.src = './images/enemy.png'
screenElements.centerObstacle.src = './images/center_map.png'


function renderScreen() {
  ctx.drawImage(screenElements.map, 0, 0)

  screenElements.drawPlayers()
  screenElements.drawGunshots()
  screenElements.drawPlayername()
  gameArea.updateGunshots()

  ctx.drawImage(screenElements.centerObstacle, 591, 411)

  requestAnimationFrame(renderScreen)
}

function drawPlayers() {
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
  }
}

function drawPlayername() {
  for (var i in gameArea.players) {
    const player = gameArea.players[i]

    ctx.font = "15px monospace"

    let txtPlayername = player.name.length > 10 ? player.name.slice(0, 10) + '...' : player.name
    let nameWidth = ctx.measureText(txtPlayername).width


    ctx.fillText(txtPlayername, player.x-nameWidth/2, player.y+35)
  }
}



renderScreen()