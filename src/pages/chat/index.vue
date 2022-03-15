<template>
    <view class="index">
        <u-status-bar></u-status-bar>
        <u-tabs
            class="nav-tab"
            :list="tabList"
            @click="tabChange"
        ></u-tabs>
        <view>
            <u-button
                type="primary"
                shape="circle"
                size="mini"
                class="panel"
                @click="goChatRoom"
            >
            登陆聊天室
            </u-button>
        </view>
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
        //国际化
        i18n: {
            get() {
                return this.$_i18n.messages[this.$_i18n.locale];
            },
        },
    },
    onLoad() {
        this.uSetBarTitle(this.i18n.titleBar.chat);
        this.tabList = [{name: "聊天室"}];
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
            if (!this.userInfo.isMapping) {
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
    position: fixed;
    left:43%;
    top:40%;
    width: 20%;
    height: 60rpx;
    justify-content: center;
}
</style>