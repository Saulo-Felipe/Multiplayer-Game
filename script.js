import createGame from './game.js'

console.log(` [ Feito por Saulo Felipe ] `)

const screen = document.querySelector('#screen')
const context = screen.getContext('2d')

const game = createGame()
const currentPlayer = 'player1'


document.addEventListener('keydown', (e) => {
	game.movePlayer({ keyPressed: e.key, playerId: currentPlayer })
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

