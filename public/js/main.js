const socket = io();
const chatForm = document.querySelector('#chat-form');
const chat_messages = document.querySelector('.chat-messages');
const room_name = document.querySelector('#room-name');
const usersList = document.querySelector('#users');


//Get username and room from URL
const querystring = window.location.search;
const params = new URLSearchParams(querystring);
const username = params.get('username');
const room = params.get('room');
console.log(username, room);


//Join chatroom
socket.emit('joinRoom', {username, room});


//Message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    //Scroll down
    chat_messages.scrollTop = chat_messages.scrollHeight;
});


//Room info
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
});


//Message Submit
chatForm.addEventListener('submit', event => {
    event.preventDefault();

    const msg = event.target.elements.mesg.value;
    
    //Emit Chat Message
    socket.emit('chat-message', msg);

    //Clear Messages
    event.target.elements.mesg.value = '';
});


//Output Message to DOM
const outputMessage = msg => {
    const div = document.createElement('div');

    div.className = 'message';
    div.innerHTML = `
        <p class="meta">${msg.username} <span>${msg.time}</span></p>
        <p class="text">
            ${msg.body}
        </p>
    `;

    chat_messages.appendChild(div);
};


//Adding Room Name to DOM
const outputRoomName = room => {
    room_name.innerText = room;  
};


//Adding Room Users to DOM
const outputUsers = users => {
    usersList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
};