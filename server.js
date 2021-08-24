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

io.on('connection', (socket) => {
    socket.emit('user_id', {id: socket.id})

    socket.on('eat_fruit', (state) => {
        socket.broadcast.emit('eat_fruit', state)
    })

    socket.on('move_players', (state) => {
        socket.broadcast.emit('move_players', state)
    })

})


server.listen(process.env.PORT || 8081, () => console.log('Server is running!'))