import io from 'socket.io-client'
import { chatapi } from "@/config/config";

const socket = io.connect(chatapi, {transports: ['websocket', 'polling']});
setTimeout(() => {
    if (socket.connected) {
        uni.showToast({ 
            icon: "none",
            title: '已连接',
        });
    }
}, 100);
module.exports = socket;