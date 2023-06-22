<script setup>
import { ref, getCurrentInstance } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { diceUrl } from "@/config/config.js";
import { useUserStore } from "@/stores/userStore";
const userStore = useUserStore();
const { proxy } = getCurrentInstance();

const newDiceUrl = ref(diceUrl+"/#/?"+ Date.parse(new Date())) 

onLoad ( () => {
    proxy.isPassword();
});

window.onmessage = (event) => receiveMessage(event)

// 返回上一页
const navBack = () => {
    proxy.reLaunchUrl('../my/index')
}
// 调用 webview 内部逻辑
const receiveMessage = async(event) => {
    console.log("主页接收:" + event.data)
    let data = JSON.parse(event.data)
    let postPayload;
    if (data.type == "diceGame") {
        if (data.event == "bet") {
            postPayload = await proxy.callDiceContract(data.payload, event);
        }
        if (data.event == "allowance") {
            postPayload = await proxy.createAllowance(data.payload, event);
        }
    }

    if (data.type == "User" && data.event == "Token") {
        let content = {
            token: userStore.token,
            nodeUrl: userStore.nodeUrl
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
</script>

<template>
	<view class="uni-seleton">
		<view class="back-btn iconfont iconarrow_btn_left" @click="navBack">
			<text class="nav-title">WeTrue</text>
            
		</view>
        <web-view class="webview" :src= newDiceUrl ></web-view>
	</view>
</template>

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
