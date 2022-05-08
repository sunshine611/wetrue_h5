<template>
    <view class="post" v-if="validToken()">
        <fa-FontAwesome
            type="fas fa-plus"
            size="36"
            color="rgba(255,255,255,0.9)"
            @tap="post()"
        >
        </fa-FontAwesome>
    </view>
</template>
<script>

export default {
    components: {
    },
    props: {
        postButtonInfo: {
            type: Object,
            default: () => {
                return {}
            },
        },
    },
    data() {
        return {
        };
    },
    watch: {
    },
    methods: {
        //发帖
        post() {
            //WeTrue登陆发帖
            if (this.postButtonInfo.type === 'topic') {
                this.goUrl(
                    "editor?topic=" + this.postButtonInfo.keyword
                );
            } else if (this.postButtonInfo.type === 'shtip') {
                this.goUrl(
                    "editor?shtip=true"
                );
            } else {
                this.goUrl('editor');
            }
        },
    },
};
</script>
<style lang="scss" scoped>
.post {
        position: fixed;
        z-index: 1000;
        right: 60rpx;
        bottom: 200rpx;
        background: rgba(#f04a82, 0.75);
        box-shadow: 0rpx 0rpx 20rpx 5rpx rgba(#f04a82, 0.3);
        width: 80rpx;
        height: 80rpx;
        line-height: 80rpx;
        border-radius: 40rpx;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
