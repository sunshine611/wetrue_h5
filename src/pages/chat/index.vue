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

<script>
import { mapGetters } from "vuex";

export default {
    components: {},
    data() {
        return {
            current: 0, //当前tab索引
            userInfo: {}, //用户信息
        };
    },
    //下拉刷新
    onPullDownRefresh() {
        this.getUserInfo();
        setTimeout(function() {
            uni.stopPullDownRefresh();
        }, 500);
    },
     computed: {
         ...mapGetters(["token"]),
    },
    onLoad() {
        this.getSystemStatusBarHeight(); //状态栏高度
        this.uSetBarTitle(this.$t('titleBar.chatRoom'));
        this.tabList = [{ name: this.$t('titleBar.chatRoom') }];
        this.getUserInfo();
    },
    methods: {
        //获取用户信息
        getUserInfo() {
            let params = {
                userAddress: this.token,
            };
            this.$http
                .post("/User/info", params, { custom: { isToast: true } })
                .then((res) => {
                    if (res.code === 200) {
                        this.userInfo = res.data;
                    }
                });
        },
        goChatRoom() {
            //this.getUserInfo();
            if (!this.userInfo.isVip) {
                this.uShowToast("你没有权限进入");
                return;
            }
            this.goUrl('/pages/chat/room');
        },
    },
};
</script>

<style lang="scss" scoped>
.panel {
    position: absolute;
    left:40%;
    top:40%;
}
</style>