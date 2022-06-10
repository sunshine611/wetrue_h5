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

    },
    data() {
        return {
        };
    },
    watch: {
    },
    methods: {
        //认领
        post() {
            if (this.validThirdPartySource()) {
                this.uShowToast(
                    this.$t('index.thirdPartyNotOpen'),
                );
                return false;
            };
            this.uShowToast('开发中');
        },
    },
};
</script>
<style lang="scss" scoped>
.post {
        position: fixed;
        z-index: 1000;
        right: 60rpx;
        bottom: 150rpx;
        background: rgba($u-type-aeternity, 0.75);
        box-shadow: 0rpx 0rpx 20rpx 5rpx rgba(#033535, 0.3);
        width: 80rpx;
        height: 80rpx;
        line-height: 80rpx;
        border-radius: 40rpx;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
