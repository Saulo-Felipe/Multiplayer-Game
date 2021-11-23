window.addEventListener('load', () => pageLoad())

async function play() {
  var input = document.querySelector('input')

  if (input.value.length > 0) {
    buttonLoading('insert')
    await socket.connect()
    buttonLoading('remove')


    gameArea.playing = true
    editCurrentScreen('remove-all')

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


function buttonLoading(type) {
  var btn = document.querySelector('.btn-play')

  if (type === 'insert')
    btn.innerHTML += '<i class="fas fa-spinner"></i>'
  else
    btn.innerHTML = 'Jogar'


}