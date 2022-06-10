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
                                    :userInfo="userInfo"
                                    width="120rpx"
                                    height="120rpx"
                                ></HeadImg>
                                <view :class="[userInfo.isAuth ? 'auth' : '']">
                                    {{ userInfo.nickname || $t('my.cryptonym') }}
                                </view>
                            </view>
                            <view class="address" @tap="copy" id="copy">
                                {{ address }}
                            </view>
                        </view>
                    </view>
                </view>
            </view>
            <view class="grid">
                <u-tabs active-color="#319191" :list="list" :is-scroll="false" :current="current" @change="change"></u-tabs>
                 <u-gap height="10"></u-gap>
                <view class="forum-item" v-for="(item, index) in aensList" :key="index">
                    <view 
                        class="grid-list"
                        v-if="item.status=='auction'"
                        @tap="goUrl('/pages/my/aens/detail?name=' + item.name)"
                    >
                        <view class="text-left">{{ item.name }}</view>
                        <view class="text-right">{{ balanceFormat(item.info.last_bid.tx.name_fee) + ' AE' }}</view>
                        <u-gap height="60"></u-gap>
                        <view class="text-left fill">{{ (item.info.auction_end - lastHeight) + ` (≈${(item.info.auction_end - lastHeight) / 20}H)`  }}</view>
                        <view class="text-right fill">{{ `ak_...` + item.info.last_bid.tx.account_id.slice(-6) }}</view>
                        <u-gap height="40"></u-gap>
                        <u-line-progress active-color="#319191" :percent="
                            parseInt(
                                100 - ( 
                                    ( (item.info.auction_end - lastHeight)/(item.info.auction_end - item.info.last_bid.block_height) ) * 100
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
                        <view class="text-left fill">{{ (item.info.expire_height - lastHeight) + ` (≈${parseInt((item.info.expire_height - lastHeight) / 480)}D)`  }}</view>
                        <view class="text-right fill">{{ `ak_...` + (item.info.pointers.account_pubkey ? item.info.pointers.account_pubkey : item.info.ownership.current).slice(-6) }}</view>
                        <u-gap height="40"></u-gap>
                        <u-line-progress active-color="#1C1C1C" :percent="
                            parseInt( (item.info.expire_height - lastHeight) / 1800 )
                        "></u-line-progress>
                    </view>

                </view>
            </view>
            <u-divider bg-color="#dcdcdc" border-color="#319191" margin-top="10">没有更多了</u-divider>
        </view>
        <AensButton></AensButton>
    </view>
</template>

<script>
import { mapGetters } from "vuex";
import HeadImg from "@/components/HeadImg.vue";
import Request from "luch-request";
const http = new Request();
import Backend from "@/util/backend";
import AensButton from "@/components/Button/AensButton.vue";

export default {
    components: {
        HeadImg,
        AensButton
    },
    data() {
        return {
            aensList: {}, //AENS
            userInfo: {}, //用户信息
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
        };
    },
    computed: {
        ...mapGetters(["token"]),
    },
    onLoad() {
        this.uSetBarTitle('AENS');
        if (!!this.token) {
            this.getUserInfo();
            this.getAccount().then((res) => {
                this.balance = res;
            });
            this.changeGetList();
            this.getLastHeight();
        }
    },
    //下拉刷新
    onPullDownRefresh() {
        this.changeGetList();
        setTimeout(function() {
            uni.stopPullDownRefresh();
        }, 500);
    },
    activated() {
        if (!!this.token) {
            this.getUserInfo();
            this.getAccount().then((res) => {
                this.balance = res;
            });
        }
    },
    methods: {
        //获取用户信息
        getUserInfo() {
            let params = {
                userAddress: this.token,
            };
            this.address = "";
            for (let i = 0, len = this.token.length; i < len; i++) {
                this.address += this.token[i];
                if (i % 3 === 2) this.address += " ";
            }
            this.$http.post("/User/info", params).then((res) => {
                if (res.code === 200) {
                    this.userInfo = res.data;
                }
            });
        },
        //复制粘贴板
        copy() {
            this.copyContent(this.userInfo.userAddress);
        },
        //获取最新高度
        getLastHeight() {
            http.get(
                Backend.nodeApiLastHeight()
            ).then((res) => {
                this.lastHeight = res.data.height;
            });
        },
        //获取AENS
        getNameOwner() {
            http.get(
                Backend.aeMdwApiNamesOwner(this.token)
                //Backend.aeMdwApiNamesOwner('ak_2uYw22W3KGCCduExjzkBDNUxWt3Akdehm66CFAXDKRt9aoUofX') //测试所用，开发完成删除
                
            ).then((res) => {
                this.aensList = res.data.top_bid;
                this.aensList = this.aensList.concat(res.data.active);
            });
        },
        //获取竞价中
        getAuctions() {
            http.get(
                Backend.aeMdwApiNamesAuctions()
            ).then((res) => {
                this.aensList = res.data.data;
            });
        },
        change(index) {
            this.current = index;
            this.aensList = [];
            this.changeGetList()
        },
        changeGetList() {
            if (this.current === 0) {
                this.getAuctions()
            } else if (this.current === 1) {
                this.getNameOwner()
            }
        },
        test(item){
            console.debug(item)
        }
    },
};
</script>

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
