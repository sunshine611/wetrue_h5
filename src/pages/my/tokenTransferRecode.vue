<script setup>
import { reactive, getCurrentInstance } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from "@/stores/userStore";
import Request from "luch-request";
const http = new Request();
import Backend from "@/util/backend";
const { proxy } = getCurrentInstance();
const userStore = useUserStore();

const myTransferRecode = reactive({
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
})

onLoad ( (option) => {
    proxy.uSetBarTitle(proxy.$t('titleBar.transactions'));
    myTransferRecode.userAddress = option.userAddress;
    myTransferRecode.tokenName = option.tokenName;
    myTransferRecode.contract = option.contract;
    proxy.isPassword();
    if (!!myTransferRecode.contract) {
        getTokenRecodeList();
    } else {
        getAeRecodeList();
    }
})
//下拉刷新
onPullDownRefresh ( () => {
    myTransferRecode.pageInfo.offset = 0;
    if (!!myTransferRecode.contract) {
        getTokenRecodeList();
    } else {
        getAeRecodeList();
    }
    setTimeout(function() {
        uni.stopPullDownRefresh();
    }, 500);
})
//上拉加载
onReachBottom ( () => {
    myTransferRecode.pageInfo.offset += myTransferRecode.pageInfo.limit;
    if (!!myTransferRecode.contract) {
        getTokenRecodeList();
    } else {
        getAeRecodeList();
    }
})

//获取账户token列表
const getTokenRecodeList = () => {
    http.get(
        Backend.aeknowApiTokenTxs(
            myTransferRecode.userAddress || userStore.token,
            myTransferRecode.contract,
            myTransferRecode.pageInfo.limit,
            myTransferRecode.pageInfo.offset
        )
        ).then((res) => {
            if (res.data.length > 0) {
                if (myTransferRecode.pageInfo.offset < myTransferRecode.pageInfo.limit) {
                    myTransferRecode.recodeList = res.data;
                } else {
                    myTransferRecode.recodeList = myTransferRecode.recodeList.concat(res.data);
                }
                if (myTransferRecode.data.length < myTransferRecode.pageInfo.limit) {
                    myTransferRecode.more = "nomore";
                }
            }
    });
}
//获取AE转账记录列表
const getAeRecodeList = () => {
    http.get(
        Backend.aeknowApiSpendTx(
            myTransferRecode.userAddress || userStore.token,
            myTransferRecode.pageInfo.limit,
            myTransferRecode.pageInfo.offset
        )
    ).then((res) => {
        if (res.data.txs.length > 0) {
            if (myTransferRecode.pageInfo.offset < myTransferRecode.pageInfo.limit) {
                myTransferRecode.recodeList = res.data.txs;
            } else {
                myTransferRecode.recodeList = myTransferRecode.recodeList.concat(res.data.txs);
            }
            if (res.data.txs.length < myTransferRecode.pageInfo.limit) {
                myTransferRecode.more = "nomore";
            }
        }
    });
}
//查看详情
const view = (hash) => {
    window.open(Backend.viewExplorerUrl(hash));
}
</script>

<template>
    <view class="transfer-record">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-navbar :is-fixed="false" :title="$t('my.transactions')" v-show="!validThirdPartySource()">
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
        <u-cell-group class="cell-box" v-if="myTransferRecode.recodeList.length > 0">
            <view v-for="item in myTransferRecode.recodeList" :key="item.txhash">
                <u-cell-item
                    class="cell-out"
                    v-if="item.sender_id === (myTransferRecode.userAddress || userStore.token)"
                    :label="parseInt(item?.utc)"
                    @click="view(item.txhash)"
                >
                    <template v-slot:icon>
                        <view class="icon">
                            <fa-FontAwesome
                                type="fas fa-arrow-circle-up"
                                size="50"
                                class="mr-20"
                                color="#f34343"
                            >
                            </fa-FontAwesome>
                        </view>
                    </template>
                    <template v-slot:title>
                        {{
                            item.recipient_id.slice(0, 3) +
                                "..." +
                                item.recipient_id.slice(-4)
                        }}
                    </template>
                    <template v-slot:right-icon>
                        <view class="amount">
                            {{
                                "-" +
                                    balanceFormat(item.amount) +
                                    " " +
                                    (myTransferRecode.tokenName || "AE")
                            }}
                        </view>
                    </template>
                </u-cell-item>
                <u-cell-item
                    class="cell-in"
                    v-else
                    :label="parseInt(item.utc)"
                    @click="view(item.txhash)"
                >   
                    <template v-slot:icon>
                        <view class="icon">
                            <fa-FontAwesome
                                type="fas fa-arrow-circle-down"
                                size="50"
                                class="mr-20"
                                color="#76bf0c"
                            >
                            </fa-FontAwesome>
                        </view>
                    </template>
                    <template v-slot:title>
                        {{
                            item.sender_id.slice(0, 3) +
                                "..." +
                                item.sender_id.slice(-4)
                        }}
                    </template>
                    <template v-slot:right-icon>
                        <view class="amount">
                            {{
                                "+" +
                                    balanceFormat(item.amount) +
                                    " " +
                                    (myTransferRecode.tokenName || "AE")
                            }}
                        </view>
                    </template>
                </u-cell-item>
            </view>
        </u-cell-group>
        <view class="empty" v-else><u-empty mode="list"></u-empty></view>
        <u-loadmore
            bg-color="rgba(0,0,0,0)"
            class="mb-20 mt-20"
            :status="myTransferRecode.more"
            v-show="myTransferRecode.recodeList.length > 0"
        />
        <u-gap :height="10"></u-gap>
    </view>
</template>

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