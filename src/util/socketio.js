import io from 'socket.io-client'
let socket = io.connect('/', {transports: ['websocket']});
socket.emit("join", 'WeTrue')
module.exports = socket;