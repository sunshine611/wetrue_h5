<script setup>
import { Icon } from '@iconify/vue';

const props = defineProps({
    userInfo: {
        type: Object,
        default: () => {},
    },
})
</script>

<template>
    <view
        class="name-area"
        @click="goUrl('/pages/my/userInfo?userAddress=' + userInfo.userAddress)"
    >
    <view class="name">
        {{ userInfo.nickname || $t('my.cryptonym') }}
    </view>
    <view class="auth-sign" v-show="userInfo.isAuth">
            <Icon
                icon="arcticons:2fas-auth"
                width="16"
                color="#2979FF"
            />
        </view>
        <view class="open-vip" v-show="userInfo.isVip">
            <Icon
                icon="quill:vip"
                width="16"
                color="#CD7F32"
            />
        </view>
        <text class="userid">{{ userInfo.defaultAens ? 'AENS: ' + userInfo.defaultAens : 'ID: ' + userInfo.userAddress.slice(-4) }}</text>
    </view>
</template>

<style lang="scss" scoped>
.name-area {
    font-size: 28rpx;
    display: inline-block;
    .name {
        display: inline-block;
        &.auth {
            color: #2979ff;
            font-weight: bold;
        }
    }
    .auth-sign {
        margin-right: 4rpx;
        display: inline-block;
    }
    .open-vip {
        margin-right: 4rpx;
        display: inline-block;
    }
    .userid {
        margin-left: 20rpx;
        font-size: 24rpx;
        color: #91908e;
        width: 100%;
    }
}
</style>
