
let usernameInput = document.getElementById('');

let username = '';
let userID = '';
let users = '';
// to implement later
let typing = false;

const usernameForm = document.getElementById('usernameForm');
const messageForm = document.getElementById('messageForm');
const messages = document.getElementById('chatMessages');
let message = '';

var socket = io.connect('http://localhost:3000');
// var socket = io.connect('http://14a48ab8.ngrok.io');
// example URL, make sure to point to the hosted URL, and not localhost:3000 to run online.

function focus() {
    document.getElementById('usernameInput').focus();
}

function addMessage(msg) {
    var newMessage = document.createElement('li');
    var newMessageText = document.createTextNode(msg);
    newMessage.appendChild(newMessageText);
    messages.appendChild(newMessage);
}

usernameForm.onsubmit = function (e) {
    e.preventDefault();
    username = document.getElementById('usernameInput').value;
    if (username != '') {
        userID = socket.id;
        messagePrefix = username + ' : ';
        socket.emit('join chat', username, userID);
        addMessage('You have joined the chat.');
        usernameForm.style.display = 'hidden';
        messageForm.style.display = 'block';
        document.getElementById('messageInput').focus();
    }
}

messageForm.onsubmit = function (e) {
    e.preventDefault();
    messageInput = document.getElementById('messageInput');
    message = messageInput.value;
    if (message != '') {
        socket.emit('user sent message', messagePrefix + message);
        addMessage(messagePrefix + message);
        window.scrollTo(0, document.body.scrollHeight);
        messageInput.value = '';
    }
}

socket.on('connect', () => {
    userID = socket.id;
    socket.emit('hello?', userID);
});

socket.on('current users', (onlineUsers) => {
    users = onlineUsers;
    if (onlineUsers[0]) {
        addMessage('Online users :')
        users.forEach(user => {
            addMessage('    ' + user);
        });
    } else {
        addMessage('There is nobody else here.');
    }
});

socket.on('incoming message', (msg) => {
    addMessage(msg);
    window.scrollTo(0, document.body.scrollHeight);
});

socket.on('disconnect', () => {
    socket.emit('user left', username);
});