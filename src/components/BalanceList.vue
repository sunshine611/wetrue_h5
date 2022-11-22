<template>
    <div class="balance-list">
        <u-cell-group :border="false">
            <div v-for="(item, index) in tokenList" :key="index">
                <u-cell-item 
                    @click="transferRecord(item)" 
                    :arrow="!sendClick"
                >
                    <div slot="icon">
                        <div class="token-icon">
                            {{ item.symbol }}
                            <div class='level' v-if="item.cert == 'TRUE'">
                                <text class="text">V</text>
                            </div>
                        </div>
                    </div>
                    <div slot="right-icon" class="amount">
                        {{ $t('my.balance') + ': ' + balanceFormat(item.balance) }}
                        <u-button
                        shape="square"
                        type="primary"
                        size="mini"
                        :ripple="true"
                        class="ml-20"
                        @click="
                            goUrl(
                                `transfer?tokenName=${item.symbol}&contractId=${item.contract_id}&balance=${item.balance}`
                            )
                        "
                        v-show="sendClick && !validThirdPartySource()"
                        ><fa-FontAwesome
                            type="fas fa-exchange-alt"
                            size="24"
                            class="mr-10"
                            color="#fff"
                        >
                        </fa-FontAwesome>
                            {{ $t('my.send') }}
                        </u-button>
                    </div>
                </u-cell-item>
            </div>
        </u-cell-group>
    </div>
</template>
<script>
export default {
    components: {},
    props: {
        tokenList: {
            type: Array,
            default: () => [],
        },
        userAddress: {
            type: String,
            default: "",
        },
        sendClick: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {};
    },
    methods: {
        //查看用户账户转账记录
        transferRecord(item) {
            if (!!item.contract_id) {
                this.goUrl(
                    `tokenTransferRecode?contract=${item.contract_id}&tokenName=${item.symbol}&userAddress=${this.userAddress}`
                );
            } else {
                this.goUrl(`tokenTransferRecode?userAddress=${this.userAddress}`);
            }
        },
    },
};
</script>
<style lang="scss" scoped>
.balance-list {
    .token-icon {
        width: 80rpx;
        height: 80rpx;
        background: #f04a82;
        border-radius: 50%;
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        .level {
            position: absolute;
            bottom: 20rpx;
            left: 90rpx;
            width: 25rpx;
            height: 25rpx;
            background-color: rgb(0, 255, 0);
            font-size: 24rpx;
            border-radius: 50%;
            color: rgb(255, 255, 255);
            display: flex;
            justify-content: center;
            align-items: center;
            border: 2rpx solid #fff;
            box-sizing: border-box;
        }
    }
}
</style>
