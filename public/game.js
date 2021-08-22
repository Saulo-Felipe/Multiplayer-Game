export default function createGame() {

	const state = {
		players: {},
		fruits: {},
		screen: {
			width: 10,
			height: 10
		}
	}

	function addPlayer(command) {
		const playerId = command.playerId
		const playerX = 'playerX' in command ? command.playerX : Math.floor(Math.random() * state.screen.width)
		const playerY = 'playerY' in command ? command.playerY : Math.floor(Math.random() * state.screen.height)

		state.players[playerId] = {
			x: playerX,
			y: playerY
		}
	}

	function removerPlayer(command) {
		const playerId = command.playerId

		delete state.players[playerId]
	}

	function addFruit(command) {
		const fruitId = command.fruitId
		const fruitX = command.fruitX
		const fruitY = command.fruitY
		
		state.fruits[fruitId] = {
			fruitId: fruitId,
			x: fruitX,
			y: fruitY
		}
	}

	function removeFruit(command) {
		const fruitId = command.fruitId

		delete state.fruits[fruitId]
	}

	function movePlayer(command) {

		const aceptedMoves = {
			ArrowUp(player) {
				if (player.y > 0) {
					player.y -= 1
					return
				}
			},
			ArrowDown(player) {
				if (player.y + 1 < state.screen.height) {
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
				if (player.x + 1 < state.screen.width) {
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

	return {
		movePlayer,
		state,
		addPlayer,
		removerPlayer,
		addFruit,
		removeFruit
	}

}