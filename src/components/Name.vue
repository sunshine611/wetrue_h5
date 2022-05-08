<template>
    <div
        class="name-area"
        @click="goUrl('/pages/my/userInfo?userAddress=' + userInfo.userAddress)"
    >
    <div class="auth-sign" v-if="userInfo.isAuth">
            <fa-FontAwesome
                type="fas fa-user-secret"
                size="28"
                color="#2979FF"
            >
            </fa-FontAwesome>
        </div>
        <div :class="['name', userInfo.isAuth ? 'auth' : '']">
            {{ userInfo.nickname || $t('my.cryptonym') }}
        </div>
        <text class="userid">ID:{{ userInfo.userAddress.slice(-4)  }}</text>
        <text class="userid" v-show="userInfo.defaultAens">AENS:{{ userInfo.defaultAens }}</text>
    </div>
</template>
<script>
export default {
    props: {
        userInfo: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {};
    },
};
</script>
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
    .userid {
        margin-left: 20rpx;
        font-size: 24rpx;
        color: #91908e;
        width: 100%;
    }
}
</style>
