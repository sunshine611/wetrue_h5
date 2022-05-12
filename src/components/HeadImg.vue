<template>
    <div class="head-img" @click="handleView" :style="`width:${width};height:${height}`">

        <u-image
            shape="circle"
            :width="width"
            :height="height"
            v-show="portraitShow"
            :src="userInfo.portrait ? baseUrl + userInfo.portrait : '/static/default_head.png'"
        ></u-image>
        <div 
            v-show="!portraitShow"
            v-html="portrait"
        ></div>
        <!--
        <u-image
            shape="circle"
            :width="width"
            :height="height"
            v-else
            src="@/static/default_head.png"
        ></u-image>
        -->
        <div :class="['level',userInfo.sex === 1?'man':'',userInfo.sex === 0?'woman':'']" v-if="userInfo.userActive !== 0">
            <text class="text">V{{ userInfo.userActive }}</text>
        </div>
        <!--
         <div class="sex man" v-if="userInfo.sex === 1">
            <text class="text"><u-icon name="man" color="#fff" size="20"></u-icon></text>
        </div>
        <div class="sex woman" v-if="userInfo.sex === 0">
            <text class="text"><u-icon name="woman" color="#fff" size="20"></u-icon></text>
        </div> -->
    </div>
</template>
<script>
import { baseUrl } from "@/config/config.js";
import multiavatar from '@multiavatar/multiavatar';

export default {
    data() {
        return {
            baseUrl: baseUrl,
            portrait: multiavatar(this.userInfo.userAddress),
            portraitShow: false,
        };
    },
    mounted() {
        setTimeout(() => {
            this.getPortrait();
        }, 500);
    },
    props: {
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
        },
    },
    methods: {
        //点击头像
        handleView() {
            if (this.isLink) {
                this.goUrl(
                    "/pages/my/userInfo?userAddress=" +
                        this.userInfo.userAddress
                );
            }
        },
        getPortrait() {
            setTimeout(async () => {
                this.portrait = await multiavatar(this.userInfo.userAddress);
                if(this.userInfo.portrait) this.portraitShow = true;
            }, 500);
        },
    },
};
</script>
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
