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
                icon="line-md:moon-to-sunny-outline-loop-transition"
                width="16"
                color="#2979FF"
            />
        </view>
        <view class="open-vip" v-show="userInfo.isVip">
            <Icon
                icon="ri:vip-line"
                width="16"
                color="#CD7F32"
            />
        </view>
        <text class="userid">{{ userInfo.defaultAens ? '@' + userInfo.defaultAens : 'ID: ' + userInfo.userAddress.slice(-4) }}</text>
    </view>
</template>

<style lang="scss" scoped>
.name-area {
    font-size: 28rpx;
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 80%;
    .name {
        display: inline-block;
        font-weight: bold;
        max-width: 50%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        &.auth {
            color: #2979ff;
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
        margin-left: 5rpx;
        color: #999;
        font-size: 26rpx;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
}
</style>
