<template>
    <view class="detail">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-navbar
            :is-fixed="false"
            title="AENS Detail"
            v-show="!validThirdPartySource()"
        >
            <view slot="right">
                <u-icon
                    name="home"
                    class="mr-30"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('../../my/index')"
                ></u-icon>
            </view>
        </u-navbar>
        <u-cell-group :border="false">
            <u-cell-item
                title="Name"
                :value="nameDetails.name"
                :arrow="false"
                @click="copy(nameDetails.name,'#Name')"
                id="Name"
            ></u-cell-item>
            <u-cell-item
                title="Last_bid"
                :value="balanceFormat(
                    nameDetails.status=='auction' ? nameDetails.info.last_bid.tx.name_fee : nameDetails.info.claims[0].tx.name_fee
                ,2)"
                :arrow="false"
            ></u-cell-item>
            <u-cell-item
                title="Last_height"
                :value="lastHeight"
                :arrow="false"
            ></u-cell-item>
            <u-cell-item
                title="End_height"
                :value="nameDetails.end_height"
                :arrow="false"
            ></u-cell-item>
            <u-cell-item
                title="There_time"
                :value="nameDetails.there_time + '分钟'"
                :arrow="false"
            ></u-cell-item>
            <u-cell-item
                v-if="nameDetails.status=='name'"
                class="break"
                :title-style="{'width': '30%'}"
                title="Hash"
                :value="nameDetails.hash"
                :arrow="false"
                @click="copy(nameDetails.hash,'#Hash')"
                id="Hash"
            ></u-cell-item>
            <u-cell-item
                class="break"
                :title-style="{'width': '30%'}"
                title="Account"
                :value="nameDetails.account"
                :arrow="false"
                @click="copy(nameDetails.account,'#Account')"
                id="Account"
            ></u-cell-item>
            <u-cell-item
                v-if="nameDetails.status=='name'"
                class="break"
                :title-style="{'width': '30%'}"
                title="Pointers"
                label="account_pubkey"
                :value="nameDetails.info.pointers.account_pubkey"
                :arrow="false"
                @click="copy(nameDetails.info.pointers.account_pubkey,'#Pointers')"
                id="Pointers"
            ></u-cell-item>
        </u-cell-group>
        <u-gap height="80"></u-gap>

        <view class="updata" v-if="nameDetails.status=='name'">
            <u-button
                class="add-btn"
                shape="circle"
                type="primary"
                :plain="true"
                >
                {{ '指向' }}
            </u-button>
            <u-button
                class="add-btn"
                shape="circle"
                type="primary"
                :plain="true"
                >
                {{ '转移' }}
            </u-button>
            <u-button
                class="add-btn"
                shape="circle"
                type="primary"
                :plain="true"
                >
                {{ '更新' }}
            </u-button>
        </view>
        <AensButton v-show="nameDetails.status=='auction'"></AensButton>
    </view>
</template>

<script>

import Request from "luch-request";
const http = new Request();
import Backend from "@/util/backend";
import AensButton from "@/components/Button/AensButton.vue";

export default {
    components: {
        AensButton
    },
    data() {
        return {
            aens: "", //AENS
            lastHeight: 0, //最新高度
            nameDetails: { //AENS详情
                info:{
                    claims:[{tx:{name_fee:0}}],
                    ownership:{current:""},
                    pointers:{account_pubkey:""}
                }
            },
        };
    },
    //下拉刷新
    onPullDownRefresh() {
        setTimeout(function () {
            uni.stopPullDownRefresh();
        }, 500);
    },
    async onLoad(option) {
        this.uSetBarTitle('AENS详情');
        this.aens = option.name;
        await this.getLastHeight();
        await this.getNameDetails();
    },
    watch: {

    },
    methods: {
        //获取aens详情
        getNameDetails() {
            http.get(
                Backend.aeMdwApiNameDetails(this.aens)
            ).then((res) => {
                this.nameDetails = res.data;
                this.nameDetails.account = this.nameDetails.status=='auction' ? this.nameDetails.info.bids[0].tx.account_id : this.nameDetails.info.ownership.current
                this.nameDetails.end_height = this.nameDetails.status=='auction' ? this.nameDetails.info.auction_end : this.nameDetails.info.expire_height
                this.nameDetails.there_time = (this.nameDetails.end_height - this.lastHeight) * 3
            });
        },
        //获取最新高度
        getLastHeight() {
            http.get(
                Backend.nodeApiLastHeight()
            ).then((res) => {
                this.lastHeight = res.data.height;
            });
        },
        //复制粘贴板
        copy(str,divId) {
           this.copyContent(str,divId);
        },
    },
};
</script>

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
    }
    .break {
        word-break: break-word;
    }
}
</style>
