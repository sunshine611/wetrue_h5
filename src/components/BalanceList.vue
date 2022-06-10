<template>
    <div class="balance-list">
        <u-cell-group :border="false">
            <div v-for="(item, index) in tokenList" :key="index">
                <u-cell-item @click="transferRecord(item)">
                    <div slot="icon">
                        <div class="token-icon">
                            {{ item.tokenname }}
                        </div>
                    </div>
                    <div slot="right-icon" class="amount">
                        {{ $t('my.balance') + ': ' + balanceFormat(item.balance) }}
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
    },
    data() {
        return {};
    },
    methods: {
        //查看用户账户转账记录
        transferRecord(item) {
            if (!!item.contract) {
                this.goUrl(
                    `tokenTransferRecode?contract=${item.contract}&tokenName=${item.tokenname}&userAddress=${this.userAddress}`
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
    }
}
</style>
