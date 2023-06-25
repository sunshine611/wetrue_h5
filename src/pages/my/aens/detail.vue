
<script setup>
import { reactive, getCurrentInstance } from 'vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import Request from "luch-request";
const http = new Request();
import Backend from "@/util/backend";
const { proxy } = getCurrentInstance();

const myAensDetail = reactive({
    aens: "", //AENS
    lastHeight: 0, //最新高度
    nameDetails: { //AENS详情
        info:{
            claims:[{tx:{name_fee:0}}],
            ownership:{current:""},
            pointers:{account_pubkey:""}
        }
    },
    btnLoading: false, //按钮加载状态
})

onLoad ( async(option) => {
    proxy.uSetBarTitle('AENS详情');
    myAensDetail.aens = option.name;
    await getLastHeight();
    await getNameDetails();
})

//下拉刷新
onPullDownRefresh ( () => {
    setTimeout(function () {
        uni.stopPullDownRefresh();
    }, 500);
})

//获取aens详情
const getNameDetails = () => {
    http.get(
        Backend.aeMdwApiNameDetails(myAensDetail.aens)
    ).then((res) => {
        myAensDetail.nameDetails = res.data;
        myAensDetail.nameDetails.account = myAensDetail.nameDetails.status=='auction' 
                                            ? myAensDetail.nameDetails.info.bids[0].tx.account_id 
                                            : myAensDetail.nameDetails.info.ownership.current
        myAensDetail.nameDetails.end_height = myAensDetail.nameDetails.status=='auction' 
                                                ? myAensDetail.nameDetails.info.auction_end 
                                                : myAensDetail.nameDetails.info.expire_height
        myAensDetail.nameDetails.there_time = (myAensDetail.nameDetails.end_height - myAensDetail.lastHeight) * 3
    });
}
//获取最新高度
const getLastHeight = () => {
    http.get(
        Backend.nodeApiLastHeight()
    ).then((res) => {
        myAensDetail.lastHeight = res.data.height;
    });
}
//复制粘贴板
const copy = (str,viewId) => {
    proxy.copyContent(str,viewId);
}
//竞拍
const auction = async() => {
    proxy.uShowToast('竞拍开发中');
}
//更新指向
const update = async(select) => {
    myAensDetail.btnLoading = true;
    let res;
    if (select == 'extend') {
        let payload = {
            type: select,
            name: myAensDetail.aens
        }
        res = await aensUpdate(payload);
    } else {
        proxy.uShowToast(select + '开发中');
    }
    releaseCallback(res);
}
//转移
const transfer = async() => {
    proxy.uShowToast('转移开发中');
}
//回调
const releaseCallback = (callback) => {
    if (JSON.stringify(callback) !== "{}" && !!callback) {
        proxy.uHideLoading();
        myAensDetail.btnLoading = false;
        proxy.uShowToast('AENS已更新');
    } else {
        this.uHideLoading();
        myAensDetail.btnLoading = false;
    }
}
</script>

<template>
    <view class="detail">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-navbar
            :is-fixed="false"
            title="AENS Detail"
            v-show="!validThirdPartySource()"
        >
            <template v-slot:right>
                <u-icon
                    class="mr-30"
                    name="home"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('../../my/index')"
                ></u-icon>
            </template>
        </u-navbar>
        <u-cell-group :border="false">
            <u-cell-item
                title="Name"
                :value="myAensDetail.nameDetails.name"
                :arrow="false"
                @click="copy(myAensDetail.nameDetails.name,'#Name')"
                id="Name"
            ></u-cell-item>
            <u-cell-item
                title="Last bid"
                :value="balanceFormat(
                    myAensDetail.nameDetails.status=='auction' 
                    ? myAensDetail.nameDetails.info.last_bid.tx.name_fee 
                    : myAensDetail.nameDetails.info.claims[0].tx.name_fee
                ,2) + ' AE'"
                :arrow="false"
            ></u-cell-item>
            <u-cell-item
                title="Last height"
                :value="myAensDetail.lastHeight"
                :arrow="false"
            ></u-cell-item>
            <u-cell-item
                title="End height"
                :value="myAensDetail.nameDetails.end_height"
                :arrow="false"
            ></u-cell-item>
            <u-cell-item
                title="There time"
                :value="myAensDetail.nameDetails.there_time + '分钟'"
                :arrow="false"
            ></u-cell-item>
            <u-cell-item
                v-if="myAensDetail.nameDetails.status=='name'"
                class="break"
                :title-style="{'width': '30%'}"
                title="Hash"
                :value="myAensDetail.nameDetails.hash"
                :arrow="false"
                @click="copy(myAensDetail.nameDetails.hash,'#Hash')"
                id="Hash"
            ></u-cell-item>
            <u-cell-item
                class="break"
                :title-style="{'width': '30%'}"
                title="Account"
                :value="myAensDetail.nameDetails.account"
                :arrow="false"
                @click="copy(myAensDetail.nameDetails.account,'#Account')"
                id="Account"
            ></u-cell-item>
            <u-cell-item
                v-if="myAensDetail.nameDetails.status=='name'"
                class="break"
                :title-style="{'width': '30%'}"
                title="Pointers"
                label="account_pubkey"
                :value="myAensDetail.nameDetails.info.pointers.account_pubkey"
                :arrow="false"
                @click="copy(myAensDetail.nameDetails.info.pointers.account_pubkey,'#Pointers')"
                id="Pointers"
            ></u-cell-item>
        </u-cell-group>
        <u-gap height="80"></u-gap>

         <view class="updata" v-if="myAensDetail.nameDetails.status=='auction'">
            <u-button
                class="auction"
                shape="circle"
                type="primary"
                :plain="true"
                @click="auction"
                >
                {{ '竞价' }}
            </u-button>
        </view>

        <view class="updata" v-if="myAensDetail.nameDetails.status=='name'">
            <u-button
                class="add-btn"
                shape="circle"
                type="primary"
                :plain="true"
                @click="update('pointers')"
                >
                {{ '指向' }}
            </u-button>
            <u-button
                class="add-btn"
                shape="circle"
                type="primary"
                :plain="true"
                @click="transfer"
                >
                {{ '转移' }}
            </u-button>
            <u-button
                class="add-btn"
                shape="circle"
                type="primary"
                :plain="true"
                @click="update('extend')"
                :loading="myAensDetail.btnLoading"
                >
                {{ '更新' }}
            </u-button>
        </view>

    </view>
</template>

<style lang="scss" scoped>
.detail {
    .updata {
        background: #fff;
        position: fixed;
        width: 100%;
        height: 120rpx;
        left: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0px 0px 10rpx rgba($color: #f04a82, $alpha: 0.5);
        .add-btn {
            width: 32%;
        }
        .auction  {
            width: 50%;
        }
    }
    .break {
        word-break: break-word;
    }
}
</style>
