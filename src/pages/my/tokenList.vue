<template>
    <div class="token-list">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-navbar :is-fixed="false" :title="$t('my.myWallet')" v-show="!validThirdPartySource()">
            <div slot="right">
                <u-icon
                    name="home"
                    class="mr-30"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('index')"
                ></u-icon>
            </div>
        </u-navbar>
        <div class="ae-box">
            <div class="ae-account" @click="goUrl(`tokenTransferRecode`)">
                <u-image
                    width="100rpx"
                    height="100rpx"
                    src="@/static/ae_logo.png"
                    shape="circle"
                    class="token-logo"
                ></u-image>
                <text class="token-value"
                    >{{ $t('my.balance') + "：" + aeBalance }}
                    <u-icon
                        name="arrow-right"
                        class="ml-10"
                        color="#666"
                        size="32"
                    ></u-icon
                ></text>
            </div>
            <div class="ae-opera">
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
                    >{{ $t('my.send') }}</u-button
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
                    >{{ $t('my.receive') }}</u-button
                >
            </div>
        </div>
        <u-gap height="20"></u-gap>
        <u-cell-group>
            <u-cell-item
                v-for="item in tokenList"
                :key="item.contract||item.contract_id"
                :arrow="false"
                @click="
                    goUrl(
                        `tokenTransferRecode?contract=${item.contract||item.contract_id}&tokenName=${item.tokenname||item.token_symbol}`
                    )
                "
            >
             <div slot="icon">
                        <div class="token-icon">
                            {{item.tokenname||item.token_symbol}}
                        </div>
                    </div>
                <div slot="right-icon" class="amount">
                    {{ $t('my.balance') + ": " + balanceFormat(item.balance||item.amount, 5, item.decimal) }}
                    <u-button
                        shape="square"
                        type="primary"
                        size="mini"
                        :ripple="true"
                        class="ml-20"
                        @click="
                            goUrl(
                                `transfer?tokenName=${item.tokenname||item.token_symbol}&contractId=${item.contract||item.contract_id}&balance=${item.balance||item.amount}`
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
                        >{{ $t('my.send') }}</u-button
                    >
                </div>
            </u-cell-item>
        </u-cell-group>
    </div>
</template>

<script>
import Request from "luch-request";
const http = new Request();
import Backend from "@/util/backend";
import { mapGetters } from "vuex";

export default {
    components: {

    },
    data() {
        return {
            aeBalance: 0, //ae余额
            tokenList: [], //token列表
        };
    },
    computed: {
        ...mapGetters(["token"]),
    },
    onLoad() {
        this.uSetBarTitle(this.$t('titleBar.myWallet'));
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
            /*
            http.get(Backend.aeMdwApiTokenList(this.token)).then((res) => {
                if (res.data.length > 0) {
                    this.tokenList = res.data;
                }
            });
            */
        },
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
