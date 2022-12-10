import io from 'socket.io-client'
import { chatapi } from "@/config/config";
import { getStore } from "@/util/service";

const socket = io.connect(chatapi, {transports: ['websocket', 'polling']});
let sendMsgData = {
    userAddress: getStore("token"),
};

socket.on("reconnect", async() => {
    setTimeout(() => {
        socket.emit("join", sendMsgData); //断线重连
    }, 100);
})

setTimeout(() => {
    socket.emit("join", sendMsgData); //加入
    if (socket.connected) {
        uni.showToast({ 
            icon: "none",
            title: 'WS已连接',
        });
    }
}, 100);
module.exports = socket;