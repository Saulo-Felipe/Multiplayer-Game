function play() {
  socket.connect()

  document.querySelector('.blur-screen').style.display = 'none'
  document.querySelector('.initial-container').style.display = 'none'
}


function mobileScreen(key) {
  const player = gameArea.players[socket.id]

  const container = document.querySelector('.game-container > canvas')

  const screenWdith = screen.width/2+25
  const screenHeight = screen.height/2+25


  if (key !== 'ArrowLeft' && key !== 'ArrowRight') { 
    // container.scrollTo(player.x-screenWdith, player.y-screenHeight)
    container.style.transform = `translate(${screenWdith-player.x}px, ${screenHeight-player.y}px)`
  }
}

