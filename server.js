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



io.on('connection', (sockets) => {
    

})


server.listen(process.env.PORT || 8081, () => console.log('Server is running!'))