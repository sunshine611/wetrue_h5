<template>
    <view class="setting">
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
            ></u-cell-item>
            <u-cell-item
                title="last_bid"
                :value="balanceFormat(
                    nameDetails.status=='auction' ? nameDetails.info.last_bid.tx.name_fee : nameDetails.info.claims[0].tx.name_fee
                ,2)"
                :arrow="false"
            ></u-cell-item>
            <u-cell-item
                title="last_height"
                :value="lastHeight"
                :arrow="false"
            ></u-cell-item>
            <u-cell-item
                title="end_height"
                :value="nameDetails.end_height"
                :arrow="false"
            ></u-cell-item>
            <u-cell-item
                title="there_time"
                :value="nameDetails.there_time + '分钟'"
                :arrow="false"
            ></u-cell-item>
            <u-cell-item
                title="account"
                :value="
                    nameDetails.status=='auction' ? nameDetails.info.bids[0].tx.account_id : nameDetails.info.ownership.current
                "
                :arrow="false"
            ></u-cell-item>
            <u-cell-item
                title="pointers"
                v-if="nameDetails.status=='name'"
                :value="nameDetails.info.pointers.account_pubkey"
                :arrow="false"
            ></u-cell-item>
        </u-cell-group>
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
        this.uSetBarTitle(this.$t('titleBar.contentDetails'));
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
        copy(str) {
           this.copyContent(str);
        },
    },
};
</script>

<style lang="scss" scoped>
.detail {
}
</style>
