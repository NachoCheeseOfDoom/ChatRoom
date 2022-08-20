//Paquetes
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser,
        userLeave, getRoomUsers} = require('./utils/users');


//variables
const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Carpeta estatica
app.use(express.static(path.join(__dirname, 'public')));

//Nombre del bot o admin
const botName = 'Admin ';

//Corre cuando el cliente se conecta
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);
    //Mensaje de bienvenida
    socket.emit(
        'message', formatMessage(botName,`${user.username}. Bienvenido a la sala de: ${user.room}`));

    //Cuando alguien se conecta
    socket.broadcast
    .to(user.room)
    .emit(
        'message',
        formatMessage(botName, `${user.username} se unió a la sala`)
        );

        //Evia informacion de las salas y usuarios
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //Recibe el mensaje enviado
    socket.on('chatMessage', msg =>{
        const user = getCurrentUser(socket.id);


    io.to(user.room).emit('message',  formatMessage(user.username , msg));
    });

    //Cuando alguien se desconecta
    socket.on('disconnect', () =>{
        const user = userLeave(socket.id);

        if(user){
        io.to(user.room).emit(
        'message',
        formatMessage(botName,`${user.username} se desconectó`));
        
        //Envia info de los usuario y sala
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    }
    });
});

//Se usar el etorno de PORT como puerto si no lo encuentra se utiliza 3000
const PORT = process.env.PORT || 3200;

server.listen(PORT, () => console.log( `Servidor corriendo en puerto ${PORT}`));

