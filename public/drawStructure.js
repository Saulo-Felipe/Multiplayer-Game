const Images = {
  map: new Image(),
  myTank: new Image(),
  enemyTank: new Image(),
}

Images.map.src = './images/map.png'
Images.myTank.src = './images/i_tank.png'
Images.enemyTank.src = './images/enemy.png'

function players() {
  for (var c in gameArea.players) {
    const player = gameArea.players[c]
    
    ctx.save()
    ctx.translate(player.x, player.y)
    ctx.rotate(player.angle)
    ctx.drawImage(player.id === socket.id ? Images.myTank : Images.enemyTank, -Images.myTank.width/2, -Images.myTank.height/2)
    ctx.restore()

  }
}


function renderScreen() {
  ctx.drawImage(Images.map, 0, 0)

  players()


  
  requestAnimationFrame(renderScreen)
}

renderScreen()