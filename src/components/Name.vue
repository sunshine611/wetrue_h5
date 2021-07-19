<template>
    <div
        :class="['name', userInfo.isAuth ? 'auth' : '']"
        @click="goUrl('/pages/my/userInfo?userAddress=' + userInfo.userAddress)"
    >
        {{ userInfo.nickname || i18n.my.cryptonym }}
        <div class="auth-sign" v-if="userInfo.isAuth">
            <fa-FontAwesome
                slot="icon"
                type="fas fa-award"
                size="28"
                color="#2979FF"
            >
            </fa-FontAwesome>
        </div>
        <text class="userid">ID:{{ userInfo.userAddress.slice(-4) }}</text>
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
    computed: {
        //国际化
        i18n() {
            return this.$_i18n.messages[this.$_i18n.locale];
        },
    },
    watch: {},
    methods: {},
};
</script>
<style lang="scss" scoped>
.name {
    font-size: 28rpx;
    &.auth {
        color: #2979FF;
        font-weight: bold;
    }
    .auth-sign {
        margin-left: 6rpx;
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
