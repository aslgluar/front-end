const _ = require('lodash');
const uuid = require('uuid');
const express = require('express');
const socketIO = require("socket.io");
const randomColor = require('randomcolor');

const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile(`${__dirname}/public/index.html`));

const server = app.listen(process.env.PORT || 5000);
const io = socketIO(server);

const getAvatar = (username, color) => {
    return `https://ui-avatars.com/api/?name=${username}&background=${color.replace('#', '')}&color=fff`;
};

let users = [];
let connnections = [];

io.on('connection', (socket) => {
    connnections.push(socket)

    const id = uuid.v4();
    const color = randomColor();
    const username = `Anonymous ${_.uniqueId()}`;
    const avatar = getAvatar(username, color);
    const user = { id, username, color, avatar };

    users.push(user);

    socket.id = user.id;
    socket.user = user;

    io.sockets.emit('userlist_updated', users);

    socket.on('change_username', data => {
        const user = _.first(_.filter(users, {id: socket.id }));
        user.username = data.username;
        user.avatar = getAvatar(data.username, user.color);

        socket.emit('joined', user);
        socket.user = user;

        io.sockets.emit('userlist_updated', users);
    });

    socket.on('new_message', (data) => {
        io.sockets.emit('new_message', {
            message: data.message,
            user: socket.user,
        });
    });

    socket.on('typing', () => io.sockets.emit('typing', socket.user));

    socket.on('disconnect', () => {
        if (!socket.user) {
            return;
        }

        users = users.filter(user => user.id !== socket.user.id);

        io.sockets.emit('userlist_updated', users);

        connnections.splice(connnections.indexOf(socket), 1);
    });
});