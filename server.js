const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const chalk = require('chalk');
const path = require('path');

const messageFormat = require('./utils/messageFormat');
const { userJoin, getUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = 8080;

app.use(express.static(path.join(__dirname, "public")));

const botName = 'ChatApp Bot';

io.on('connection', socket => {
    console.log(chalk.greenBright('New Web Socket Connection.'));

    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        //Sends a message from the server to the specific client (socket) that triggered the event.
        socket.emit('message', messageFormat(botName, 'Welcome to ChatApp.'));

        //Sends a message from the server to all connected clients except the one that triggered the event.
        socket.broadcast
            .to(user.room)
            .emit('message', messageFormat(botName, `${user.username} has joined the chat.`));
        
        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room),
        });    
    });

    //Listen from chat message
    socket.on('chat-message', msg => {
        const current_user = getUser(socket.id);

        //Sends a message from the server to all connected clients, including the one that triggered the event.
        io.to(current_user.room).emit('message', messageFormat(current_user.username, msg));
    });

    //Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        
        if (user){
            io.to(user.room).emit('message', messageFormat(botName, `${user.username} has left the chat.`));

            //Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room),
            });
        };    
    });
});

server.listen(port, () => {
    console.log(chalk.blue(`Server is running at port ${port}`));
});