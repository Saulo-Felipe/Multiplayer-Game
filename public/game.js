document.querySelector('body').addEventListener('keydown', handleKeyPressed)
const currentPlayer = "player1"

const game = {
    players: {
        currentPlayer: [{x: 1, y: 1}],
        'teste': [{x: 2, y: 2}]
    },
    foods: {
        x: 2,
        y: 4
    }
}
const player = game.players.currentPlayer

for (var c=0; c < 20; c++) {
    player[player.length] = {
        x: player[player.x],
        y: player[player.y]
    }
}


var automaticMoveDirection = "ArrowRight"

function eatFood() { // collision between snake and food
    const fruit = game.foods

    if (player[0].x === fruit.x && player[0].y === fruit.y) {
        console.log('Comeu!')

        player[player.length] = {
            x: player[player.x],
            y: player[player.y]
        }

        game.foods = {}
    }

}

function addFruit() {
    function sortPosition() {
        var x = Math.floor(Math.random() * 24 + 1)
        var y = Math.floor(Math.random() * 24 + 1)
        
        return { x: x, y: y }
    }
    
    if (typeof game.foods.x === 'undefined') {

        const allPlayers = game.players
        const allPositions = []
        for (var playerId in allPlayers) {
            const onePlayer = allPlayers[playerId]
            for (p in onePlayer) {
                allPositions.push(onePlayer[p])
            }
        }


        game.foods.x = sortPosition().x
        game.foods.y = sortPosition().y

    }
}

function addPlayer(playerId) {
    game.players[playerId] = [
        {x: 2, y: 4}
    ]
}

function moveSnake(type) {
    eatFood()

    if (type === "ArrowUp" && automaticMoveDirection !== "ArrowDown") {
        player.unshift({ // Remove a ultima posição de um array
            x: player[0].x,
            y: player[0].y-1
        })
        player.splice(-1, 1)

    } else if (type === "ArrowDown" && automaticMoveDirection !== "ArrowUp") {
        player.unshift({
            x: player[0].x,
            y: player[0].y+1
        })
        player.splice(-1, 1)
        
    } else if (type === "ArrowLeft" && automaticMoveDirection !== "ArrowRight") {
        player.unshift({
            x: player[0].x-1,
            y: player[0].y
        })
        player.splice(-1, 1)

    } else if (type === "ArrowRight" && automaticMoveDirection !== "ArrowLeft") {
        player.unshift({
            x: player[0].x+1,
            y: player[0].y
        })
        player.splice(-1, 1)
    } else
        return false

    checkWallCollision()

    return type
}

function checkWallCollision() {
    if (player[0].x > 24) // Colisão Right
        player[0].x -= 25

    if (player[0].x < 0) // Colisão Left
        player[0].x += 25

    if (player[0].y > 24) // Colisão Bottom
        player[0].y -= 25

    if (player[0].y < 0) // Colisão Top
        player[0].y += 25
}

function handleKeyPressed(e) {
    const key = e.key
    
    const validKey = moveSnake(key)

    if (validKey !== false) automaticMoveDirection = validKey
    
}


function renderScreen() {
    const gameScreen = document.querySelector('canvas')
    const context = gameScreen.getContext('2d')
    
    context.clearRect(0, 0, gameScreen.width, gameScreen.height)

    for (var playerId in game.players) {
        for (var c in game.players[playerId]) {
            var playerX = game.players[playerId][c].x
            var playerY = game.players[playerId][c].y

            context.fillStyle = c == 0 ? 'black' : 'gray'
            context.fillRect(playerX, playerY, 1, 1)
        }
    }

    context.fillStyle = "red"
    context.fillRect(game.foods.x, game.foods.y, 1, 1)

    addFruit()
    
    moveSnake(automaticMoveDirection)
    
    setTimeout(() => renderScreen(), 100)
}
renderScreen()