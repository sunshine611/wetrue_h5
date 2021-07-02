<template>
    <div class="qrcode">
        <u-navbar title="收款">
            <div slot="right">
                <u-icon
                    name="home"
                    class="mr-30"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('index')"
                ></u-icon>
            </div>
        </u-navbar>
        <div class="card">
            <vue-qr
                logoSrc="../../static/logo.png"
                :text="token"
                :size="220"
            ></vue-qr>
            <u-gap :height="20"></u-gap>
            <div class="token" @tap="copy" id="copy">
                <text>收款地址</text><u-gap :height="20"></u-gap>{{ token }}
            </div>
            <u-gap :height="30"></u-gap>
        </div>
    </div>
</template>

<script>
import vueQr from "vue-qr";
import UGap from "../../uview-ui/components/u-gap/u-gap.vue";
import Clipboard from "clipboard";
import { mapGetters } from "vuex";
export default {
    components: { vueQr, UGap },
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
        this.isPassword();
    },
    activated() {
        this.isPassword();
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
.qrcode {
    .card {
        margin: 60rpx auto 0;
        padding: 50rpx 50rpx;
        width: 85%;
        border-radius: 20rpx;
        height: 80%;
        background: #fff;
        display: flex;
        justify-content: center;
        flex-direction: column;
        box-sizing: border-box;
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
