<template>
	<view class="uni-seleton">
		<view class="back-btn iconfont iconarrow_btn_left" @click="navBack">
			<text class="nav-title">WeTrue</text>
            
		</view>
        <web-view class="webview" :src= diceUrl ></web-view>
	</view>
</template>

<script>
import { mapGetters } from "vuex";
import store from "@/store";
import { diceUrl } from "@/config/config.js";

export default {
    data() {
        return {
            diceUrl: diceUrl+"/#/?"+ Date.parse(new Date()), //dice
        }
    },
    onLoad() {
        this.isPassword();
    },
    mounted() {
        window.onmessage = (event) => this.receiveMessage(event)
    },
    computed: {
        ...mapGetters(["token"]),
    },
    methods: {
        // 返回上一页
        navBack() {
            this.reLaunchUrl('../my/index')
        },
        // 调用 webview 内部逻辑
        async receiveMessage(event) {
            console.log("主页接收:" + event.data)
            let data = JSON.parse(event.data)
            let postPayload;
            if (data.type == "diceGame") {
                if (data.event == "bet") {
                    postPayload = await this.callDiceContract(data.payload, event);
                }
                if (data.event == "allowance") {
                    postPayload = await this.createAllowance(data.payload, event);
                }
            }

            if (data.type == "User" && data.event == "Token") {
                let content = {
                    token: this.token,
                    nodeUrl: store.state.user.nodeUrl
                }
                postPayload = {
                    code: 200,
                    type: "User",
                    event: "Token",
                    payload: content,
                }
            }
            event.source.postMessage(JSON.stringify(postPayload), "*");
        }
    }
}
</script>

<style lang="scss" scoped>
	.back-btn {
		width: 100%;
		position: absolute;
		z-index: 99;
		padding-top: var(--status-bar-height);
		padding-left: 40rpx;
		padding-right: 40rpx;
		top: 5upx;
		font-size: 40rpx;
		color: #00ff51;
		display: flex;
		align-items: center;
		.nav-title {
			width: 100%;
			text-align: center;
		}
	}
</style>
