<template>
    <div class="qrcode">
        <div class="card">
            <VueQrcode :value="token" :options="{ width: 260,margin:1 }"></VueQrcode>
            <u-gap :height="30"></u-gap>
            <div class="token" @tap="copy" id="copy">
                <text>{{ i18n.my.recipient }}</text><u-gap :height="20"></u-gap>{{ token }}
            </div>
            <u-button type="primary" class="mt-50" @click="reLaunchUrl('/pages/my/index')">{{ i18n.my.backMy }}</u-button>
            <u-gap :height="30"></u-gap>
        </div>
    </div>
</template>

<script>
import UGap from "@/uview-ui/components/u-gap/u-gap.vue";
import { mapGetters } from "vuex";
import UButton from '@/uview-ui/components/u-button/u-button.vue';
import VueQrcode from '@chenfengyuan/vue-qrcode';
export default {
    components: { VueQrcode, UGap, UButton },
    data() {
        return {};
    },
    computed: {
        ...mapGetters(["token"]),
        //国际化
        i18n: {
            get() {
                return this.$_i18n.messages[this.$_i18n.locale];
            },
        },
    },
    onLoad() {
        uni.setNavigationBarTitle({
            title:this.i18n.titleBar.myWallet
        });
    },
    activated() {
    },
    methods: {
        //复制粘贴板
        copy() {
           this.copyContent(this.token);
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
        align-items: center;
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
