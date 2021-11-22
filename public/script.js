window.addEventListener('load', () => pageLoad())

function play() {
  var input = document.querySelector('input')

  if (input.value.length > 0) {
    socket.connect()

    document.querySelector('.blur-screen').style.display = 'none'
    document.querySelector('.initial-container').style.display = 'none'

    localStorage.setItem('player_name', input.value)
  } else {
    const errorMsg =  document.querySelector('.error-msg')

    errorMsg.innerHTML = 'Digite um nome de jogador para poder jogar.'

    setTimeout(() => {
      errorMsg.innerHTML = ''
    }, 3000);
  }
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

function pageLoad() {
  var playerName = localStorage.getItem('player_name')
  if (playerName !== null) {
    document.querySelector('input').value = playerName  
  }
}
