const usernamePage = document.querySelector('#username-page');
const chatPage = document.querySelector('#chat-page');
const messageInput = document.querySelector('#message');
const usernameForm = document.querySelector('#usernameForm');
const messageForm = document.querySelector('#messageForm');
const messageArea = document.querySelector('#messageArea');
const connectingElement = document.querySelector('.connecting');

// WebSocket client
let client = null;
let username = null;

function connect(event) {
    // Getting name from form
    username = document.querySelector('#name').value.trim();

    // Hiding the registration form and showing the chat form
    if (username) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        let webSocket = new SockJS('/ws');
        client = Stomp.over(webSocket);

        client.connect({}, onConnected, onError);
    }

    // Disable event
    event.preventDefault();
}

function onConnected() {
    // Subscribe to the WebSocket
    client.subscribe('/status/activity', receiver);

    // Send your username to the server
    client.send("/app/chat.addUser", {}, JSON.stringify({sender: username, type: 'JOIN'}));

    // Disable the connection label
    connectingElement.classList.add('hidden');
}

// Create a label if a connection to a WebSocket server is not available
function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
    console.log(error);
}

function sendMessage(event) {
    let messageBody = messageInput.value.trim();

    if (messageBody && client) {
        let message = {
            sender: username,
            body: messageInput.value,
            type: 'CHAT'
        };

        client.send("/app/chat.sendMessage", {}, JSON.stringify(message));
        messageInput.value = '';
    }

    event.preventDefault();
}

function receiver(payload) {
    let response = JSON.parse(payload.body);
    let messageElement = document.createElement('li');

    // Checking type of package
    if (response.type === 'JOIN') {
        messageElement.classList.add('event-message');
        response.body = response.sender + ' joined!';

    } else if (response.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        response.body = response.sender + ' left!';

    } else {
        messageElement.classList.add('chat-message');

        let avatarElement = document.createElement('i');
        // Getting first letter of name
        let avatarText = document.createTextNode(response.sender[0]);

        // Setting avatar element
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getBackgroundColor(response.sender[0])

        messageElement.appendChild(avatarElement);

        // Add username to the message
        let usernameElement = document.createElement('span');
        let usernameText = document.createTextNode(response.sender);
        messageElement.appendChild(usernameElement);
        usernameElement.appendChild(usernameText);
    }

    // Add body to the message
    let textElement = document.createElement('p');
    textElement.appendChild(document.createTextNode(response.body));
    messageElement.appendChild(textElement);

    // Add message to the message area
    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

function getBackgroundColor(letter) {
    let code = letter.charCodeAt(0);

    return "rgb(" +
        getTrueColor(Math.abs(255 - (code * 23))) + "," +
        getTrueColor(255 / (code * 23 / 255)) + "," +
        getTrueColor(255 / code * 23) + ")";
}

function getTrueColor(color) {
    color = Math.floor(color);
    if (color <= 255 && color >= 0) {
        return color;
    }

    if (color > 255) {
        return 255;
    } else {
        return 0;
    }
}

usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendMessage, true)
