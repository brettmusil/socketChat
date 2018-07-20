
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

function getTime() {
    // formats a javascript Date object into a 12h AM/PM time string
    let date = new Date();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let amPM = (hour > 11) ? "PM" : "AM";
    if(hour > 12) {
      hour -= 12;
    } else if(hour == 0) {
      hour = "12";
    }
    if(minute < 10) {
      minute = "0" + minute;
    }
    return hour + ":" + minute + amPM;
  }

    function displayOnlineUsernames() {
        let x = 'nothing';
    }

function addChatMessage(username, msg) {
    let newMessage = document.createElement('li');

    let nameDiv = document.createElement('div');
    nameDiv.classList.add('nameAndTimeDiv')
    let avatarSpan = document.createElement('span');
    avatarSpan.classList.add('avatar');
    nameDiv.appendChild(avatarSpan);

    let nameSpan = document.createElement('span');
    nameSpan.classList.add('chatName');
    let nameText = document.createTextNode(username);
    nameSpan.appendChild(nameText);
    nameDiv.appendChild(nameSpan);

    let timeSpan = document.createElement('span');
    timeSpan.classList.add('time');
    let timeText = document.createTextNode(getTime());
    timeSpan.appendChild(timeText);
    nameDiv.appendChild(timeSpan);

    let messageDiv = document.createElement('div');
    messageDiv.classList.add('messageDiv');
    let messageSpan = document.createElement('span');
    messageSpan.classList.add('chatBubble');
    let messageText = document.createTextNode(msg);
    messageSpan.appendChild(messageText);
    messageDiv.appendChild(messageSpan);

    newMessage.appendChild(nameDiv);
    newMessage.appendChild(messageDiv);

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
        addChatMessage(username, message);
        window.scrollTo(0, document.body.scrollHeight);
        messageInput.value = '';
    }
}

socket.on('connect', () => {
    userID = socket.id;
    socket.emit('hello?', userID);
});

socket.on('who is here', (onlineUsers) => {
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
    // displayUsernames(users);
    // add logic
})

socket.on('incoming message', (username, msg) => {
    addChatMessage(username, msg);
    window.scrollTo(0, document.body.scrollHeight);
});

socket.on('system message', (msg) => {
    addSystemMessage(msg);
    window.scrollTo(0, document.body.scrollHeight);
});