export default function renderScreen(context, game) {

	context.clearRect(0, 0, screen.width, screen.height)

	for (var playerID in game.state.players) {
		const player = game.state.players[playerID]

		context.fillStyle = 'black'
		context.fillRect(player.x, player.y, 1, 1)
	}

	for (var fruitID in game.state.fruits) {
		const fruit = game.state.fruits[fruitID]

		context.fillStyle = 'red'
		context.fillRect(fruit.x, fruit.y, 1, 1)
	}

	requestAnimationFrame(() => renderScreen(context, game))
}