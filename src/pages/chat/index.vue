<template>
    <view class="index">
        <view :style="`padding-top:${statusBarHeight}px`"></view>
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
            @click="goUrl('/pages/chat/room')"
        >
        登陆聊天室
        </u-button>
    </view>
</template>

<script>

export default {
    components: {},
    data() {
        return {
            current: 0, //当前tab索引
        };
    },
    //下拉刷新
    onPullDownRefresh() {
    },
    onLoad() {
        this.getSystemStatusBarHeight(); //状态栏高度
        this.tabList = [{name: "聊天室"}];
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
        //切换顶部tab事件
        tabChange(index) {
            this.current = index;
        },
    },
};
</script>

<style lang="scss" scoped>
.panel {
    position: absolute;
    left:43%;
    top:40%;
}
</style>