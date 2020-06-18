const users = []

const addUser = ({ id, username, room }) => {

    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate data
    if(!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    //chack for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate username
    if(existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    //store user
    const user = {
        id,
        username,
        room
    }
    users.push(user)

    return {
        user
    }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if(index !== -1) {
        return users.splice(index, 1)[0]    //users.splice(index, 1) returns an array which has the removed items => then access that element
    }
}

const getUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    const user = users[index]

    return {
        user
    }
}

const getUsersInRoom = (room) => {
    
    room = room.trim().toLowerCase()

    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
