const screenElements = {
  map: new Image(),
  myTank: new Image(),
  enemyTank: new Image(),
  players,
  gunshots,
  updateGunshots,
}

screenElements.map.src = './images/map.png'
screenElements.myTank.src = './images/i_tank.png'
screenElements.enemyTank.src = './images/enemy.png'



function renderScreen() {
  ctx.drawImage(screenElements.map, 0, 0)

  screenElements.players()
  screenElements.gunshots()

  
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

function gunshots() {
  for (var i in gameArea.players) {
    const player = gameArea.players[i]

    for (var c in player.gunshots) {
      var gunshot = player.gunshots[c]

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
      gunshot.x += 4*Math.sin(gunshot.angle)
      gunshot.y -= 4*Math.cos(gunshot.angle)
    }
  }
}

function updateGunshots() {
  for (var i in gameArea.players) {
    const player = gameArea.players[i]

    for (var c in player.gunshots) {
      var gunshot = player.gunshots[c]

      ctx.beginPath()
      ctx.arc(gunshot.x, gunshot.y, 4, 0, 2 * Math.PI)
      ctx.stroke()
    }
  }
}



renderScreen()