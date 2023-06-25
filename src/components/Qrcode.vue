<script>

import { ref, getCurrentInstance, watch } from 'vue'
import VueQrcode from "@chenfengyuan/vue-qrcode";

export default {
    name: 'Qrcode',
    components: { VueQrcode },
    props: {
        modelValue: {
            type: Boolean, 
            default: false
        },
        address: {
            type: String,
            default: "",
        },
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        const showQrcode = ref(props.modelValue) //二维码弹层
        const { proxy } = getCurrentInstance();
        watch(
            () => props.modelValue,
            (data) => {
                showQrcode.value = data
            }
        )
        watch(
            () => showQrcode.value,
            (data) => {
                emit('update:modelValue', data)
            }
        )
        //复制粘贴板
        const copy = () => {
            proxy.copyContent(props.address);            
        }
        return {
            copy,
            showQrcode,
        }
    },
}
</script>

<template>
    <view class="qrcode">
        <u-popup
            v-model="showQrcode"
            mode="center"
            width="80%"
            :border-radius="10"
        >
            <view class="reward-content">
                <view class="title">
                    <u-image
                        width="92rpx"
                        height="46rpx"
                        src="@/static/logo.png"
                        class="inline mr-5"
                    ></u-image>
                    {{ $t('components.qrcode') }}
                </view>
                <u-gap :height="30"></u-gap>
                <view class="qrcode">
                    <VueQrcode
                        :value="address"
                        :options="{ width: 220, margin: 2 }"
                    ></VueQrcode>
                </view>
                <u-gap height="30"></u-gap>
                <view class="token" @click="copy" ref="address">
                    <text>
                        {{ $t('components.receivingAddress') }}
                    </text><u-gap :height="20"></u-gap>{{ address }}
                </view>
            </view>
        </u-popup>
    </view>
    
</template>

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
