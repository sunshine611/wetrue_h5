<template>
    <view class="index">
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
        <view 
            class="chat-content" 
            v-for="(item, index) in serverMsg"
            :key="index"
        >
            <view class="messages">
                <div class="auth-sign" v-if="item.isAuth">
                    <fa-FontAwesome
                        type="fas fa-user-secret"
                        size="28"
                        color="#2979FF"
                    >
                    </fa-FontAwesome>
                </div>
                
                <text :class="['name', item.isAuth ? 'auth' : '']">
                    {{
                        item.nickname 
                        ? item.nickname 
                        : item.defaultAens 
                        ? item.defaultAens 
                        : 'ak_' + item.userAddress.slice(-4) 
                    }}
                </text>
                <text class="">:</text>
                <text class="userid">{{ item.msg }}</text>
            </view><br>
        </view>
        <u-gap height="80"></u-gap>

        <view class="safe-area-inset-bottom" style="display:inline-block">
            <view class="comment">
                <view class="comment-info">
                    <view class="comment-input">
                        <textarea class="comment-content" v-model="content" placeholder="write a message..." maxlength="500" />
                    </view>
                    <view class="comment-submit">
                        <u-button size="mini" @click.stop="submitMsg" :loading="btnLoading" type="primary">Send</u-button>
                    </view>
                </view>
            </view>
        </view>
        
    </view>
</template>

<script>
import socket from '@/util/socketio.js';
import { getStore } from "@/util/service";
import store from "@/store";
import { Crypto } from '@aeternity/aepp-sdk';

export default {
    components: {},
    data() {
        return {
            btnLoading: false,
            online: "0/0",
            content: '',
            chat: [],
            serverMsg: [],
            sendServerData: [],
        };
    },
    //下拉刷新
    onPullDownRefresh() {
    },
    onLoad() {
        this.getSystemStatusBarHeight(); //状态栏高度
    },
    mounted() {
        this.sendServerData = {
            address: getStore("token"),
        };
        socket.emit("joinRoomChat", this.sendServerData); //加入聊天室

        //监听加入
        socket.on('joinRoomChat', (onlineNumber)=> {
            this.online = `${onlineNumber.online}/${onlineNumber.total}`;
        });
        //监听消息
        socket.on('message', (data)=> {
            this.serverMsg.push(data);
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
        //国际化
        i18n: {
            get() {
                return this.$_i18n.messages[this.$_i18n.locale];
            },
        },
    },
    methods: {
        //发送消息
        async submitMsg() {
            if (!this.content) {
                this.uShowToast(this.i18n.components.enterContent);
                return false;
            }

            try{
                //对消息签名
                const secretKey = await this.keystoreToSecretKey(store.state.user.password);
                const secretKeyHex = Buffer.from(secretKey, 'hex');
                const sign_array = Crypto.sign(Buffer.from(this.content), secretKeyHex);
                const sign_hex = this.uint8ArrayToHex(sign_array);

                this.sendServerData.sign = sign_hex;
                this.sendServerData.msg = this.content;
                socket.emit("message", this.sendServerData); //将消息发送给服务器
                this.content = "";
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
    },
};
</script>

<style lang="scss" scoped>
.messages {
    position: absolute;
    padding: 5px 10px;
}

.name {
    display: inline-block;
    color: #4e4e4e;
    font-size: 26rpx;
    &.auth {
        color: #2979ff;
        font-weight: bold;
    }
}

.auth-sign {
    display: inline-block;
}

.userid {
    margin-left: 5rpx;
    color: #0f0f0f;
}

.comment {
    z-index: 999;
    position: fixed;
    bottom: 0;
    width: 100%;
    max-width: 720px;
    background-color: white;
    padding: 20upx;
    border-top: 1px solid rgb(243, 234, 229);
    font-size: 28rpx;
}

.comment-info {
    display: flex;
    justify-content: space-between;
}

.comment-input {
    width: 96%;
    max-height: 280rpx;

    .comment-content {
        width: 96%;
        max-height: 180rpx;
        box-sizing: border-box;
        background-color: rgba(232, 232, 232, 0.57);
        font-size: 28rpx;
        padding: 20upx;
        border-radius: 20rpx;
    }
}

.comment-submit {
    width: 10%;
    color: #f04a82;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>