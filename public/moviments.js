document.addEventListener('keydown', event => keysPressed(event))
document.addEventListener('keyup', event => keysPressed(event))


function keysPressed(event) {
  if (socket.connected && gameArea.playing) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(event.code) !== -1) {
      var keyPosition = gameArea.keys.indexOf(event.code) === -1 ? gameArea.keys.length : gameArea.keys.indexOf(event.code)

      if (event.type === 'keydown')
        gameArea.keys[keyPosition] = event.code
      else 
        gameArea.keys.splice(keyPosition, 1)

    } else if (event.code === 'Space' && event.type === 'keydown') {
      gameArea.newGunshot()
    }
  }
}

function movePlayerMobile(moviment, type) {
  if (type !== 'cancel') {
    var keyPosition = gameArea.keys.indexOf(moviment) === -1 ? gameArea.keys.length : gameArea.keys.indexOf(event.code)

    gameArea.keys[keyPosition] = moviment
    
  } else {
    for (var i in gameArea.keys)
    var mov = gameArea.keys[i]

    if (mov === moviment) {
      gameArea.keys.splice(i, 1)
    }
  }

  console.log("Chamando")
}

setInterval(() => {
  for (var key of gameArea.keys) {
    gameArea.movePlayer(key)

    mobileScreen(key)
  }
}, 20);
