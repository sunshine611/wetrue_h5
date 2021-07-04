<template>
    <div class="head-img" @click="handleView">
        <u-image
            shape="circle"
            :width="width"
            :height="height"
            v-if="userInfo.portrait"
            :src="userInfo.portrait"
        ></u-image>
        <u-image
            shape="circle"
            :width="width"
            :height="height"
            v-else
            src="@/static/default_head.png"
        ></u-image>
        <div class="level" v-if="userInfo.userActive !== 0">
            <text class="text">V{{ userInfo.userActive }}</text>
        </div>
        <div class="sex man" v-if="userInfo.sex === 1">
            <text class="text"><u-icon name="man" color="#fff" size="22"></u-icon></text>
        </div>
        <div class="sex woman" v-if="userInfo.sex === 0">
            <text class="text"><u-icon name="woman" color="#fff" size="22"></u-icon></text>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        userInfo: {
            type: Object,
            default: {},
        },
        width: {
            type: String,
            default: "60rpx",
        },
        height: {
            type: String,
            default: "60rpx",
        },
        isLink: {
            type: Boolean,
            default: false,
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
    methods: {
        //点击头像
        handleView() {
            if (this.isLink) {
                this.goUrl(
                    "/pages/my/userInfo?userAddress=" +
                        this.userInfo.userAddress
                );
            }
        },
    },
};
</script>
<style lang="scss" scoped>
.head-img {
    position: relative;
    .level {
        position: absolute;
        right: -10rpx;
        bottom: -2rpx;
        width: 32rpx;
        height: 32rpx;
        background-color: #d62900;
        font-size: 24rpx;
        border-radius: 50%;
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 4rpx solid #ffd982;
        box-sizing: border-box;
        .text {
            transform: scale(0.6);
        }
    }
    .sex{
        position: absolute;
        left: -10rpx;
        top: -2rpx;
        width: 32rpx;
        height: 32rpx;
        
        font-size: 24rpx;
        border-radius: 50%;
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 4rpx solid #fff;
        box-sizing: border-box;
        &.man{
            background-color: #2979ff;
        }
        &.woman{
            background-color: #f04a82;
        }
    }
}
</style>
