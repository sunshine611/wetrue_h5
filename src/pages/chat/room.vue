
<script setup>
import chatInput from '@/components/chat/chatinput';
import messageShow from '@/components/chat/roomMessageShow';
import socket from '@/util/socketio.js';
import { chatRommKeyIv } from "@/config/config";
import CryptoJS from 'crypto-js';
import { ref, reactive, getCurrentInstance } from 'vue'
import { onLoad, onReady } from '@dcloudio/uni-app';
import { useUserStore } from "@/stores/userStore";
const userStore = useUserStore();
const { proxy } = getCurrentInstance();

const scrollTop = ref(0);
const online = ref("0/0");
const messages = reactive([]);
const serverMsg = reactive([]);
const sendMsgData = reactive({ userAddress: userStore.token });

const style = reactive({
    pageHeight: 0,
	contentViewHeight: 0,
	footViewHeight: 90,
	mitemHeight: 0,
})

onLoad ( () => {
	proxy.getSystemStatusBarHeight(); //状态栏高度
    proxy.isPassword();
});

onReady ( () => {
	//监听加入
	socket.on('roomJoin', (onlineNumber) => 
		online.value = `${onlineNumber.join}/${onlineNumber.online}/${onlineNumber.total}`
	)
	//监听消息
	socket.on('roomMessage', (res) => addMessage(res))
	//监听系统消息
	socket.on('serverMessage', (data)=> serverMsg.push(data))
	//监听错误
	socket.on('error', (msg) => proxy.uShowToast(msg))
	//监听关闭
	socket.on('close', (onlineNumber) => 
		online.value = `${onlineNumber.join}/${onlineNumber.online}/${onlineNumber.total}`
	)
	//监听断线
	socket.on('disconnect', ()=> proxy.uShowToast('disconnect'))
});

const res = uni.getSystemInfoSync();
style.pageHeight = res.windowHeight;
style.contentViewHeight = res.windowHeight - uni.getSystemInfoSync().screenWidth / 750 * (100); //像素
socket.emit("roomJoin", sendMsgData); //加入聊天室

//发送消息
const getInputMessage = async (sendMsg) => { //获取子组件的输入数据
	if (!sendMsgData.userAddress) {
		proxy.uShowToast('账户获取失败')
		return false
	}
	try{
		sendMsgData.msgContent = sendMsg.msgContent
		sendMsgData.msgSign = await proxy.signMessage(sendMsg.msgContent); //对消息签名
		let enSendMsgData = aesEncrypt(JSON.stringify(sendMsgData)) //加密消息内容
		socket.emit("roomMessage", enSendMsgData)
	}  catch (error) {
		proxy.uShowToast("消息签名错误")
	}
}
const addMessage = (enMsgLists) => {
	let msgLists = aesDecrypt(enMsgLists)
	msgLists = JSON.parse(msgLists)
	for (let i = 0; i < msgLists.length; i++) {
		let aMsg = {
			userAddress: msgLists[i].userAddress,
			nickname: msgLists[i].nickname,
			isMap: msgLists[i].isMap,
			sex: msgLists[i].sex,
			isAuth: msgLists[i].isAuth,
			defaultAens: msgLists[i].defaultAens,
			msgContent: msgLists[i].msgContent,
			msgUtcTime: msgLists[i].msgUtcTime,
		}
		messages.push(aMsg)
	}
	setTimeout(() => {
		scrollToBottom()
	}, 150);
}
const scrollToBottom = () => {
	let query = uni.createSelectorQuery();
	query.selectAll('.m-item').boundingClientRect();
	query.select('#scrollview').boundingClientRect();

	query.exec(function (res) {
		style.mitemHeight = 0;
		res[0].forEach(function (rect) {
			style.mitemHeight = style.mitemHeight + rect.height + 40;
		});
		if (style.mitemHeight > style.contentViewHeight) {
			scrollTop.value = style.mitemHeight - style.contentViewHeight;
		}
	});
}
//AES加密
const aesEncrypt = (text, key, iv) => {
	if (!key) key = chatRommKeyIv.key;
	if (!iv) iv = chatRommKeyIv.iv;
	let srcs = CryptoJS.enc.Utf8.parse(text);
	let encrypted = CryptoJS.AES.encrypt(srcs, CryptoJS.enc.Utf8.parse(key), {
		iv: CryptoJS.enc.Utf8.parse(iv),
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	});
	return encrypted.ciphertext.toString().toUpperCase();
}
//AES解密
const aesDecrypt = (text, key, iv) => {
	if (!key) key = chatRommKeyIv.key
	if (!iv) iv = chatRommKeyIv.iv
	let encryptedHexStr = CryptoJS.enc.Hex.parse(text);
	let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
	let decrypt = CryptoJS.AES.decrypt(srcs, CryptoJS.enc.Utf8.parse(key), {
		iv: CryptoJS.enc.Utf8.parse(iv),
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	}).toString(CryptoJS.enc.Utf8);
	return decrypt.toString();
}
</script>

<template>
	<view class="uni-column">
		<view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-navbar :is-fixed="false" :back-text="online" title="Chat Room">
			<template v-slot:right>
                <u-icon
                    name="home"
                    class="mr-30"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('index')"
                ></u-icon>
            </template>
        </u-navbar>
		<view class="content" id="content" :style="{height:style.contentViewHeight+'px'}">
			<scroll-view id="scrollview" scroll-y="true" :style="{height:style.contentViewHeight+'px'}" :scroll-with-animation="true"
			    :scroll-top="scrollTop">
				<message-show v-for="(message,index) in messages" :key="index" v-bind:message="message" :id="index"></message-show>
				<view id="bottom"></view>
			</scroll-view>
		</view>
		<view class="foot safe-area-inset-bottom">
			<chat-input @send-message="getInputMessage" ></chat-input>
		</view>
	</view>
</template>

<style>
	.uni-column {
		display: flex;
		flex-direction: column;
	}
	.content {
		display: flex;
		flex: 1;
		margin-bottom: 100rpx;
	}
	.foot {
		position: fixed;
		width: 100%;
		height: 90rpx;
		min-height: 90rpx;
		left: 0rpx;
		bottom: 0rpx;
		overflow: hidden;
	}
</style>
