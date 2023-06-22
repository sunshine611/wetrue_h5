<script setup>
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
            <fa-FontAwesome
                type="fas fa-user-shield"
                size="28"
                color="#2979FF"
            >
            </fa-FontAwesome>
        </view>
        <view class="open-vip" v-if="userInfo.isVip">
            <u-icon 
                name="level"
                size="28"
                color="#CD7F32"
            ></u-icon>
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
