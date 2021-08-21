import movePlayer from "./keyboard-listener"
export default function createGame() {

	const state = {
		players: {},
		fruits: {}
	}
	
	addPlayer({ playerId: 'player1', playerX: 0, playerY: 0 })
	addPlayer({ playerId: 'player2', playerX: 2, playerY: 2 })
	addFruit({ fruitId: 2, fruitX: 4, fruitY: 4 })
	addFruit({ fruitId: 3, fruitX: 6, fruitY: 2 })
	addFruit({ fruitId: 4, fruitX: 6, fruitY: 9 })
	

	function addPlayer(command) {
		const playerId = command.playerId
		const playerX = command.playerX
		const playerY = command.playerY

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

	return {
		movePlayer,
		state,
		addPlayer,
		removerPlayer,
		addFruit,
		removeFruit
	}

}
