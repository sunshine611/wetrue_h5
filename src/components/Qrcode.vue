<template>
    <div class="qrcode">
        <u-popup
            v-model="showModal"
            mode="center"
            width="80%"
            :border-radius="10"
        >
            <div class="reward-content">
                <div class="title">
                    <u-image
                        width="92rpx"
                        height="46rpx"
                        src="@/static/logo.png"
                        class="inline mr-5"
                    ></u-image>
                    二维码
                </div>
                <u-gap :height="30"></u-gap>
                <div class="qrcode">
                    <VueQrcode
                        :value="address"
                        :options="{ width: 220, margin: 2 }"
                    ></VueQrcode>
                </div>
                <u-gap height="30"></u-gap>
                <div class="token" @click="copy" ref="address">
                    <text>收款地址</text><u-gap :height="20"></u-gap>{{ address }}
                </div>
            </div>
        </u-popup>
    </div>
</template>
<script>
import { mapGetters } from "vuex";
import VueQrcode from "@chenfengyuan/vue-qrcode";
import UGap from "../uview-ui/components/u-gap/u-gap.vue";
import Clipboard from "clipboard";
export default {
    components: {
        VueQrcode,
        UGap,
    },
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        address: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            showModal: this.value, //控制隐藏显示
        };
    },
    computed: {
        ...mapGetters(["token"]),
        //国际化
        i18n() {
            return this.$_i18n.messages[this.$_i18n.locale];
        },
    },
    watch: {
        value(val) {
            this.showModal = val;
        },
        showModal(val) {
            this.$emit("input", val);
        },
    },
    methods: {
        //复制粘贴板
        copy() {
            // #ifdef H5
            new Clipboard(this.$refs.address, {
                text: (trigger) => {
                    uni.showToast({
                        title: "复制成功",
                        icon: "none",
                        duration: 600,
                    });
                    return this.address;
                },
            });
            // #endif
            // #ifndef H5
            let that = this;
            uni.setClipboardData({
                data: that.address,
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
    .reward-content {
        padding: 50rpx 40rpx;
        .title {
            font-size: 36rpx;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .qrcode {
            text-align: center;
        }
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
