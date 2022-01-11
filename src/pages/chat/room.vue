<template>
    <view class="index">
        <view :style="`padding-top:${statusBarHeight}px`"></view>
        <u-navbar :is-fixed="false" title="Chat Room">
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
            <view class="messages" >
                <view v-text="item"></view>
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

export default {
    components: {},
    data() {
        return {
            btnLoading: false,
            content: '',
            chat:[],
            serverMsg:[],
        };
    },
    //下拉刷新
    onPullDownRefresh() {
    },
    onLoad() {
        this.getSystemStatusBarHeight(); //状态栏高度
    },
    mounted() {
        socket.on('join', (msg)=> {
            this.serverMsg.push(msg);
        });

        socket.on('message', (msg)=> {
            this.serverMsg.push(msg);
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
        submitMsg() {
				if (!this.content) {
					this.uShowToast(this.i18n.components.enterContent);
					return false;
				}
				//this.btnLoading = true;
                socket.emit("message", this.content); //将消息发送给服务器
                this.content = "";
			},
    },
};
</script>

<style lang="scss" scoped>
.messages {
    position: absolute;
    list-style-type: none;
    padding: 5px 10px;
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