<script setup>
import { Icon } from '@iconify/vue';
import { getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance();

//认领
const post = () => {
    if (proxy.validThirdPartySource()) {
        proxy.uShowToast(
            proxy.$t('index.thirdPartyNotOpen'),
        );
        return false;
    };
    proxy.uShowToast('开发中');
}
</script>

<template>
    <view class="post" v-if="validToken()">
        <Icon
            icon="fa:plus"
            color="rgba(255,255,255,0.9)"
            @tap="post()"
        />
    </view>
</template>

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
