window.addEventListener('load', () => pageLoad())

async function play() {
  var input = document.querySelector('input')

  if (input.value.length > 0) {
    buttonLoading('insert')
    socket.connect()

    localStorage.setItem('player_name', input.value)
  } else {
    const errorMsg =  document.querySelector('.error-msg')

    errorMsg.innerHTML = 'Digite um nome de jogador para poder jogar.'

    setTimeout(() => {
      errorMsg.innerHTML = ''
    }, 3000);
  }
}

function mobileScreen() {
  const player = gameArea.players[socket.id]

  const container = document.querySelector('.game-container > canvas')

  const screenWdith = screen.width/2+25
  const screenHeight = screen.height/2+25

  container.style.transform = `translate(${screenWdith-player.x}px, ${screenHeight-player.y}px)`

}

function pageLoad() {
  var playerName = localStorage.getItem('player_name')
  if (playerName !== null) {
    document.querySelector('input').value = playerName  
  }
  if (window.matchMedia("(max-width: 1000px)").matches) {
    
  }
}


function buttonLoading(type) {
  var btn = document.querySelector('.btn-play')

  if (type === 'insert') {
    btn.innerHTML += '<i class="fas fa-spinner"></i>'
    btn.setAttribute('disabled', 'disabled')
  }
  else {
    btn.innerHTML = 'Jogar'
    btn.removeAttribute('disabled')
  }


}