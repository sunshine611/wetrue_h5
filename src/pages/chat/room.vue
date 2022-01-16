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
			<scroll-view id="scrollview"   scroll-y="true" :style="{height:style.contentViewHeight+'px'}" :scroll-with-animation="true"
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
import messageShow from '@/components/chat/messageshow';
import { mapGetters } from "vuex";
import socket from '@/util/socketio.js';
import store from "@/store";
import { Crypto } from '@aeternity/aepp-sdk';

export default {
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
	components: {
		chatInput,
		messageShow
	},
	created: function () { 
		const res = uni.getSystemInfoSync();
		this.style.pageHeight = res.windowHeight;
		this.style.contentViewHeight = res.windowHeight - uni.getSystemInfoSync().screenWidth / 750 * (100); //像素
	},
	mounted() {
		this.sendMsgData = {
			userAddress: this.token,
		};
		socket.emit("joinRoomChat", this.sendMsgData); //加入聊天室

		//监听加入
		socket.on('joinRoomChat', (onlineNumber)=> {
			this.online = `${onlineNumber.online}/${onlineNumber.total}`;
		});
		//监听消息
		socket.on('message', (data)=> {
			this.addMessage(data);
		});
		//监听系统消息
		socket.on('serverMessage', (data)=> {
			this.serverMsg.push(data);
		});
		//监听错误
		socket.on('error', (msg)=> {
			this.uShowToast(msg);
		});
		//监听关闭
		socket.on('close', (onlineNumber)=> {
			this.online = `${onlineNumber.online}/${onlineNumber.total}`;
		});

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
        getInputMessage: async function (message) { //获取子组件的输入数据
            if (!message.content) {
                this.uShowToast(this.i18n.components.enterContent);
                return false;
            }
            try{
                //对消息签名
                const secretKey = await this.keystoreToSecretKey(store.state.user.password);
                const secretKeyHex = Buffer.from(secretKey, 'hex');
                const signArray = Crypto.signMessage(message.content, secretKeyHex);
                const signHex = this.uint8ArrayToHex(signArray);

                this.sendMsgData.sign = signHex;
                this.sendMsgData.msg = message.content;
                socket.emit("message", this.sendMsgData); //将消息发送给服务器
            }  catch (error) {
                this.uShowToast("消息签名错误");
                return;
            }
		},
        // Uint8Array 转 HexString
        uint8ArrayToHex(arr) {
            return Array.from(
                arr, i => i.toString(16).padStart(2, "0")
            ).join("");
        },
		addMessage: function (msgData) {
			var that = this;
			that.messages.push({
				userType: msgData.userAddress == this.token ? 'customer' : 'home',
				nickname: msgData.nickname,//msgData.nickname,
				defaultAens: msgData.defaultAens,
				userAddress: msgData.userAddress,
				msgUtcTime: msgData.msgUtcTime,
				msg: msgData.msg,
			});
			this.scrollToBottom();
		},
		scrollToBottom: function () {
			var that = this;
			var query = uni.createSelectorQuery();
			query.selectAll('.m-item').boundingClientRect();
			query.select('#scrollview').boundingClientRect();

			query.exec(function (res) {
				that.style.mitemHeight = 0;
				res[0].forEach(function (rect) {
					// console.info(rect.height);
					that.style.mitemHeight = that.style.mitemHeight + rect.height + 20;
				});

				if (that.style.mitemHeight > that.style.contentViewHeight) {
					that.scrollTop = that.style.mitemHeight - that.style.contentViewHeight;
				}
			});
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
