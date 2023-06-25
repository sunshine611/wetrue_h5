
<script setup>
import { reactive, getCurrentInstance } from 'vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { useUserStore } from "@/stores/userStore";
import HeadImg from "@/components/HeadImg.vue";
import Request from "luch-request";
const http = new Request();
import Backend from "@/util/backend";
import AensButton from "@/components/Button/AensButton.vue";
const { proxy } = getCurrentInstance();
const userStore = useUserStore();

const myAens = reactive({
    aensList: {}, //AENS
    address: "", //ae地址
    balance: 0, //余额
    lastHeight: 0, //最新高度
    list: [{
            name: '认领',
            count: 0
        }, {
            name: '我的',
            count: 0
        }],
    current: 0,
})

onLoad ( () => {
    proxy.uSetBarTitle('AENS');
    if (!!userStore.token) {
        getAddress();
        proxy.getAeBalance().then((res) => {
            myAens.balance = res;
        });
        changeGetList();
        getLastHeight();
    }
})

//下拉刷新
onPullDownRefresh ( () => {
    changeGetList();
    setTimeout(function() {
        uni.stopPullDownRefresh();
    }, 500);
})
//获取用户信息
const getAddress = () => {
    myAens.address = "";
    for (let i = 0, len = userStore.token.length; i < len; i++) {
        myAens.address += userStore.token[i];
        if (i % 3 === 2) myAens.address += " ";
    }
}
//复制粘贴板
const copy = () => {
    proxy.copyContent(userStore.token);
}
//获取最新高度
const getLastHeight = () => {
    http.get(
        Backend.nodeApiLastHeight()
    ).then((res) => {
        myAens.lastHeight = res.data.height;
    });
}
//获取AENS
const getNameOwner = () => {
    http.get(
        Backend.aeMdwApiNamesOwner(userStore.token)
    ).then((res) => {
        myAens.aensList = res.data.top_bid;
        myAens.aensList = myAens.aensList.concat(res.data.active);
    });
}
//获取竞价中
const getAuctions = () => {
    http.get(
        Backend.aeMdwApiNamesAuctions()
    ).then((res) => {
        myAens.aensList = res.data.data;
    });
}
const change = (index) => {
    myAens.current = index;
    myAens.aensList = [];
    changeGetList()
}
const changeGetList = () => {
    if (myAens.current === 0) {
        getAuctions()
    } else if (myAens.current === 1) {
        getNameOwner()
    }
}
</script>

<template>
    <view class="my">
        <view
            class="top-background"
            :style="{height:`${statusBarHeight}px`}"
        ></view>
        <view class="user-info">
            <view class="my-info">
                <view class="block-color"></view>
                <view class="block">
                    <view class="icon-list">
                        <u-icon
                            class="mr-15"
                            name="home"
                            color="#fff"
                            size="40"
                            @click="reLaunchUrl('../index')"
                        ></u-icon>
                    </view>
                    <view class="user-box">
                        <view class="user-top">
                            <view class="head">
                                <HeadImg
                                    :userInfo="userStore.userInfo"
                                    width="120rpx"
                                    height="120rpx"
                                ></HeadImg>
                                <view :class="[userStore.userInfo?.isAuth ? 'auth' : '']">
                                    {{ userStore.userInfo?.nickname || $t('my.cryptonym') }}
                                </view>
                            </view>
                            <view class="address" @tap="copy" id="copy">
                                {{ myAens.address }}
                            </view>
                        </view>
                    </view>
                </view>
            </view>
            <view class="grid">
                <u-tabs active-color="#319191" :list="myAens.list" :is-scroll="false" :current="myAens.current" @change="change"></u-tabs>
                 <u-gap height="10"></u-gap>
                <view class="forum-item" v-for="(item, index) in myAens.aensList" :key="index">
                    <view 
                        class="grid-list"
                        v-if="item.status=='auction'"
                        @tap="goUrl('/pages/my/aens/detail?name=' + item.name)"
                    >
                        <view class="text-left">{{ item.name }}</view>
                        <view class="text-right">{{ balanceFormat(item.info.last_bid.tx.name_fee) + ' AE' }}</view>
                        <u-gap height="60"></u-gap>
                        <view class="text-left fill">{{ (item.info.auction_end - myAens.lastHeight) + ` (≈${(item.info.auction_end - myAens.lastHeight) / 20}H)`  }}</view>
                        <view class="text-right fill">{{ `ak_...` + item.info.last_bid.tx.account_id.slice(-6) }}</view>
                        <u-gap height="40"></u-gap>
                        <u-line-progress active-color="#319191" :percent="
                            parseInt(
                                100 - ( 
                                    ( (item.info.auction_end - myAens.lastHeight)/(item.info.auction_end - item.info.last_bid.block_height) ) * 100
                                )
                            )
                        "></u-line-progress>
                    </view>

                    <view 
                        class="grid-list"
                        v-if="item.status=='name'"
                        @tap="goUrl('/pages/my/aens/detail?name=' + item.name)"
                    >
                        <view class="text-left">{{ item.name }}</view>
                        <view class="text-right">{{  }}</view>
                        <u-gap height="60"></u-gap>
                        <view class="text-left fill">{{ (item.info.expire_height - myAens.lastHeight) + ` (≈${parseInt((item.info.expire_height - myAens.lastHeight) / 480)}D)`  }}</view>
                        <view class="text-right fill">{{ `ak_...` + (item.info.pointers.account_pubkey ? item.info.pointers.account_pubkey : item.info.ownership.current).slice(-6) }}</view>
                        <u-gap height="40"></u-gap>
                        <u-line-progress active-color="#1C1C1C" :percent="
                            parseInt( (item.info.expire_height - myAens.lastHeight) / 1800 )
                        "></u-line-progress>
                    </view>

                </view>
            </view>
            <u-divider bg-color="#dcdcdc" border-color="#319191" margin-top="10">没有更多了</u-divider>
        </view>
        <AensButton></AensButton>
    </view>
</template>

<style lang="scss">
page {
    background-color: #dcdcdc;
}

.my {
    .top-background {
        background: #033535;
    }
    .user-info {
        .my-info {
            .block-color {
                position: absolute;
                width: 100%;
                height: 460rpx;
                background: #fff;
            }
            .block {
                background: #033535;
                width: 100%;
                height: 200rpx;
                position: relative;
                box-sizing: border-box;
                color: #101010;
                position: relative;
                .icon-list {
                    position: absolute;
                    right: 30rpx;
                    top: 35rpx;
                }
                .user-box {
                    width: 90%;
                    background-color: #fff;
                    box-shadow: 0rpx 2rpx 6rpx 0rpx
                        rgba($color: $u-type-aeternity, $alpha: 0.3);
                    z-index: 100;
                    border-radius: 20rpx;
                    position: absolute;
                    left: 5%;
                    bottom: -150rpx;
                    font-size: 26rpx;
                    box-sizing: border-box;

                    .user-top {
                        padding: 30rpx 30rpx 0 30rpx;
                        display: flex;

                        .head {
                            text-align: center;
                            font-size: 24rpx;
                            padding: 20rpx 30rpx;
                            .auth {
                                color: #2979ff;
                                font-weight: bold;
                                display: inline-block;
                            }
                        }

                        .address {
                            display: inline-flex;
                            flex-wrap: wrap;
                            align-items: center;
                            line-height: 50rpx;
                            color: $u-type-aeternity;
                            font-size: 34rpx;
                        }
                    }
                }

            }
        }
    }
    .grid {
        width: 98%;
        margin: 180rpx auto 0rpx;
        .grid-list {
            padding: 10rpx 30rpx 0 30rpx;
            margin-bottom: 10rpx;
            border-radius: 20rpx;
            background: #fff;
            height: 160rpx;
            &.name-height {
                height: 120rpx;
            }
            .text-left {
                font-size: 42rpx;
                position: absolute;
                color: #101010;
            }
            .text-right {
                font-size: 34rpx;
                position: absolute;
                right: 30rpx;
            }
            .fill {
                font-size: 32rpx;
                color: #898989;
            }
        }
    }
}
</style>
