document.addEventListener('keydown', event => keysPressed(event))
document.addEventListener('keyup', event => keysPressed(event))

document.querySelector('body').addEventListener('touchstart', (event) => movePlayerMobile(event, true))
document.querySelector('body').addEventListener('touchend', (event) => movePlayerMobile(event, false))
document.querySelector('body').addEventListener('touchcancel', (event) => movePlayerMobile(event, false))


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

function movePlayerMobile(event, touch) {
  var touchLength = event.touches.length
  var keyPressed = event.target.classList[0]
  
  if (keyPressed === 'ArrowUp' || keyPressed === 'ArrowDown' || keyPressed === 'ArrowLeft' || keyPressed === 'ArrowRight') {
    if (touchLength > 0) {
      var hasInList = gameArea.keys.indexOf(keyPressed)

      if (touch) {
        if (hasInList === -1)
          gameArea.keys.push(keyPressed)

      } else {
        gameArea.keys.splice(hasInList, 1)
      }
  
    } else {
      gameArea.keys = []
    }
  }
}

setInterval(() => {
  for (var key of gameArea.keys) {
    gameArea.movePlayer(key)
    
    mobileScreen()
  }
}, 20);
