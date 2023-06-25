
<script setup>
import { ref, getCurrentInstance } from 'vue';
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { useUserStore } from "@/stores/userStore";
const userStore = useUserStore();
const { proxy } = getCurrentInstance();

const current= ref(0) //当前tab索引

onLoad ( () => {
    proxy.getSystemStatusBarHeight(); //状态栏高度
    proxy.uSetBarTitle(proxy.$t('titleBar.chatRoom'));
});

//下拉刷新
onPullDownRefresh ( () => {
    setTimeout(function() {
        uni.stopPullDownRefresh();
    }, 500);
})

const tabList = [{ name: proxy.$t('titleBar.chatRoom') }];

const goChatRoom = () => {
    if (!userStore.userInfo?.isVip) {
        proxy.uShowToast("你没有权限进入");
        return;
    }
    proxy.goUrl('/pages/chat/room');
}
</script>

<template>
    <view class="index">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-tabs
            :list="tabList"
            :is-scroll="false"
            :current="current"
            @change="tabChange"
            active-color="#f04a82"
            style="border-bottom:1px solid #e4e7ed"
        ></u-tabs>
        <u-button
            type="primary"
            shape="circle"
            size="mini"
            class="panel"
            @click="goChatRoom"
        >
        {{ $t('chat.loginChatRoom')}}
        </u-button>
        <u-gap height="1280"></u-gap>
    </view>
</template>

<style lang="scss" scoped>
.panel {
    position: absolute;
    left:40%;
    top:40%;
}
</style>