<template>
    <view class="token-list">
        <u-status-bar></u-status-bar>
        <u-navbar 
            :title="i18n.my.myWallet" 
            :placeholder="true"
            :autoBack="true"
            v-show="!validThirdPartySource()"
        >
            <view slot="right">
                <u-icon
                    name="home"
                    color="#f04a82"
                    class="mr-30"
                    size="34"
                    @click="reLaunchUrl('index')"
                ></u-icon>
            </view>
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
                    >{{ i18n.my.balance + "：" + aeBalance }}
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
                    ><fa-FontAwesome
                        type="fas fa-exchange-alt"
                        size="24"
                        class="mr-10"
                        color="#fff"
                    >
                    </fa-FontAwesome
                    >{{ i18n.my.send }}</u-button
                >
                <u-button
                    type="success"
                    size="medium"
                    :ripple="true"
                    :custom-style="{ width: '42%' }"
                    @click="goUrl('qrcode')"
                    ><fa-FontAwesome
                        type="fas fa-qrcode"
                        size="24"
                        class="mr-10"
                        color="#fff"
                    >
                    </fa-FontAwesome
                    >{{ i18n.my.receive }}</u-button
                >
            </view>
        </view>
        <u-gap height="20"></u-gap>
        <u-cell-group>
            <u-cell
                v-for="item in tokenList"
                :key="item.contract"
                :arrow="false"
                @click="
                    goUrl(
                        `tokenTransferRecode?contract=${item.contract}&tokenName=${item.tokenname}`
                    )
                "
            >
             <view slot="icon">
                        <view class="token-icon">
                            {{item.tokenname}}
                        </view>
                    </view>
                <view slot="right-icon" class="amount">
                    {{i18n.my.balance + ": " + balanceFormat(item.balance)}}
                    <u-button
                        shape="square"
                        type="primary"
                        size="mini"
                        :ripple="true"
                        class="ml-20"
                        @click="
                            goUrl(
                                `transfer?tokenName=${item.tokenname}&contractId=${item.contract}&balance=${item.balance}`
                            )
                        "
                        v-show="!validThirdPartySource()"
                        ><fa-FontAwesome
                            type="fas fa-exchange-alt"
                            size="24"
                            class="mr-10"
                            color="#fff"
                        >
                        </fa-FontAwesome
                        >{{ i18n.my.send }}</u-button
                    >
                </view>
            </u-cell>
        </u-cell-group>
    </view>
</template>

<script>
import Request from "luch-request";
const http = new Request();
import Backend from "@/util/backend";
import { mapGetters } from "vuex";

export default {
    components: {},
    data() {
        return {
            aeBalance: 0, //ae余额
            tokenList: [], //token列表
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
    onLoad() {
        this.uSetBarTitle(this.i18n.titleBar.myWallet);
        this.isPassword();
        this.getAccount().then(res=>{
                this.aeBalance = res;
            })
        this.getTokenList();
    },
    activated() {
        this.isPassword();
        this.getAccount().then(res=>{
                this.aeBalance = res;
            })
        this.getTokenList();
    },
    //下拉刷新
    onPullDownRefresh() {
        this.getAccount().then(res=>{
                this.aeBalance = res;
            })
        this.getTokenList();
        setTimeout(function() {
            uni.stopPullDownRefresh();
        }, 500);
    },
    methods: {
        //获取账户token列表
        getTokenList() {
            http.get(Backend.aeknowApiTokenList(this.token)).then((res) => {
                if (res.data.tokens.length > 0) {
                    this.tokenList = res.data.tokens;
                }
            });
        }
    },
};
</script>
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
    .token-icon{
        width:80rpx;
        height: 80rpx;
        background: #f04a82;
        border-radius: 50%;
        color:#fff;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>
