<template>
    <div class="transfer-record">
        <view :style="`padding-top:${statusBarHeight}px`"></view>
        <u-navbar :is-fixed="false" :title="$t('my.transactions')" v-show="!validThirdPartySource()">
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
        <u-cell-group class="cell-box" v-if="recodeList.length > 0">
            <div v-for="item in recodeList" :key="item.txhash">
                <u-cell-item
                    class="cell-out"
                    v-if="item.sender_id === (userAddress || token)"
                    :label="parseInt(item.utc) | date('yyyy-mm-dd hh:MM:ss')"
                    @click="view(item.txhash)"
                >
                    <div slot="icon" class="icon">
                        <fa-FontAwesome
                            type="fas fa-arrow-circle-up"
                            size="50"
                            class="mr-20"
                            color="#f34343"
                        >
                        </fa-FontAwesome>
                    </div>
                    <div slot="title">
                        {{
                            item.recipient_id.slice(0, 3) +
                                "..." +
                                item.recipient_id.slice(-4)
                        }}
                    </div>
                    <div slot="right-icon" class="amount">
                        {{
                            "-" +
                                balanceFormat(item.amount) +
                                " " +
                                (tokenName || "AE")
                        }}
                    </div>
                </u-cell-item>
                <u-cell-item
                    class="cell-in"
                    v-else
                    :label="parseInt(item.utc) | date('yyyy-mm-dd hh:MM:ss')"
                    @click="view(item.txhash)"
                >
                    <div slot="icon" class="icon">
                        <fa-FontAwesome
                            type="fas fa-arrow-circle-down"
                            size="50"
                            class="mr-20"
                            color="#76bf0c"
                        >
                        </fa-FontAwesome>
                    </div>
                    <div slot="title">
                        {{
                            item.sender_id.slice(0, 3) +
                                "..." +
                                item.sender_id.slice(-4)
                        }}
                    </div>
                    <div slot="right-icon" class="amount">
                        {{
                            "+" +
                                balanceFormat(item.amount) +
                                " " +
                                (tokenName || "AE")
                        }}
                    </div>
                </u-cell-item>
            </div>
        </u-cell-group>
        <div class="empty" v-else><u-empty mode="list"></u-empty></div>
        <u-loadmore
            bg-color="rgba(0,0,0,0)"
            class="mb-20 mt-20"
            :status="more"
            v-show="recodeList.length > 0"
        />
        <u-gap :height="10"></u-gap>
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
            userAddress: "", //用户地址
            tokenName: "", //token名字
            contract: "", //合约编号
            recodeList: [], //转账记录列表
            //分页信息
            pageInfo: {
                limit: 20,
                offset: 0,
            },
            more: "loadmore", //加载更多
        };
    },
    computed: {
        ...mapGetters(["token"]),
    },
    onLoad(option) {
        this.getSystemStatusBarHeight(); //状态栏高度
        this.uSetBarTitle(this.$t('titleBar.transactions'));
        this.userAddress = option.userAddress;
        this.tokenName = option.tokenName;
        this.contract = option.contract;
        this.isPassword();
        if (!!this.contract) {
            this.getTokenRecodeList();
        } else {
            this.getAeRecodeList();
        }
    },
    //下拉刷新
    onPullDownRefresh() {
        this.pageInfo.offset = 0;
        if (!!this.contract) {
            this.getTokenRecodeList();
        } else {
            this.getAeRecodeList();
        }
        setTimeout(function() {
            uni.stopPullDownRefresh();
        }, 500);
    },
    //上拉加载
    onReachBottom() {
        this.pageInfo.offset += this.pageInfo.limit;
        if (!!this.contract) {
            this.getTokenRecodeList();
        } else {
            this.getAeRecodeList();
        }
    },
    methods: {
        //获取账户token列表
        getTokenRecodeList() {
            http.get(
                Backend.aeknowApiTokenTxs(
                    this.userAddress || this.token,
                    this.contract,
                    this.pageInfo.limit,
                    this.pageInfo.offset
                )
                ).then((res) => {
                    if (res.data.length > 0) {
                        if (this.pageInfo.offset < this.pageInfo.limit) {
                            this.recodeList = res.data;
                        } else {
                            this.recodeList = this.recodeList.concat(res.data);
                        }
                        if (res.data.length < this.pageInfo.limit) {
                            this.more = "nomore";
                        }
                    }
            });
        },
        //获取AE转账记录列表
        getAeRecodeList() {
            http.get(
                Backend.aeknowApiSpendTx(
                    this.userAddress || this.token,
                    this.pageInfo.limit,
                    this.pageInfo.offset
                )
            ).then((res) => {
                if (res.data.txs.length > 0) {
                    if (this.pageInfo.offset < this.pageInfo.limit) {
                        this.recodeList = res.data.txs;
                    } else {
                        this.recodeList = this.recodeList.concat(res.data.txs);
                    }
                    if (res.data.txs.length < this.pageInfo.limit) {
                        this.more = "nomore";
                    }
                }
            });
        },
        //查看详情
        view(hash) {
            window.open(Backend.viewExplorerUrl(hash));
        },
    },
};
</script>
<style lang="scss" scoped>
.transfer-record {
    .cell-box {
        .cell-in {
            .amount {
                color: #76bf0c;
            }
        }
        .cell-out {
            .amount {
                color: #f34343;
            }
        }
    }
}
</style>