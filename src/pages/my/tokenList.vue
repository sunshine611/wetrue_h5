<script setup>
import { reactive, getCurrentInstance } from 'vue'
import { Icon } from '@iconify/vue';
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { useUserStore } from "@/stores/userStore";
import Request from "luch-request";
const http = new Request();
import Backend from "@/util/backend";
import BalanceList from "@/components/BalanceList.vue";
const { proxy } = getCurrentInstance();
const userStore = useUserStore();

const myTokenList = reactive({
    aeBalance: 0, //ae余额
    tokenList: [], //token列表
})

onLoad ( () => {
    proxy.uSetBarTitle(proxy.$t('titleBar.myWallet'));
    proxy.isPassword();
    proxy.getAeBalance().then(res=>{
        myTokenList.aeBalance = res;
    })
    getTokenList();
})

//下拉刷新
onPullDownRefresh ( () => {
    proxy.getAeBalance().then(res=>{
        myTokenList.aeBalance = res;
    })
    getTokenList();
    setTimeout(function() {
        uni.stopPullDownRefresh();
    }, 500);
})

//获取账户token列表
const getTokenList = () => {
    http.get(Backend.aeknowApiTokenList(userStore.token)).then((res) => {
        if (res.data.tokens.length > 0) {
            myTokenList.tokenList = res.data.tokens;
        }
    });
}
</script>

<template>
    <view class="token-list">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-navbar :is-fixed="false" :title="$t('my.myWallet')" v-show="!validThirdPartySource()">
            <template v-slot:right>
                <u-icon
                    name="home"
                    class="mr-30"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('index')"
                ></u-icon>
            </template>
        </u-navbar>
        <view class="ae-box">
            <view class="ae-account" @click="goUrl(`tokenTransferRecode`)">
                <u-image
                    width="100rpx"
                    height="100rpx"
                    src="@/static/ae_logo.png"
                    shape="circle"
                    class="token-logo"
                ></u-image>
                <text class="token-value"
                    >{{ $t('my.balance') + "：" + myTokenList.aeBalance }}
                    <u-icon
                        name="arrow-right"
                        class="ml-10"
                        color="#666"
                        size="32"
                    ></u-icon
                ></text>
            </view>
            <view class="ae-opera">
                <u-button
                    type="primary"
                    size="medium"
                    :ripple="true"
                    :custom-style="{ width: '42%' }"
                    @click="goUrl(`transfer`)"
                    v-show="!validThirdPartySource()"
                    >
                    <Icon
                        icon="fa-solid:exchange-alt"
                        width="28"
                        class="mr-10"
                        color="#fff"
                    />
                    {{ $t('my.send') }}
                </u-button>
                <u-button
                    type="success"
                    size="medium"
                    :ripple="true"
                    :custom-style="{ width: '42%' }"
                    @click="goUrl('qrcode')"
                    >
                    <Icon
                        icon="fa:qrcode"
                        width="24"
                        class="mr-10"
                        color="#fff"
                    />
                    {{ $t('my.receive') }}</u-button
                >
            </view>
        </view>
        <u-gap height="20"></u-gap>
        <BalanceList
                :tokenList="myTokenList.tokenList"
                :userAddress="userStore.token"
                :sendClick="true"
            ></BalanceList>
    </view>
</template>

<style lang="scss" scoped>
.token-list {
    .ae-box {
        background: #fff;
        padding: 30rpx;

        .ae-account {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .token-logo {
                border: 1rpx solid #dfdfdf;
            }
            .token-name {
                margin-left: 30rpx;
                font-size: 40rpx;
            }
        }
        .ae-opera {
            margin-top: 40rpx;
            margin-bottom: 20rpx;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
    }
}
</style>
