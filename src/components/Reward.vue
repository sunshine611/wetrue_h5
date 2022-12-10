<template>
    <div class="reward">
        <u-popup
            v-model="showModal"
            mode="center"
            width="80%"
            :border-radius="10"
        >
            <div class="reward-content">
                <div class="title">
                    <u-image
                        width="92rpx"
                        height="46rpx"
                        src="@/static/logo.png"
                        class="inline mr-5"
                    ></u-image>
                    {{ $t('components.reward') }}
                </div>
                <div class="tags">
                    <div
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
                    </div>
                </div>
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
                <div class="warnning" v-show="warning.amount">
                    {{ $t('my.balanceErr') }}
                </div>
                <div class="clearfix">
                    <div class="pull-right">
                        {{ $t('my.addressBalance') + ": " + wttBalance + "WTT" }}
                    </div>
                </div>
                <u-gap height="50"></u-gap>
                <u-button type="primary" @click="reward" :loading="btnLoading"
                    >{{ $t('components.reward') }}</u-button
                >
            </div>
        </u-popup>
    </div>
</template>
<script>
import { mapGetters } from "vuex";
import { getStore } from "@/util/service";

export default {
    components: {
    },
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        postInfo: {
            type: Object,
            default: {},
        },
    },
    data() {
        return {
            configInfo: getStore("configInfo"), //后端配置项
            showModal: this.value, //控制隐藏显示
            current: -1, //当前选择
            form: {
                amount: "",
            },
            //标签列表
            tagList: [
                {
                    text: "1WTT",
                    value: 1,
                },
                {
                    text: "6WTT",
                    value: 6,
                },
                {
                    text: "18WTT",
                    value: 18,
                },
                {
                    text: "66WTT",
                    value: 66,
                },
                {
                    text: "520WTT",
                    value: 520,
                },
                {
                    text: "680WTT",
                    value: 680,
                },
            ],
            warning: {
                amount: false,
            },
            wttBalance: 0, //WTT余额
            btnLoading: false, //按钮加载状态
        };
    },
    computed: {
        ...mapGetters(["token"]),
    },
    onLoad() {
        this.getConfigInfo();
    },
    watch: {
        value(val) {
            this.showModal = val;
            if (val) {
                this.getWttBalance();
            }
        },
        showModal(val) {
            this.$emit("input", val);
        },
        "form.amount": {
            handler(val) {
                for (let i = 0; i < this.tagList.length; i++) {
                    if (parseFloat(val) === this.tagList[i].value) {
                        this.current = i;
                        break;
                    } else {
                        this.current = -1;
                    }
                }
            },
            deep: true,
        },
    },
    methods: {
        //选择打赏金额
        handleSelect(item, index) {
            this.current = index;
            this.form.amount = item.value;
        },
        //打赏
        async reward() {
            if (this.token === this.postInfo.users.userAddress) {
                this.uShowToast(this.$t('components.rewardTips'));
                return;
            }
            if (
                !this.form.amount ||
                parseFloat(this.form.amount) > parseFloat(this.wttBalance)
            ) {
                this.warning.amount = true;
                return;
            } else {
                this.warning.amount = false;
            }
            this.btnLoading = true;
            let result = await this.contractTransfer(
                this.configInfo.wttContract,
                this.postInfo.users.userAddress,
                this.form.amount,
                {
                    type: 'reward',
                    toHash: this.postInfo.hash,
                    content: this.postInfo.hash
                }
            );
            if (result) {
                this.postHashToWeTrueApi(result); //打赏提交
                this.form = {
                    amount: "",
                };
                this.showModal = false;
                this.uShowToast(this.$t('components.rewardSuccess'));
                this.getWttBalance();
            }
            this.btnLoading = false;
        },
        //获取AEX9余额
        getWttBalance() {
            this.getTokenBalance(
                this.configInfo.wttContract,
                this.token
            ).then((res) => {
                this.wttBalance = this.balanceFormat( res.toString(10) ) || 0;
            });;
        },
    },
};
</script>
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
