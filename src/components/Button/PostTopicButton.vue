<script setup>
import { getCurrentInstance } from 'vue'
import { Icon } from '@iconify/vue';
const { proxy } = getCurrentInstance();

const props = defineProps({
    postButtonInfo: {
        type: Object,
        default: () => {
            return {}
        },
    },
})

//发帖
const post = () => {
    //WeTrue登陆发帖
    if (props.postButtonInfo.type == 'topic') {
        proxy.goUrl(
            "editor?topic=" + props.postButtonInfo.keyword
        );
    } else if (props.postButtonInfo.type == 'shtip') {
        proxy.goUrl(
            "editor?shtip=true"
        );
    } else {
        proxy.goUrl('editor');
    }
}

</script>

<template>
    <view class="post" v-if="validToken()">
        <Icon
            icon="fa:plus"
            color="rgba(255,255,255,0.9)"
            @tap="post()"
        />
    </view>
</template>

<style lang="scss" scoped>
.post {
        position: fixed;
        z-index: 1000;
        right: 60rpx;
        bottom: 200rpx;
        background: rgba($u-type-aeternity, 0.75);
        box-shadow: 0rpx 0rpx 20rpx 5rpx rgba($u-type-aeternity, 0.3);
        width: 80rpx;
        height: 80rpx;
        line-height: 80rpx;
        border-radius: 40rpx;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
