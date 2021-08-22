import createGame from './game.js'
import renderScreen from './renderScreen.js'
console.log(` [ Feito por Saulo Felipe ] `)

const screen = document.querySelector('#screen')
const context = screen.getContext('2d')

const game = createGame()
const currentPlayer = 'player1'


document.addEventListener('keydown', (e) => {
	game.movePlayer({ keyPressed: e.key, playerId: currentPlayer })
})

renderScreen(context, game)
