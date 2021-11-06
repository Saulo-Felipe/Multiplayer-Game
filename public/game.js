const socket = io('http://localhost:8081/')

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
    socket.emit('add-new-player', player)
})

socket.on('new-player', (player) => {
    gameArea.allEnemies.push(player)
})


socket.on('refresh-players', (player) => {

    for (var c in gameArea.allEnemies) {
        if (player.id === gameArea.allEnemies[c].id) {
            gameArea.allEnemies[c] = player
            break
        }
    }

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
    id: null
}

gameArea.myTank.src = "./images/i_tank.png"
gameArea.enemyTank.src = "./images/enemy.png"



class Shot {
    constructor() {
        this.x = player.x
        this.y = player.y
        this.id = Math.random()

        this.defaultAngle = player.angle

    }
    update() {
        // Posiçoes e rotações
        this.x += 5*Math.sin(this.defaultAngle)
        this.y -= 5*Math.cos(this.defaultAngle)

        gameArea.ctx.save()
        gameArea.ctx.translate(this.x, this.y) 
        gameArea.ctx.rotate(this.defaultAngle)

        gameArea.ctx.beginPath()
        gameArea.ctx.rect(1, 5, 2, 10)
        gameArea.ctx.stroke()

        gameArea.ctx.restore()


        // Remover tiros que ultrapassam a tela
        var updateShots = []

        player.shots.forEach(shot => {
            if (shot.y < canvas.height && shot.y > 0 && shot.x < canvas.width && shot.x > 0) {
                updateShots.push(shot)
            }
        })

        player.shots = updateShots

    }
}


window.addEventListener('keydown', (key) => {
    gameArea.keys[key.key] = (key.type === "keydown")
    
    if (key.code === "Space") {
        player.shots.push(new Shot())
        Observer()
    }
})

window.addEventListener('keyup', (key) => {
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


    if (
        gameArea.keys["ArrowUp"] ||
        gameArea.keys["ArrowDown"] ||
        gameArea.keys['ArrowLeft'] ||
        gameArea.keys['ArrowRight']
    ) {
        Observer()
    }
    

    for (var shot of player.shots) {
        shot.update()
    }

}


function renderScreen() {
    gameArea.ctx.clearRect(0, 0, canvas.width, canvas.height) 

    gameArea.ctx.save()
    gameArea.ctx.translate(player.x, player.y)
    gameArea.ctx.rotate(player.angle)
    gameArea.ctx.drawImage(gameArea.myTank, -gameArea.myTank.width/2, -gameArea.myTank.height/2);  
    gameArea.ctx.restore()

    // gameArea.ctx.drawImage(gameArea.enemyTank, 10, 10)

    for (var p of gameArea.allEnemies) {
        gameArea.ctx.save()
        gameArea.ctx.translate(p.x, p.y) 
        gameArea.ctx.rotate(p.angle)
        gameArea.ctx.drawImage(gameArea.enemyTank, -50/2, -50/2);  
        gameArea.ctx.restore()
    }

    handleKeyPressed()

    requestAnimationFrame(renderScreen)
}

renderScreen()







