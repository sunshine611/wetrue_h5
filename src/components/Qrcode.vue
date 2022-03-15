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
                    {{i18n.components.qrcode}}
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
                    <text>
                        {{i18n.components.receivingAddress}}
                    </text><u-gap :height="20"></u-gap>{{ address }}
                </div>
            </div>
        </u-popup>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import VueQrcode from "@chenfengyuan/vue-qrcode";

export default {
    components: {
        VueQrcode,
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
        i18n: {
            get() {
                return this.$_i18n.messages[this.$_i18n.locale];
            },
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
            this.copyContent(this.address);            
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
