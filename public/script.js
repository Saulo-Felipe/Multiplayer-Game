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

function getTranslateXY(element) {
  const style = window.getComputedStyle(element)
  const matrix = new DOMMatrixReadOnly(style.transform)
  return {
    translateX: matrix.m41,
    translateY: matrix.m42
  }
}

function mobileScreen() {
  var player = gameArea.players[socket.id]

  const container = document.querySelector('.game-container > canvas')

  const screenWdith = (screen.width/2) - player.x
  const screenHeight = (screen.height/2) - player.y

  console.clear()
  console.log(screenWdith, screenHeight)
  
  if (screenWdith < 78 && screenWdith > -811)
    container.style.transform = `translate(${screenWdith}px, ${getTranslateXY(canvas).translateY}px) scale(0.7)`
  
  if (screenHeight < -20 && screenHeight > -394)
    container.style.transform = `translate(${getTranslateXY(canvas).translateX}px, ${screenHeight}px) scale(0.7)`


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