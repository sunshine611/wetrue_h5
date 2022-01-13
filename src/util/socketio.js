import io from 'socket.io-client'
let socket = io.connect('/', {transports: ['websocket']});
module.exports = socket;