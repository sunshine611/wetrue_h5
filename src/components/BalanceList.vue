<script setup>
import { getCurrentInstance } from 'vue'
import { Icon } from '@iconify/vue';
const { proxy } = getCurrentInstance();

const props = defineProps({
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
})
//Token列表查看用户账户转账记录
const transferRecord = (item) => {
    if (!!item.contract_id) {
        proxy.goUrl(
            `tokenTransferRecode?contract=${item.contract_id}&tokenName=${item.symbol}&userAddress=${proxy.userAddress}`
        );
    } else {
        proxy.goUrl(`tokenTransferRecode?userAddress=${proxy.userAddress}`);
    }
}
</script>

<template>
    <view class="balance-list">
        <u-cell-group :border="false">
            <view v-for="(item, index) in props.tokenList" :key="index">
                <u-cell-item 
                    @click="transferRecord(item)" 
                    :arrow="!props.sendClick"
                >
                    <template v-slot:icon>
                        <view class="token-icon">
                            {{ item.symbol }}
                            <view class='level' v-if="item.cert == 'TRUE'">
                                <text class="text">V</text>
                            </view>
                        </view>
                    </template>
                    <template v-slot:right-icon>
                        <view class="amount">
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
                            v-show="props.sendClick && !validThirdPartySource()"
                            >
                            <Icon
                                icon="la:exchange-alt"
                                width="24"
                                class="mr-10"
                                color="#fff"
                            />
                                {{ $t('my.send') }}
                            </u-button>
                        </view>
                    </template>
                </u-cell-item>
            </view>
        </u-cell-group>
    </view>
</template>

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
