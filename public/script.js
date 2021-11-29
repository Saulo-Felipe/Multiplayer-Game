window.addEventListener('load', () => pageLoad())
document.querySelector('.fullScreen').addEventListener('click', () => fullScreen())

function play() {
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

function screenMoviment() {
  console.log("refresh screen")
  var player = gameArea.players[socket.id]

  const screenX = (screen.width/2) - player.x
  const screenY = (screen.height/2) - player.y

  var isMobile = window.matchMedia("(max-width: 1000px)").matches ? true : false

  if (isMobile) {

    if (player.y > 245 && player.y < 600)
      canvas.style.transform = `translate(${getTranslateXY(canvas).translateX}px, ${screenY}px) scale(0.7)`

    if (player.x > 279 && player.x < 1197)
      canvas.style.transform = `translate(${screenX}px, ${getTranslateXY(canvas).translateY}px) scale(0.7)`

  } 
  else 
    canvas.style.transform = `translate(${screenX}px, ${screenY}px)`
}

function pageLoad() {
  var playerName = localStorage.getItem('player_name')
  if (playerName !== null) {
    document.querySelector('input').value = playerName  
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

function fullScreen() {
  var element = document.querySelector('.fullScreen > i')

  if (element.classList.contains('fa-expand')) {
    element.classList.remove('fa-expand')
    element.classList.add('fa-compress')
  } else {
    element.classList.remove('fa-compress')
    element.classList.add('fa-expand')
  }

  toggleFullscreen()
}

function toggleFullscreen() {
  var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
    (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
    (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
    (document.msFullscreenElement && document.msFullscreenElement !== null);

  var docElm = document.querySelector('html');
  if (!isInFullScreen) {
    if (docElm.webkitRequestFullScreen)
      docElm.webkitRequestFullScreen()
    else if (docElm.requestFullscreen)
      docElm.requestFullscreen()
    else if (docElm.mozRequestFullScreen)
      docElm.mozRequestFullScreen()
    else if (docElm.msRequestFullscreen)
      docElm.msRequestFullscreen()
    
  } else {
    if (document.exitFullscreen)
      document.exitFullscreen()
    else if (document.webkitExitFullscreen)
      document.webkitExitFullscreen()
    else if (document.mozCancelFullScreen)
      document.mozCancelFullScreen()
    else if (document.msExitFullscreen)
      document.msExitFullscreen()
  }
}