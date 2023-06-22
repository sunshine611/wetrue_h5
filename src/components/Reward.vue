
<script setup>
import { ref, reactive, watch, getCurrentInstance } from 'vue'
import { useUserStore } from "@/stores/userStore";
const userStore = useUserStore();
const { proxy } = getCurrentInstance();

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    postInfo: {
        type: Object,
        default: {},
    }
})
const emits = defineEmits(['modelValue'])

const showModal = ref(props.modelValue) //控制隐藏显示
const current = ref(-1) //当前选择
const wttBalance = ref(0) //WTT余额
const btnLoading = ref(false) //按钮加载状态
const form = reactive({
    amount: "",
})
const warning = reactive({
    amount: false,
})

const tagList = [{
        text: "1WTT",
        value: 1,
    },{
        text: "6WTT",
        value: 6,
    },{
        text: "18WTT",
        value: 18,
    },{
        text: "66WTT",
        value: 66,
    },{
        text: "520WTT",
        value: 520,
    },{
        text: "680WTT",
        value: 680,
}]

watch(
	() => props.modelValue,
	(val) => {
        showModal.value = val;
        if (val) {
            getWttBalance();
        }
	}
)
watch(
	() => showModal.value,
	(val) => {
        emits("modelValue", val);
	}
)
watch(
	() => form.amount,
	(val) => {
        for (let i = 0; i < tagList.length; i++) {
            if (parseFloat(val) === tagList[i].value) {
                current.value = i;
                break;
            } else {
                current.value = -1;
            }
        }
	}
)

//选择打赏金额
const handleSelect = (item, index) => {
    current.value = index;
    form.amount = item.value;
}
//打赏
const reward = async() => {
    if (userStore.token === props.postInfo.users.userAddress) {
        proxy.uShowToast(proxy.$t('components.rewardTips'));
        return;
    }
    if (
        !form.amount ||
        parseFloat(form.amount) > parseFloat(wttBalance.value)
    ) {
        warning.amount = true;
        return;
    } else {
        warning.amount = false;
    }
    btnLoading.value = true;
    let result = await proxy.contractTransfer(
        userStore.configInfo.wttContract,
        props.postInfo.users.userAddress,
        form.amount,
        {
            type: 'reward',
            toHash: props.postInfo.hash,
            content: props.postInfo.hash
        }
    );
    if (result) {
        proxy.postHashToWeTrueApi(result); //打赏提交
        form = {
            amount: "",
        };
        showModal.value = false;
        proxy.uShowToast(proxy.$t('components.rewardSuccess'));
        getWttBalance();
    }
    btnLoading.value = false;
}
//获取AEX9余额
const getWttBalance = () => {
    proxy.getTokenBalance(
        userStore.configInfo.wttContract,
        userStore.token
    ).then((res) => {
        wttBalance.value = proxy.balanceFormat( res ?? 0 );
    });;
}
</script>

<template>
    <view class="reward">
        <u-popup
            v-model="showModal"
            mode="center"
            width="80%"
            :border-radius="10"
        >
            <view class="reward-content">
                <view class="title">
                    <u-image
                        width="92rpx"
                        height="46rpx"
                        src="@/static/logo.png"
                        class="inline mr-5"
                    ></u-image>
                    {{ $t('components.reward') }}
                </view>
                <view class="tags">
                    <view
                        class="tag"
                        v-for="(item, index) in tagList"
                        :key="index"
                    >
                        <u-tag
                            :text="item.text"
                            :mode="index === current ? 'dark' : 'plain'"
                            @click="handleSelect(item, index)"
                            style="width:160rpx;"
                        ></u-tag>
                    </view>
                </view>
                <u-input
                    v-model="form.amount"
                    size="mini"
                    type="number"
                    class="textarea"
                    :border="true"
                    :clearable="false"
                    :custom-style="{ padding: '0 15rpx' }"
                    placeholder="Amount"
                    maxlength="20"
                />
                <u-gap height="16"></u-gap>
                <view class="warnning" v-show="warning.amount">
                    {{ $t('my.balanceErr') }}
                </view>
                <view class="clearfix">
                    <view class="pull-right">
                        {{ $t('my.addressBalance') + ": " + wttBalance + "WTT" }}
                    </view>
                </view>
                <u-gap height="50"></u-gap>
                <u-button type="primary" @click="reward" :loading="btnLoading"
                    >{{ $t('components.reward') }}</u-button
                >
            </view>
        </u-popup>
    </view>
</template>

<style lang="scss" scoped>
.reward {
    .reward-content {
        padding: 50rpx 40rpx;
        .title {
            font-size: 36rpx;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .tags {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-flow: wrap;
            margin: 40rpx 0 10rpx 0;
            .tag {
                text-align: center;
                margin: 20rpx 0;
            }
        }
        .warnning {
            font-size: 20rpx;
            color: #f00;
            margin-top: 10rpx;
        }
    }
}
</style>
