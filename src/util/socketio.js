import io from 'socket.io-client'
import { chatapi } from "@/config/config";

const socket = io.connect(chatapi, {transports: ['websocket']});
module.exports = socket;