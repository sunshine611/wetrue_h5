import io from 'socket.io-client'
import { chatapi } from "@/config/config";
import { getStore } from "@/util/service";

const socket = io.connect(chatapi, {transports: ['websocket', 'polling']});
let sendMsgData = {
    userAddress: getStore("token"),
};

setTimeout(() => {
    socket.emit("roomJoin", sendMsgData); //加入聊天室
    if (socket.connected) {
        uni.showToast({ 
            icon: "none",
            title: '已连接',
        });
    }
}, 100);
module.exports = socket;