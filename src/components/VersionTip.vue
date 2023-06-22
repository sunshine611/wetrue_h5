
<script setup>
import { ref, watch } from 'vue'
import { version as vs } from "@/config/config.js";
import mpHtml from "mp-html/dist/uni-app/components/mp-html/mp-html";

const props = defineProps({
    value: {
        type: Boolean,
        default: false,
    },
    versionInfo: {
        type: Object,
        default: () => {},
    },
})

const emits = defineEmits(["input"])

const showModal = ref(false)
const version = ref(vs)

watch(
    () => props.value,
    (val) => {
        showModal.value = val;
    }
)
watch(
	() => showModal.value,
	(val) => {
        emits("input", val);
	}
)

//更新APP
const updateApp = () => {
    window.open(props.versionInfo.download);
}
</script>

<template>
    <view class="version">
        <u-popup
            v-model="showModal"
            mode="center"
            width="70%"
            :border-radius="10"
            :mask-close-able="!versionInfo?.mustUpdate"
        >
            <view class="version-content">
                <view class="title mb-40">
                    <u-image
                        width="92rpx"
                        height="46rpx"
                        src="@/static/logo.png"
                        class="inline mr-5"
                    ></u-image>
                    {{ $t('components.wetrueUpdate') }}
                </view>
                <view class="content mb-40">
                    <mp-html :content="versionInfo.content" :selectable="true"/>
                </view>
                <u-button
                    type="primary"
                    :ripple="true"
                    shape="circle"
                    @click="updateApp"
                >
                {{ $t('components.appUpdate') }}
                </u-button>
                <view class="version-info">
                    {{ $t('components.currentVersion') + ": " + version + "," + $t('components.newVersion') + ": " + versionInfo.newCode }}
                </view>
            </view>
        </u-popup>
    </view>
</template>

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
