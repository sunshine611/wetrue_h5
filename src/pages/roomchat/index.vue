<template>
    <view class="index">
        <view :style="`padding-top:${statusBarHeight}px`"></view>
        <u-tabs
            :list="['聊天室']"
            :is-scroll="false"
            :current="current"
            @change="tabChange"
            active-color="#f04a82"
            style="border-bottom:1px solid #e4e7ed"
        ></u-tabs>
    </view>
</template>

<script>
import socket from '@/util/socketio.js';

export default {
    components: {
    },
    data() {
        return {
            current: 0, //当前tab索引
            msg:[],
        };
    },
    //下拉刷新
    onPullDownRefresh() {
    },
    onLoad() {
        this.getSystemStatusBarHeight(); //状态栏高度
    },
    mounted() {
        /*
        socket.on('join', (msg)=> {
            console.log(msg);
            this.msg = msg;
        });

        socket.on('message', (msg)=> {
            console.log(msg);
            this.msg = msg;
        });
        */
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

</style>