export default function movePlayer(command) {

    const aceptedMoves = {
        ArrowUp(player) {
            if (player.y > 0) {
                player.y -= 1
                return
            }
        },
        ArrowDown(player) {
            if (player.y < 9) {
                player.y += 1
                return
            }
        },
        ArrowLeft(player) {
            if (player.x > 0) {
                player.x -= 1
                return
            }
        },
        ArrowRight(player) {
            if (player.x < 9) {
                player.x += 1
                return
            }
        }

    }

    function checkFruitCollision(playerId) {
        const player = state.players[playerId]

        for (const fruitId in state.fruits) {
            const fruit = state.fruits[fruitId]

            if (player.x === fruit.x && player.y === fruit.y) {
                console.log('Colisão detectada!')

                removeFruit({ fruitId: fruitId })
            }
        }

    }

    const keyPressed = command.keyPressed
    const playerId = command.playerId
    const player = state.players[playerId]
    const moveFunction = aceptedMoves[keyPressed]


    if (player && moveFunction) {
        moveFunction(player)
        checkFruitCollision(playerId)
    }
}