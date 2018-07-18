var express = require('express');
var app = express();
var http = require('http').Server(app);

var io = require('socket.io')(http);

var port = process.env.PORT || 3000;

let staticFiles = __dirname + '/scripts';

let currentUsers = [];

let lastUserToLeave = '';

app.use('/', express.static(staticFiles));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

function getOnlineUsers() {
  let onlineUsers = [];
  for (i = 0; i < currentUsers.length; i++) {
      onlineUsers.push(currentUsers[i][0]);
  }
  return onlineUsers;
}

io.on('connection', function (socket) {
  socket.on('hello?', (userID) => {
      io.to(userID).emit('current users', getOnlineUsers());
  });

  socket.on('join chat', (username, userID) => {
      socket.broadcast.emit('incoming message', username + ' has joined the chat.');
      let userdata = [];
      userdata.push(username, userID);
      currentUsers.push(userdata);
      console.log(currentUsers);
  });

  socket.on('user sent message', (msg) => {
      socket.broadcast.emit('incoming message', msg);
  });

  socket.on('disconnect', function () {
      if (currentUsers.length == 1) {
          let lastUser = currentUsers[0][0];
          currentUsers = [];
          socket.broadcast.emit('incoming message', lastUser + ' has left.');
          console.log('There are no current users.')
      } else {
          Object.keys(io.sockets.sockets).forEach((id) => {
              for (i = 0; i < currentUsers.length; i++) {
                  if (currentUsers[i][1] != id) {
                      let leavingUser = currentUsers[i][0];
                      currentUsers.splice(i, 1);
                      socket.broadcast.emit('incoming message', leavingUser + ' has left.');
                      lastUserToLeave = leavingUser;
                  }
              }
          });
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

http.listen(port, function(){
  console.log('listening on *:' + port);
});
