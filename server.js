const express = require('express')
const app = express()
const http = require('http')
const path = require('path')
const { Server } = require('socket.io')

const server = http.createServer(app)
const io = new Server(server)

app.use(express.static(path.join(__dirname, 'public')))

app.get('*', (request, response) => {
    response.sendFile(path.join(__dirname, "public", "index.html"))
})

var gameState = []

function initialState(type, content) {

    if (type === "addPlayer") {
        gameState.push(content)
    } else {
        var currentTank = content

        for (tank in gameState) {
            if (gameState[tank].id === currentTank.id) {
                gameState[tank] = currentTank
            }
        }
    }

}

io.on('connection', (socket) => {

    
    socket.on('new-connection', (data, callback) => {

        callback(false, gameState)

    })

    socket.on("disconnect", (reason) => {

        for (var count in gameState) {
            if (gameState[count].id === socket.id) {
                delete gameState[count]
            }
        }
        
        // Clear array
        var cleanArray = []
        for (var count in gameState) {
            if (typeof gameState[count] !== 'undefined')
                cleanArray.push(gameState[count])
        }
        gameState = cleanArray

        socket.broadcast.emit('disconnected', socket.id)
    });

    socket.emit('user_id', {id: socket.id} )

    socket.on('update-state', (state) => {
        socket.broadcast.emit('refresh-players', state)


        initialState('update', state)
    })

    socket.on('add-new-player', (player) => {
        socket.broadcast.emit('new-player', player)

        initialState('addPlayer', player)
    })

})


server.listen(process.env.PORT || 8081, () => console.log('Server is running!'))