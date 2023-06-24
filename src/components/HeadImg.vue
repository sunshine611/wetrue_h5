
<script setup>
import { ref, getCurrentInstance, watch, nextTick } from 'vue'
import multiavatar from '@multiavatar/multiavatar';
const { proxy } = getCurrentInstance();

const props = defineProps({
    userInfo: {
        type: Object,
        default: {},
    },
    width: {
        type: String,
        default: "60rpx",
    },
    height: {
        type: String,
        default: "60rpx",
    },
    isLink: {
        type: Boolean,
        default: false,
    }
})

const avatar = ref(multiavatar(
    props.userInfo?.avatar ? props.userInfo?.avatar : props.userInfo?.userAddress
))

watch(
	() => props.userInfo,
	(val) => {
		nextTick(() => {
            avatar.value = multiavatar(
                props.userInfo.avatar ? props.userInfo.avatar : props.userInfo.userAddress
            );
        });
	}
)
//点击头像
const handleView = () => {
    if (props.isLink) {
        proxy.goUrl(
            "/pages/my/userInfo?userAddress=" +
                props.userInfo.userAddress
        );
    }
}
</script>

<template>
    <view class="head-img" @click="handleView" :style="`width:${width};height:${height}`">
        <view v-html="avatar"></view>
        <view :class="['level',userInfo?.sex === 1?'man':'',userInfo?.sex === 0?'woman':'']" v-if="userInfo?.userActive !== 0">
            <text class="text">V{{ userInfo?.userActive }}</text>
        </view>
    </view>
</template>

<style lang="scss" scoped>
.head-img {
    position: relative;
    display: inline-block;
    .level {
        position: absolute;
        right: -10rpx;
        bottom: -2rpx;
        width: 30rpx;
        height: 30rpx;
        background-color: #777;
        font-size: 24rpx;
        border-radius: 50%;
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 2rpx solid #fff;
        box-sizing: border-box;
        &.man{
            background-color: #2979ff;
        }
        &.woman{
            background-color: #f04a82;
        }
        .text {
            transform: scale(0.6);
        }
    }
    .sex{
        position: absolute;
        left: -10rpx;
        top: -2rpx;
        width: 30rpx;
        height: 30rpx;
        font-size: 24rpx;
        border-radius: 50%;
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 2rpx solid #fff;
        box-sizing: border-box;
        &.man{
            background-color: #2979ff;
        }
        &.woman{
            background-color: #f04a82;
        }
    }
}
</style>
