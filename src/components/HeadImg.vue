<template>
    <div class="head-img" @click="handleView">
        <u-image
            shape="circle"
            :width="width"
            :height="height"
            v-if="src"
            :src="src"
        ></u-image>
        <u-image
            shape="circle"
            :width="width"
            :height="height"
            v-else
            src="@/static/default_head.png"
        ></u-image>
        <div class="level" v-if="userActive !== 0">
            <text class="text">V{{ userActive }}</text>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        src: {
            type: String,
            default: "",
        },
        width: {
            type: String,
            default: "60rpx",
        },
        height: {
            type: String,
            default: "60rpx",
        },
        userActive: {
            type: Number,
            default: 0,
        },
        isLink: {
            type: Boolean,
            default: false,
        },
        userAddress:{
            type:String,
            default:''
        }
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
        handleView(item) {
            if (this.isLink) {
                this.goUrl(
                    "/pages/my/userInfo?userAddress=" +
                        this.userAddress
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
        width: 34rpx;
        height: 34rpx;
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
            transform: scale(0.65);
        }
    }
}
</style>
