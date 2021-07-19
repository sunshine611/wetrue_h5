<template>
    <div class="account-manage">
        
    </div>
</template>

<script>
import UGap from "../../uview-ui/components/u-gap/u-gap.vue";
import Clipboard from "clipboard";
import { mapGetters } from "vuex";
import UButton from '../../uview-ui/components/u-button/u-button.vue';
export default {
    components: {  UGap, UButton },
    data() {
        return {};
    },
    computed: {
        ...mapGetters(["token"]),
        //国际化
        i18n() {
            return this.$_i18n.messages[this.$_i18n.locale];
        },
    },
    onLoad() {
    },
    activated() {
    },
    methods: {
        //复制粘贴板
        copy() {
            // #ifdef H5
            let clipboard = new Clipboard("#copy", {
                text: (trigger) => {
                    uni.showToast({
                        title: "复制成功",
                        icon: "none",
                        duration: 600,
                    });
                    return this.token;
                },
            });
            // #endif
            // #ifndef H5
            let that = this;
            uni.setClipboardData({
                data: that.token,
                success: function() {
                    uni.showToast({
                        title: "复制成功",
                        icon: "none",
                        duration: 600,
                    });
                },
            });
            // #endif
        },
    },
};
</script>
<style lang="scss" scoped>
page {
    background-color: #f04a82;
}
.qrcode {
    padding:60rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    height:100vh;
    box-sizing: border-box;
    .card {
        margin: 60rpx auto 0;
        padding: 50rpx 50rpx;
        border-radius: 20rpx;
        background: #fff;
        display: flex;
        justify-content: center;
        flex-direction: column;
        box-sizing: border-box;
        // box-shadow: 0 0 20rpx #ccc;
        .token {
            background: #f5f5f5;
            padding: 20rpx;
            border-radius: 15rpx;
            word-wrap: break-word;
            word-break: break-all;
            overflow: hidden;
            text-align: center;
        }
    }
}
</style>
