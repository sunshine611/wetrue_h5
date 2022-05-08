<template>
    <div class="version">
        <u-popup
            v-model="showModal"
            mode="center"
            width="70%"
            :border-radius="10"
            :mask-close-able="!versionInfo.mustUpdate"
        >
            <div class="version-content">
                <div class="title mb-40">
                    <u-image
                        width="92rpx"
                        height="46rpx"
                        src="@/static/logo.png"
                        class="inline mr-5"
                    ></u-image>
                    {{ $t('components.wetrueUpdate') }}
                </div>
                <div class="content mb-40">
                    <mp-html :content="versionInfo.content" :selectable="true"/>
                </div>
                <u-button
                    type="primary"
                    :ripple="true"
                    shape="circle"
                    @click="updateApp"
                >
                {{ $t('components.appUpdate') }}
                </u-button>
                <div class="version-info">
                    {{ $t('components.currentVersion') + ": " + version + "," + $t('components.newVersion') + ": " + versionInfo.newCode }}
                </div>
            </div>
        </u-popup>
    </div>
</template>
<script>
import { mapGetters } from "vuex";
import { version } from "@/config/config.js";
import mpHtml from "mp-html/dist/uni-app/components/mp-html/mp-html";

export default {
    components: {
        mpHtml,
    },
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        versionInfo: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            showModal: this.value, //控制隐藏显示
            version: version, //当前版本
        };
    },
    computed: {
        ...mapGetters(["token"]),
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
        //更新APP
        updateApp() {
            window.open(this.versionInfo.download);
        },
    },
};
</script>
<style lang="scss" scoped>
.version {
    .version-content {
        padding: 50rpx 40rpx;
        .title {
            font-size: 36rpx;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .version-info {
            color: #888;
            font-size: 24rpx;
            text-align: center;
            margin-top: 20rpx;
        }
    }
}
</style>
