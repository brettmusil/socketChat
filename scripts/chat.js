
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

let socket = io.connect('http://localhost:3000');
//var socket = io.connect('http://c9c93442.ngrok.io');
// example URL, make sure to point to the hosted URL, and not localhost:3000 to run online.

function focus() {
    document.getElementById('usernameInput').focus();
}

function addChatMessage(username, msg) {
    const newMessage = document.createElement('li');

    const nameSpan = document.createElement('span');
    const nameText = document.createTextNode(username);
    nameSpan.appendChild(nameText);

    var messageSpan = document.createElement('span');
    var messageText = document.createTextNode(msg);
    messageSpan.appendChild(messageText)
    
    newMessage.appendChild(nameSpan);
    newMessage.appendChild(messageSpan);

    messages.appendChild(newMessage);
}

function addSystemMessage(msg) {
    const newMessage = document.createElement('li');
    const messageSpan = document.createElement('span');
    const messageText = document.createTextNode(msg);
    messageSpan.appendChild(messageText);
    newMessage.appendChild(messageSpan);
    messages.appendChild(newMessage);
}

usernameForm.onsubmit = (e) => {
    e.preventDefault();
    username = document.getElementById('usernameInput').value;
    if (username != '') {
        userID = socket.id;
        messagePrefix = username + ' : ';
        socket.emit('join chat', username, userID);
        addSystemMessage('You have joined the chat.');
        usernameForm.style.display = 'hidden';
        messageForm.style.display = 'block';
        document.getElementById('messageInput').focus();
    }
}

messageForm.onsubmit = (e) => {
    e.preventDefault();
    messageInput = document.getElementById('messageInput');
    message = messageInput.value;
    if (message != '') {
        socket.emit('user sent message', username, message);
        addSystemMessage(messagePrefix + message);
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
        addSystemMessage('Online users :')
        users.forEach(user => {
            addSystemMessage('    ' + user);
        });
    } else {
        addSystemMessage('There is nobody else here.');
    }
});

socket.on('update users', (onlineUsers) => {
    users = onlineUsers;
    updateOnlineUsers(onlineUsers)
})

socket.on('incoming message', (username, msg) => {
    addChatMessage(username, msg);
    window.scrollTo(0, document.body.scrollHeight);
});

socket.on('system message', (msg) => {
    addSystemMessage(msg);
    window.scrollTo(0, document.body.scrollHeight);
});