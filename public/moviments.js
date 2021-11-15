document.addEventListener('keydown', event => keysPressed(event))
document.addEventListener('keyup', event => keysPressed(event))


function keysPressed(event) {
  if (socket.connected) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(event.code) !== -1) {
      var keyPosition = gameArea.keys.indexOf(event.code) === -1 ? gameArea.keys.length : gameArea.keys.indexOf(event.code)

      if (event.type === 'keydown')
        gameArea.keys[keyPosition] = event.code
      else 
        gameArea.keys.splice(keyPosition, 1)
   
    }
  }
}

setInterval(() => {
  for (var key of gameArea.keys) {
    gameArea.movePlayer(key)
  }
}, 50);