const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//Recoje el usuario y sala del URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
  });

//Variables
const socket = io();

//Unirse a sala
socket.emit('joinRoom', { username, room});

//Get la sala y los usuarios
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
});

//Mensaje del servidor
socket.on('message', message =>{
    console.log(message);
    outputMessage(message);

    //Deslice para abajo cada vez que se manda un mensaje
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Mensaje enviado
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //Recive el texto del mensaje
    const msg = e.target.elements.msg.value;

    //Enviando mensaje al servidor
    socket.emit('chatMessage',msg);

    //limpea el mensaje enviado (input)
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

//Eviar el mensaje al DOM
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//Agregar el nombre de la sala al DOM
function outputRoomName(room){
    roomName.innerText = room;
}

//Agregar la lista de los usuario al DOM
function outputUsers(users){
    userList.innerHTML = `
    ${users.map(user => `<li> ${user.username}<li>`).join('')}`;
}