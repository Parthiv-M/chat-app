const {generateMessage, generateLocationMessage} = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT  || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {

    console.log('New WebSocket Connection')

    socket.on('join', ({ username, room }, callback) => {

        const { error, user } = addUser({
            id: socket.id,
            username,
            room
        })

        if(error) {
            return callback(error)
        }
        
        socket.join(user.room)   

        socket.emit('message', generateMessage('admin', 'Welcome to ' + user.room))        //server to client
        socket.broadcast.to(user.room).emit('message', generateMessage('admin', user.username + ' has joined ' + user.room + '!'))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room) 
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {

        const filter = new Filter()

        const myUser = getUser(socket.id)

        if(filter.isProfane(message)){
            return callback('Profanity is frowned upon.')
        }

        io.to(myUser.user.room).emit('message', generateMessage(myUser.user.username, message))           //server to all clients
        callback()
    })

    socket.on('sendLocation', (location, callback) => {

        const myUser = getUser(socket.id)

        io.to(myUser.user.room).emit('locationMessage', generateLocationMessage(myUser.user.username, 'https://google.com/maps?q=' + location.latitude + ',' + location.longitude))     //server to clients
        callback()
    })

    socket.on('disconnect', () => {

        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMessage('admin', user.username + ' has left ' + user.room))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room) 
            })
        }
    })
    
})

server.listen(port, () => {
    console.log('Server up port ' + port)
})