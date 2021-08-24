const socket = io('https://8081-indigo-gazelle-ivr9yout.ws-us16.gitpod.io')

socket.on('connect', () => {
    console.log('Conected!')
})

socket.on('user_id', (id) => {
    startGame(id.id)
})

socket.on('receive_state', (state) => {
    console.log(state)
})


function startGame(idUser) {
    document.querySelector('body').addEventListener('keydown', handleKeyPressed)

    var currentPlayer = idUser
    console.log('Seu id de jogador: ', currentPlayer)

    const game = {
        players: {
            'teste': [{playerId: currentPlayer, x: 2, y: 2}]
        },
        foods: {
            x: 2,
            y: 4
        }
    }
    addPlayer(currentPlayer)
    
    const player = game.players[currentPlayer]
    
    var automaticMoveDirection = "ArrowRight"
    
    function eatFood() { // collision between snake and food
        const fruit = game.foods
    
        if (player[0].x === fruit.x && player[0].y === fruit.y) {
            console.log('Comeu!')


            player[player.length] = {
                playerId: currentPlayer,
                x: player[player.x],
                y: player[player.y]
            }
    
            game.foods = {}
        }
    }
    
    function addFruit(newPosition) {
        var x = Math.floor(Math.random() * 24 + 1)
        var y = Math.floor(Math.random() * 24 + 1)
        
        if (typeof game.foods.x === 'undefined') {

            socket.emit('new-fruit', { x, y })

            game.foods.x = x
            game.foods.y = y

            socket.emit('eat_fruit', {x, y})
        }
    }
    
    function addPlayer(playerId) {
        game.players[playerId] = [
            { playerId: playerId, x: 1, y: 1 }
        ]
    }
    
    
    function moveSnake(type) {
        eatFood()
    
        if (type === "ArrowUp" && automaticMoveDirection !== "ArrowDown") {
            player.unshift({ // Remove a ultima posição de um array
                playerId: currentPlayer,
                x: player[0].x,
                y: player[0].y-1
            })
            player.splice(-1, 1)
    
        } else if (type === "ArrowDown" && automaticMoveDirection !== "ArrowUp") {
            player.unshift({
                playerId: currentPlayer,
                x: player[0].x,
                y: player[0].y+1
            })
            player.splice(-1, 1)
    
        } else if (type === "ArrowLeft" && automaticMoveDirection !== "ArrowRight") {
            player.unshift({
                playerId: currentPlayer,
                x: player[0].x-1,
                y: player[0].y
            })
            player.splice(-1, 1)
    
        } else if (type === "ArrowRight" && automaticMoveDirection !== "ArrowLeft") {
            player.unshift({
                playerId: currentPlayer,
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
    
    
    function checkPlayerCollision() {
        for (var onePlayer in game.players) {
    
            if (onePlayer !== currentPlayer) {
                var playerId = game.players[onePlayer]
    
                for (var pos in playerId) {
                    if (player[0].x === playerId[pos].x && player[0].y === playerId[pos].y) {
                        console.log('Colisão')
                    }
                }
    
            }
        }
    }
    
    
    
    function handleKeyPressed(e) {
        const key = e.key
        
        const validKey = moveSnake(key)
    
        if (validKey !== false) automaticMoveDirection = validKey
        
    }
    
    socket.on('eat_fruit', (state) => {
        console.log('Novas posições: ', state)

        game.foods.x = state.x
        game.foods.y = state.y
    })

    socket.on('move_players', (state) => {
        game.players[state[0].playerId] = state
    })
    
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
    
        checkPlayerCollision()

        socket.emit('move_players', game.players[currentPlayer])

        setTimeout(() => renderScreen(), 150)
    }
    renderScreen()
}
