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
    <view class="auth-sign" v-if="userInfo.isAuth">
            <Icon
                icon="fa-solid:user-shield"
                width="20"
                color="#2979FF"
            />
        </view>
        <view class="open-vip" v-if="userInfo.isVip">
            <Icon
                icon="quill:vip"
                width="18"
                color="#CD7F32"
            />
        </view>
        <view :class="['name', userInfo.isAuth ? 'auth' : '']">
            {{ userInfo.nickname || $t('my.cryptonym') }}
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
