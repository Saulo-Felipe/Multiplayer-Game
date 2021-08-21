console.log(` [ Feito por Saulo Felipe ] `)

const screen = document.querySelector('#screen')
context = screen.getContext('2d')


function createGame() {

	const state = {
		players: {
			'player1': { x: 0, y: 0 },
			'player2': { x: 5, y: 5 }
		},
		fruits: {
			'fruit1': { x: 2, y: 2 }
		}
	}

	function movePlayer(command) {

		const keyPressed = command.keyPressed
		const player = state.players[command.playerId]

		const aceptedMoves = {
			ArrowUp(player) {
				
			}
		}

		if (keyPressed === 'ArrowUp' && player.y > 0) {
			player.y -= 1
			return
		}

		if (keyPressed === 'ArrowDown' && player.y < 9) {
			player.y += 1
			return
		}

		if (keyPressed === 'ArrowLeft' && player.x > 0) {
			player.x -= 1
			return
		} 

		if (keyPressed === 'ArrowRight' && player.x < 9) {
			player.x += 1
			return
		}
	}

	return {
		movePlayer,
		state
	}

}

const game = createGame()
const currentPlayer = 'player1'


document.addEventListener('keydown', (e) => {
	game.movePlayer({keyPressed: e.key, playerId: currentPlayer})
})


renderScreen()
function renderScreen () {

	context.clearRect(0, 0, screen.width, screen.height)

	for (var playerID in game.state.players) {
		const player = game.state.players[playerID]

		context.fillStyle = 'green'
		context.fillRect(player.x, player.y, 1, 1)
	}

	for (var fruitID in game.state.fruits) {
		const fruit = game.state.fruits[fruitID]

		context.fillStyle = 'red'
		context.fillRect(fruit.x, fruit.y, 1, 1)
	}



	requestAnimationFrame(renderScreen)

}

