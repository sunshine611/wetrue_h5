<template>
    <div class="token-list">
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
                    >{{ i18n.my.balance +'：' + aeBalance }}
                    <u-icon
                        name="arrow-right"
                        class="ml-10"
                        color="#666"
                        size="32"
                    ></u-icon
                ></text>
            </div>
            <div class="ae-opera">
                <u-button type="primary" size="medium" :custom-style="{'width':'42%'}" @click="goUrl('transfer')">{{i18n.my.send}}</u-button>
                <u-button type="success" size="medium" :custom-style="{'width':'42%'}">{{i18n.my.receive}}</u-button>
            </div>
        </div>
        <u-gap height="20"></u-gap>
        <u-cell-group>
            <u-cell-item
                v-for="item in tokenList"
                :key="item.contract"
                :title="item.tokenname"
                :value="balanceFormat(item.balance)"
                @click="
                    goUrl(
                        `tokenTransferRecode?contract=${item.contract}&tokenName=${item.tokenname}`
                    )
                "
            ></u-cell-item>
        </u-cell-group>
    </div>
</template>

<script>
import Request from "@/js_sdk/luch-request/luch-request/index.js";
const http = new Request();
import { aeknow } from "@/config/config.js";
import { mapGetters } from "vuex";
import UCellItem from "../../uview-ui/components/u-cell-item/u-cell-item.vue";
import UButton from "../../uview-ui/components/u-button/u-button.vue";
export default {
    components: { UCellItem, UButton },
    data() {
        return {
            aeBalance: 0, //ae余额
            tokenList: [], //token列表
        };
    },
    computed: {
        ...mapGetters(["token"]),
        //国际化
        i18n() {
            return this.$_i18n.messages[this.$_i18n.locale];
        },
    },
    onLoad() {
        this.isPassword();
        this.getAccount();
        this.getTokenList();
    },
    activated() {},
    //上拉刷新
    onPullDownRefresh() {
        this.getAccount();
        this.getTokenList();
        setTimeout(function() {
            uni.stopPullDownRefresh();
        }, 500);
    },
    methods: {
        //获取账户token列表
        getTokenList() {
            http.get(aeknow + "api/token/" + this.token).then((res) => {
                if (res.data.tokens.length > 0) {
                    this.tokenList = res.data.tokens;
                }
            });
        },
        //获取账户AE余额
        getAccount() {
            http.get(aeknow + "api/account/" + this.token).then((res) => {
                this.aeBalance = this.balanceFormat(res.data.balance);
            });
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
            margin-bottom:20rpx;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
    }
}
</style>
