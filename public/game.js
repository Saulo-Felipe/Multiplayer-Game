const socket = io('https://multiplayer-game-saulo.herokuapp.com/')

socket.on('connect', () => {
    socket.emit("new-connection", true, (error, message) => {
        for (var defaultPlayer of message) {
            gameArea.allEnemies.push(defaultPlayer)
        }
    })
})

socket.on('user_id', (id) => {
    console.log("Conectado com o ID: ", id)
    player.id = id.id
    oldState.id = id.id
    socket.emit('add-new-player', player)
})

socket.on('new-player', (player) => {
    gameArea.allEnemies.push(player)
})

socket.on('disconnected', (id) => {
    for (var count in gameArea.allEnemies) {
        if (gameArea.allEnemies[count].id === id) {
            delete gameArea.allEnemies[count]
        }
    }
    
    // Clear array
    var cleanArray = []
    for (var count in gameArea.allEnemies) {
        if (typeof gameArea.allEnemies[count] !== 'undefined')
            cleanArray.push(gameArea.allEnemies[count])
    }
    gameArea.allEnemies = cleanArray
})

socket.on('refresh-players', (state) => {

    if (state.id === player.id) {
        player = state
        
    } else {
        for (var c in gameArea.allEnemies) {
            if (state.id === gameArea.allEnemies[c].id) {
                gameArea.allEnemies[c] = state
                break
            }
        }
    }
})

socket.on('player-dead', (state) => {
    console.log('O joador morreu: ', state)
})


// -------------------- Game --------------------------

var canvas = document.querySelector("canvas")

var gameArea = {
    ctx: canvas.getContext('2d'),
    myTank: new Image(),
    enemyTank: new Image(),
    keys: [],
    allEnemies: [],
}

var player = {
    x: 200,
    y: 200,
    moveAngle: 0,
    speed: 0,
    velocity: 0,
    angle: 0,
    shots: [],
    id: null,
    life: 100,
}

var oldState = {...player}

gameArea.myTank.src = "./images/i_tank.png"
gameArea.enemyTank.src = "./images/enemy.png"


window.addEventListener('keydown', (key) => {
    gameArea.keys[key.key] = (key.type === "keydown")

    if (key.code === 'Space') {
        if (player.shots.length < 2)
            player.shots.push(new Shoot())
    }
})

window.addEventListener('keyup', (key) => {
    if (key.key === 'w') {
        console.log("my Player: ", player.x, player.y)

        for (var enemy of gameArea.allEnemies) {
            console.log('Inimigo: ', enemy.x, enemy.y)
        }
    }
    gameArea.keys[key.key] = (key.type == "keydown")
})

function walkCollision() {
    if (player.y-20 < 0) {
        player.y+=4
    }
    if (player.y+20 > canvas.height) {
        player.y-=4
    }
    if (player.x-20 < 0) {
        player.x+=4
    }
    if (player.x+20 > canvas.width) {
        player.x-=4
    }
}

function Observer() {
    console.log('Atualizando')

    socket.emit('update-state', player)
}

function handleKeyPressed() {

    player.moveAngle = 0
    player.speed = 0
    

    if (gameArea.keys["ArrowUp"])
        player.speed = 4
             
    if (gameArea.keys['ArrowDown'])
        player.speed = -4

    if (gameArea.keys['ArrowLeft'])
        player.moveAngle = -4

    if (gameArea.keys['ArrowRight'])
        player.moveAngle = 4

    // Update position
    player.angle += player.moveAngle*Math.PI/180

    player.x += player.speed*Math.sin(player.angle)
    player.y -= player.speed*Math.cos(player.angle)

    walkCollision()

}

class Shoot {
    id = Math.random()
    x = player.x
    y = player.y
    defaultAngle = player.angle
}

function keepState() {

    var currentPlayer = Object.keys(player)

    for (var c of currentPlayer) {
        if (c !== 'shots') {
            if (oldState[c] !== player[c]) {
                oldState = {...player}
                Observer()
            }
        } else {
            if (player.shots.length !== oldState.shots.length ) {

                oldState = {...player}
                Observer()
            }
        }
    }

}

function updateShoots() {

    var refeshShoots = []
    for (var shot of player.shots) { // Atualiza os proprios tiros

        shot.x += 5*Math.sin(shot.defaultAngle)
        shot.y -= 5*Math.cos(shot.defaultAngle)

        gameArea.ctx.save()
        gameArea.ctx.translate(shot.x, shot.y) 
        gameArea.ctx.rotate(shot.defaultAngle)

        gameArea.ctx.beginPath()
        gameArea.ctx.rect(1, 5, 2, 10)
        gameArea.ctx.stroke()

        gameArea.ctx.restore()
        
        if (shot.y < canvas.height && shot.y > 0 && shot.x < canvas.width && shot.x > 0) {
            refeshShoots.push(shot)
        }

    }
    player.shots = refeshShoots


    for (var p of gameArea.allEnemies) { // Desenha as balas inimigas
        for (shot of p.shots) {

            shot.x += 5*Math.sin(shot.defaultAngle)
            shot.y -= 5*Math.cos(shot.defaultAngle)
    
            gameArea.ctx.save()
            gameArea.ctx.translate(shot.x, shot.y) 
            gameArea.ctx.rotate(shot.defaultAngle)
    
            gameArea.ctx.beginPath()
            gameArea.ctx.rect(1, 5, 2, 10)
            gameArea.ctx.stroke()
    
            gameArea.ctx.restore()

        }
    }
    

}

function collisions() {
    for (var enemy of gameArea.allEnemies) {
        var enemyX = enemy.x-19
        var enemyY = enemy.y-19
        
        var playerX = player.x-19
        var playerY = player.y-19

        // gameArea.ctx.beginPath()
        // gameArea.ctx.rect(enemyX, enemyY, 46, 46)
        // gameArea.ctx.stroke()


        if ((playerX > enemyX-42) && (playerY < enemyY+37) && (playerY > enemyY-37) && (playerX < enemyX-37)) { // Esquerda
            player.x -= 4
        }

        if ((playerX-42 < enemyX) && (playerY < enemyY+37) && (playerY > enemyY-37) && (playerX-37 > enemyX)) { // Direita
            player.x += 4
        }

        if ((playerY > enemyY-42) && (playerX > enemyX-37) && (playerX < enemyX+37) && (playerY < enemyY-37)) { // Cima
            player.y -= 4
        }

        if ((playerY < enemyY+42) && (playerX > enemyX-37) && (playerX < enemyX+37) && (playerY-37 > enemyY)) { // Baixo
            player.y += 4
        }

    }
}

function shootCollision() {
    
    for (var enemy in gameArea.allEnemies) {

        var refeshShoots = []
        for (var shoot of gameArea.allEnemies[enemy].shots) { // Atualizar tiros dos inimigos (vazamento de memoria)
            if (shoot.y < canvas.height && shoot.y > 0 && shoot.x < canvas.width && shoot.x > 0) {
                refeshShoots.push(shoot)
                console.log("Atualizando bala inimiga")
            }
        }
        gameArea.allEnemies[enemy].shots = refeshShoots


        var myShootRefresh = []
        for (var myShoot of player.shots) {
            var enemyX = gameArea.allEnemies[enemy].x
            var enemyY = gameArea.allEnemies[enemy].y

            var shootX = myShoot.x
            var shootY = myShoot.y

            if (!((shootX > enemyX-25) && (shootX < enemyX+25) && (shootY > enemyY-20) && (shootY < enemyY+20))) {
                myShootRefresh.push(myShoot)
            } else {
                gameArea.allEnemies[enemy].life -= 20

                socket.emit('update-state', gameArea.allEnemies[enemy])
            }
            
        }
        player.shots = myShootRefresh
        
    }
}

function drawItems() {

    // draw my tank
    gameArea.ctx.save()
    gameArea.ctx.translate(player.x, player.y)
    gameArea.ctx.rotate(player.angle)
    gameArea.ctx.drawImage(gameArea.myTank, -gameArea.myTank.width/2, -gameArea.myTank.height/2);  
    gameArea.ctx.restore()

    // draw enemy tanks
    for (var p of gameArea.allEnemies) {
        gameArea.ctx.save()
        gameArea.ctx.translate(p.x, p.y) 
        gameArea.ctx.rotate(p.angle)
        gameArea.ctx.drawImage(gameArea.enemyTank, -50/2, -50/2);  
        gameArea.ctx.restore()
    }

    // gameArea.ctx.beginPath()
    // gameArea.ctx.rect(player.x-25, player.y-25, 50, 50)
    // gameArea.ctx.stroke()

    // Names
    gameArea.ctx.font = "10px Arial"
    
    var userName = String(player.id).length > 10 ? String(player.id).substring(0, 10)+'...' : player.id
    var txtWidth = gameArea.ctx.measureText(userName).width

    gameArea.ctx.fillText(userName, player.x-txtWidth/2, player.y+40) // my payer name


    for (var enemy of gameArea.allEnemies) { // All enemies name
        var userName = String(enemy.id).length > 10 ? String(enemy.id).substring(0, 10)+'...' : enemy.id
        var txtWidth = gameArea.ctx.measureText(userName).width
    
        gameArea.ctx.fillText(userName, enemy.x-txtWidth/2, enemy.y+40)
    }


    // Lifes
    var txtLife = player.life+' ❤'
    var txtWidth = gameArea.ctx.measureText(txtLife).width

    gameArea.ctx.fillText(txtLife, player.x+20-txtWidth, player.y-30) // my payer name

    for (var enemy of gameArea.allEnemies) { // All enemies name
        var txtLife = enemy.life+' ❤'
        var txtWidth = gameArea.ctx.measureText(txtLife).width
    
        gameArea.ctx.fillText(txtLife, enemy.x+20-txtWidth, enemy.y-30)
    }


}

function dead() {
    
    if (player.life === 0) {
        alert("Você morreu")
    }
    
}

function renderScreen() {
    gameArea.ctx.clearRect(0, 0, canvas.width, canvas.height) 



    drawItems()

    updateShoots()

    shootCollision()
    
    keepState()

    handleKeyPressed()

    collisions()

    dead()

    requestAnimationFrame(renderScreen)
}


renderScreen()
