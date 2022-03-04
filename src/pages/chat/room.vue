<template>
	<view class="uni-column">
		<view :style="`padding-top:${statusBarHeight}px`"></view>
        <u-navbar :is-fixed="false" :back-text="online" title="Chat Room">
            <div slot="right">
                <u-icon
                    name="home"
                    class="mr-30"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('index')"
                ></u-icon>
            </div>
        </u-navbar>
		<view class="content" id="content" :style="{height:style.contentViewHeight+'px'}">
			<scroll-view id="scrollview" scroll-y="true" :style="{height:style.contentViewHeight+'px'}" :scroll-with-animation="true"
			    :scroll-top="scrollTop">
				<message-show v-for="(message,index) in messages" :key="index" v-bind:message="message" :id="index"></message-show>
				<view id="bottom"></view>
			</scroll-view>
		</view>
		<view class="foot">
			<chat-input @send-message="getInputMessage" ></chat-input>
		</view>
	</view>
</template>
<script>
import chatInput from '@/components/chat/chatinput';
import messageShow from '@/components/chat/roomMessageShow';
import { mapGetters } from "vuex";
import socket from '@/util/socketio.js';
import { chatRommKeyIv } from "@/config/config";
import CryptoJS from 'crypto-js';


export default {
	components: {
		chatInput,
		messageShow
	},
	data() {
		return {
			style: {
				pageHeight: 0,
				contentViewHeight: 0,
				footViewHeight: 90,
				mitemHeight: 0,
			},
			scrollTop: 0,
			messages: [],
			btnLoading: false,
			online: "0/0",
			chat: [],
			serverMsg: [],
			sendMsgData: [],
		}
	},
	//下拉刷新
    onPullDownRefresh() {
    },
    onLoad() {
        this.getSystemStatusBarHeight(); //状态栏高度
		this.isPassword();
    },
	onReady() {
		//监听加入
		socket.on('roomJoin', (onlineNumber) => 
			this.online = `${onlineNumber.join}/${onlineNumber.online}/${onlineNumber.total}`
		)
		//监听消息
		socket.on('roomMessage', (res) => this.addMessage(res))
		//监听系统消息
		socket.on('serverMessage', (data)=> this.serverMsg.push(data))
		//监听错误
		socket.on('error', (msg) => this.uShowToast(msg))
		//监听关闭
		socket.on('close', (onlineNumber) => 
			this.online = `${onlineNumber.join}/${onlineNumber.online}/${onlineNumber.total}`
		)
		//监听断线
		socket.on('disconnect', ()=> this.uShowToast('连接断开'))
	}
	created: function () { 
		const res = uni.getSystemInfoSync();
		this.style.pageHeight = res.windowHeight;
		this.style.contentViewHeight = res.windowHeight - uni.getSystemInfoSync().screenWidth / 750 * (100); //像素
	},
	mounted() {
		this.sendMsgData = {
			userAddress: this.token,
		};
		socket.emit("roomJoin", this.sendMsgData); //加入聊天室
	},
	computed: {
        ...mapGetters(["token"]),
        //国际化
        i18n: {
            get() {
                return this.$_i18n.messages[this.$_i18n.locale];
            },
        },
    },
	methods: {
		//发送消息
        async getInputMessage(sendMsg) { //获取子组件的输入数据
            if (!this.sendMsgData.userAddress) {
                this.uShowToast('账户获取失败')
                return false
            }
            try{
				this.sendMsgData.msgContent = sendMsg.msgContent
                this.sendMsgData.msgSign = await this.signMessage(sendMsg.msgContent); //对消息签名
				let enSendMsgData = this.aesEncrypt(JSON.stringify(this.sendMsgData)) //加密消息内容
                socket.emit("roomMessage", enSendMsgData)
            }  catch (error) {
                this.uShowToast("消息签名错误")
            }
		},
		addMessage(enMsgLists) {
			let msgLists = this.aesDecrypt(enMsgLists)
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
				this.messages.push(aMsg)
			}
			setTimeout(() => {
				this.scrollToBottom()
			}, 150);
		},
		scrollToBottom() {
			const that = this;
			let query = uni.createSelectorQuery();
			query.selectAll('.m-item').boundingClientRect();
			query.select('#scrollview').boundingClientRect();

			query.exec(function (res) {
				that.style.mitemHeight = 0;
				res[0].forEach(function (rect) {
					that.style.mitemHeight = that.style.mitemHeight + rect.height + 40;
				});
				if (that.style.mitemHeight > that.style.contentViewHeight) {
					that.scrollTop = that.style.mitemHeight - that.style.contentViewHeight;
				}
			});
		},
		 //AES加密
		aesEncrypt(text, key, iv) {
			if (!key) key = chatRommKeyIv.key;
			if (!iv) iv = chatRommKeyIv.iv;
			let srcs = CryptoJS.enc.Utf8.parse(text);
			let encrypted = CryptoJS.AES.encrypt(srcs, CryptoJS.enc.Utf8.parse(key), {
				iv: CryptoJS.enc.Utf8.parse(iv),
				mode: CryptoJS.mode.CBC,
				padding: CryptoJS.pad.Pkcs7
			});
			return encrypted.ciphertext.toString().toUpperCase();
		},
		//AES解密
		aesDecrypt(text, key, iv) {
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
	}
}
</script>
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
