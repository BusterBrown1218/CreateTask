const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers, userCount } = require('./utils/users');
const getCard = require('./utils/card');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord Bot';

// Run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room}) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // Singular client
        socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

        // Broadcast when a user connects (everyone but the broadcaster)
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat.`));

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user) {
            // Sends to everyone
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat.`));
            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });

    // Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    socket.emit('card-in-play', getCard('hearts', 2));
    let hand = [];
    hand.push(getCard('hearts', 1));
    hand.push(getCard('spades', 1));
    hand.push(getCard('clubs', 1));
    hand.push(getCard('diamonds', 1));
    hand.push(getCard('hearts', 13));
    socket.emit('hand', hand);
});

const PORT = 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));