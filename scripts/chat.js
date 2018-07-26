let username = '';
let userID = '';
let loggedIn = false;
let users = [];
let message = '';
let lastToMessage = '';
let lastSentMultiple = false;
let privateMessageUsername = '';
let privateMessageUserID = '';
let messagingChat = false;
let messagingUser = false;
let typing = false;

const usernameForm = document.getElementById('usernameForm');
const usernameInput = document.getElementById('usernameInput');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const privateMessageForm = document.getElementById('privateMessageForm');
const privateMessageInput = document.getElementById('privateMessageInput');
const messages = document.getElementById('chatMessages');
const usernames = document.getElementById('usernames');
const typingUsers = document.getElementById('typingUsers');

let socket = io.connect('http://localhost:3000'); 
// let socket = io.connect('http://62b1962d.ngrok.io');
// example URL, make sure to point to the hosted URL, and not localhost:3000 to run online.

function usernameFocus() {
    document.getElementById('usernameInput').focus();
}

function displayPrivateMessageForm(sendToUser) {
    messagingChat = false;
    messagingUser = true;
    privateMessageInput.value = '';
    privateMessageInput.placeholder = 'Private message to ' + sendToUser + '.';
    messageForm.style.display = 'none';
    privateMessageForm.style.display = 'block';
    privateMessageInput.focus();
}

function privateMessage(name, id) {
    privateMessageUsername = name;

    if (loggedIn && privateMessageUsername !== username) {
        privateMessageUserID = id;
        displayPrivateMessageForm(privateMessageUsername);
    }
};

document.onkeyup = function (e) {
    if (!!messageInput.value && !typing) {
        typing = true;
        socket.emit('typing', username);
    } 
    if (!messageInput.value && typing) {
        typing = false;
        socket.emit('done typing', username);
    }
}

document.onkeydown = function (e) {
    e = e || window.event;
    let isEscape = false;

    if (loggedIn && messagingUser) {
        if ("key" in e) {
            isEscape = (e.key == "Escape" || e.key == "Esc");
        } else {
            isEscape = (e.keyCode == 27);
        }
        if (isEscape) {
            messagingUser = false;
            messagingChat = true;
            privateMessageUsername = '';
            privateMessageUserID = '';
            privateMessageInput.value = '';
            privateMessageInput.placeholder = '';
            privateMessageForm.style.display = 'none';
            messageForm.style.display = 'block';
            messageInput.focus();
        }
    }
};

function getTime() {
    let date = new Date();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let amPM = (hour > 11) ? 'PM' : 'AM';
    if (hour > 12) {
        hour -= 12;
    } else if (hour == 0) {
        hour = '12';
    }
    if (minute < 10) {
        minute = '0' + minute;
    }
    return hour + ':' + minute + ' ' + amPM;
}
// add msg button next
function addUsername(username, usernameID) {
    let onlineUser = document.createElement('li');
    onlineUser.classList.add('list-group-item', 'h6', 'user');
    onlineUser.id = usernameID;
    let onlineUsernameText = document.createTextNode(username);
    onlineUser.appendChild(onlineUsernameText);
    usernames.appendChild(onlineUser);
    onlineUser.setAttribute('onClick', 'privateMessage(this.textContent, this.id)');
}

function clearUsernames() {
    while (usernames.firstChild) {
        usernames.removeChild(usernames.firstChild);
    }
}

function usersTyping(usersTyping) {
    let singleTyper = '';
    let twoTypers = '';
    let multipleTypers = '';
    if (usersTyping.length == 1) {
        singleTyper = usersTyping[0] + " is typing.";
        typingUsers.textContent = singleTyper;
        typingUsers.style.display = 'block';
    } else if (usersTyping.length == 2) {
        twoTypers = usersTyping[0] + ' and ' + usersTyping[1] + ' are typing.';
        typingUsers.textContent = twoTypers;
        typingUsers.style.display = 'block';
    } else if (usersTyping.length == 0) {
        typingUsers.textContent = '';
        typingUsers.style.display = 'none';
    } else {
        for (i = 0; i < usersTyping.length; i++) {
            if (i == usersTyping.length -1) {
                multipleTypers += 'and ' + usersTyping[i] + ' are typing.';
            } else {
                multipleTypers += usersTyping[i] + ', ';
            }
        }
        typingUsers.textContent = multipleTypers;
        typingUsers.display = 'block';
    }
}

function addChatMessage(username, msg) {
    if (lastToMessage !== username) {
        if (lastSentMultiple == true && lastToMessage !== 'system') {
            messages.lastChild.classList.remove('second');
            messages.lastChild.classList.add('last');
        }
        if (lastSentMultiple == false && lastToMessage !== 'system') {
            messages.lastChild.classList.remove('first');
            messages.lastChild.classList.add('soloMessage');
        }

        let newMessage = document.createElement('li');
        newMessage.classList.add('list-group-item', 'first');

        let nameDiv = document.createElement('div');
        nameDiv.classList.add('nameAndTimeDiv')
        let avatarSpan = document.createElement('span');
        avatarSpan.classList.add('avatar');
        nameDiv.appendChild(avatarSpan);

        let nameSpan = document.createElement('span');
        nameSpan.classList.add('chatName', 'h5');
        let nameText = document.createTextNode(username);
        nameSpan.appendChild(nameText);
        nameDiv.appendChild(nameSpan);

        let timeSpan = document.createElement('span');
        timeSpan.classList.add('time', 'text-muted');
        let timeText = document.createTextNode(' ' + getTime());
        timeSpan.appendChild(timeText);
        nameDiv.appendChild(timeSpan);

        let messageDiv = document.createElement('div');
        messageDiv.classList.add('messageDiv');
        let messageSpan = document.createElement('span');
        messageSpan.classList.add('chatBubble');
        messageSpan.classList.add('h6');
        let messageText = document.createTextNode(msg);
        messageSpan.appendChild(messageText);
        messageDiv.appendChild(messageSpan);

        newMessage.appendChild(nameDiv);
        newMessage.appendChild(messageDiv);

        messages.appendChild(newMessage);
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
        lastSentMultiple = false;
    }    

    if (lastToMessage == username) {
        let newMessage = document.createElement('li');
        newMessage.classList.add('list-group-item', 'second');

        let messageDiv = document.createElement('div');
        messageDiv.classList.add('messageDiv');
        let messageSpan = document.createElement('span');
        messageSpan.classList.add('chatBubbleSecond', 'h6');
        let messageText = document.createTextNode(msg);
        messageSpan.appendChild(messageText);
        messageDiv.appendChild(messageSpan);

        newMessage.appendChild(messageDiv);
        messages.appendChild(newMessage);

        lastSentMultiple = true;

        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    }
    lastToMessage = username;
}

function addSystemMessage(msg) {
        if (lastToMessage !== 'system' && lastSentMultiple == true) {
            messages.lastChild.classList.remove('second');
            messages.lastChild.classList.add('last');
            lastSentMultiple = false;
        }
        if (lastToMessage !== 'system' && lastSentMultiple == false) {
            if (lastToMessage !== '') {
            messages.lastChild.classList.remove('first');
            messages.lastChild.classList.add('soloMessage');
            }
        }
        const newMessage = document.createElement('li');
        newMessage.classList.add('list-group-item', 'h6', 'text-muted');
        const messageText = document.createTextNode(msg);
        newMessage.appendChild(messageText);
        messages.appendChild(newMessage);
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    lastToMessage = 'system';
}

usernameForm.onsubmit = (e) => {
    e.preventDefault();
    let unavailibleNames = ["system"];

    username = document.getElementById('usernameInput').value;

    if (users) {
        for (i = 0; i < users.length; i++) {
            unavailibleNames.push(users[i][0]);
        }
        if (unavailibleNames.includes(username)) {
            addSystemMessage('The username ' + username + ' is already being used.');
            addSystemMessage('Pick another one.');
            usernameInput.value = '';
        }
    }

    if (username != '' && unavailibleNames.includes(username) == false) {
        loggedIn = true;
        messagingChat = true;
        userID = socket.id;
        socket.emit('join chat', username, userID);
        addUsername(username, userID);
        addSystemMessage('You have joined the chat.');
        usernameForm.style.display = 'none';
        messageForm.style.display = 'block';
        messageInput.focus();
    }
}

messageForm.onsubmit = (e) => {
    typing = false;
    socket.emit('done typing', username);
    e.preventDefault();
    message = messageInput.value;
    if (message != '') {
        socket.emit('user sent message', username, message);
        addChatMessage(username, message);
        messageInput.value = '';
    }
    lastToMessage = username;
}

privateMessageForm.onsubmit = (e) => {
    e.preventDefault();
    let privateMessage = privateMessageInput.value;
    if (privateMessage != '') {
        socket.emit('private message', username, privateMessage, privateMessageUserID);
        addSystemMessage('Private message to ' + privateMessageUsername + ' : ' + privateMessage);
        privateMessageInput.value = '';
        privateMessageInput.focus();
    }
}

socket.on('connect', () => {
    userID = socket.id;
    socket.emit('hello?', userID);
});

socket.on('update users', (onlineUsers) => {
    console.log(onlineUsers);
    users = onlineUsers;

    clearUsernames();

    for (i = 0; i < onlineUsers.length; i++) {
        addUsername(onlineUsers[i][0], onlineUsers[i][1]);
    }

    if (onlineUsers.length == 1 && onlineUsers[0][0] == username ||
        !onlineUsers[0]) {
        addSystemMessage('There is nobody else here.');
    }
});

socket.on('users typing', (usernames) => {
    if (usernames.includes(username)) {
        let filteredUsers = usernames.filter((value) => {
            return value !== username;
        });
        usersTyping(filteredUsers);
    } else {
        usersTyping(usernames);
    }
});

socket.on('incoming message', (username, msg) => {
    addChatMessage(username, msg);
});

socket.on('system message', (msg) => {
    addSystemMessage(msg);
});