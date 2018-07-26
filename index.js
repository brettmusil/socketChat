var express = require('express');
var app = express();
var http = require('http').Server(app);

var io = require('socket.io')(http);

var port = process.env.PORT || 3000;

let staticFiles = __dirname + '/scripts';

let onlineUsers = [];

let typingUsers = [];

app.use('/', express.static(staticFiles));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    let joinedChat = false;

    socket.on('hello?', (userID) => {
        io.to(userID).emit('update users', onlineUsers);
        if (typingUsers) {
            io.to(userID).emit('users typing', typingUsers);
        }
    });

    socket.on('join chat', (username, userID) => {
        socket.username = username;
        joinedChat = true;
        onlineUsers.push([username, userID]);
        socket.broadcast.emit('system message', username + ' has joined the chat.');
        socket.broadcast.emit('update users', onlineUsers);
        console.log(onlineUsers);
    });

    socket.on('typing', (username) => {
        typingUsers.push(username)
        socket.broadcast.emit('users typing', typingUsers);
    });

    socket.on('done typing', (user) => {
        if (typingUsers.includes(user)) {
            let filteredUsers = typingUsers.filter((value) => {
                return value !== user;
            });
            typingUsers = filteredUsers;
            socket.broadcast.emit('users typing', typingUsers);
        }
    });

    socket.on('user sent message', (username, msg) => {
        socket.broadcast.emit('incoming message', username, msg);
    });

    socket.on('disconnect', () => {
        if (joinedChat) {
            updatedOnlineusers = [];
            for (i = 0; i < onlineUsers.length; i++) {
                if (onlineUsers[i][1] !== socket.id) {
                    updatedOnlineusers.push([onlineUsers[i][0], onlineUsers[i][1]]);
                }
            }
            onlineUsers = updatedOnlineusers;

            if (typingUsers.includes(socket.username)) {
                let filteredUsers = typingUsers.filter((value) => {
                    return value !== socket.username;
                });
                typingUsers = filteredUsers;
                socket.broadcast.emit('users typing', typingUsers);
            }

            socket.broadcast.emit('system message', socket.username + ' has left.');
            socket.broadcast.emit('update users', onlineUsers);
            console.log(onlineUsers);
        }
    });

    socket.on('private message', (sentFrom, msg, recipientID) => {
        let privateMessage = 'Private message from ' + sentFrom + ' : ' + msg;
        socket.to(recipientID).emit('system message', privateMessage);
    });

});

http.listen(port, function () {
    console.log('listening on *:' + port);
});