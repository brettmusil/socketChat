var express = require('express');
var app = express();
var http = require('http').Server(app);

var io = require('socket.io')(http);

var port = process.env.PORT || 3000;

let staticFiles = __dirname + '/scripts';

let currentUsers = [];

app.use('/', express.static(staticFiles));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

function getOnlineUsers() {
    let onlineUsers = [];
    currentUsers.forEach((user) => {
        onlineUsers.push(user[0]);
    });
    return onlineUsers;
}

io.on('connection', (socket) => {
let joinedChat = false;

socket.on('hello?', (userID) => {
    io.to(userID).emit('current users', getOnlineUsers());
});

socket.on('join chat', (username, userID) => {
    socket.username = username;
    joinedChat = true;
    socket.broadcast.emit('system message', username + ' has joined the chat.');
    currentUsers.push([username, userID]);
    console.log(currentUsers);
});

socket.on('user sent message', (username, msg) => {
    socket.broadcast.emit('incoming message', username + " : ", msg);
});

socket.on('disconnect', () => {
        if (joinedChat) {
            for (i = 0; i < currentUsers.length; i++) {
                if (currentUsers[i][1] == socket.id) {
                    currentUsers.splice(i, 1);
                }
            }
            socket.broadcast.emit('system message', socket.username + ' has left.'); 
            console.log('Currently online :' + currentUsers);
        }
});

/* private message
socket.on('say to someone', (id, msg) => {
  // send a private message to the socket with the given id
  socket.to(id).emit('my message', msg);
});
*/

});

http.listen(port, function () {
    console.log('listening on *:' + port);
});