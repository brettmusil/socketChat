var express = require('express');
var app = express();
var http = require('http').Server(app);

var io = require('socket.io')(http);

var port = process.env.PORT || 3000;

let staticFiles = __dirname + '/scripts';

let onlineUsers = [];

app.use('/', express.static(staticFiles));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

function getOnlineUsernames() {
    let onlineUsernames = [];
    onlineUsers.forEach((user) => {
        onlineUsernames.push(user[0]);
    });
    return onlineUsernames;
}

io.on('connection', (socket) => {
let joinedChat = false;

socket.on('hello?', (userID) => {
    io.to(userID).emit('who is here', getOnlineUsernames());
});

socket.on('join chat', (username, userID) => {
    socket.username = username;
    joinedChat = true;
    onlineUsers.push([username, userID]);
    socket.broadcast.emit('system message', username + ' has joined the chat.');
    socket.emit('update users', onlineUsers)
    console.log(onlineUsers);
});

socket.on('user sent message', (username, msg) => {
    socket.broadcast.emit('incoming message', username + " : ", msg);
});

socket.on('disconnect', () => {
        if (joinedChat) {
            for (i = 0; i < onlineUsers.length; i++) {
                if (onlineUsers[i][1] == socket.id) {
                    onlineUsers.splice(i, 1);
                }
            }
            socket.broadcast.emit('update users', onlineUsers);
            socket.broadcast.emit('system message', socket.username + ' has left.'); 
            console.log('Currently online :' + onlineUsers);
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