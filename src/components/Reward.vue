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
                    打赏
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
                    type="text"
                    class="textarea"
                    :border="true"
                    :clearable="false"
                    :custom-style="{ padding: '0 15rpx' }"
                    placeholder="Amount"
                    maxlength="20"
                />
                <u-gap height="16"></u-gap>
                <div class="warnning" v-show="warning.amount">
                    {{ i18n.my.balanceErr }}
                </div>
                <!-- <div class="clearfix">
                    <div class="pull-right">
                        {{ i18n.my.addressBalance + "：" + wttBalance + "WTT" }}
                    </div>
                </div> -->
                <u-gap height="50"></u-gap>
                <u-button type="primary" @click="reward" :loading="btnLoading"
                    >打赏</u-button
                >
            </div>
        </u-popup>
    </div>
</template>
<script>
import UTag from "@/uview-ui/components/u-tag/u-tag.vue";
export default {
    components: {
        UTag,
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
            showModal: this.value, //控制隐藏显示
            current: -1, //当前选择
            form: {
                amount: "",
            },
            //标签列表
            tagList: [
                {
                    text: "10WTT",
                    value: 10,
                },
                {
                    text: "50WTT",
                    value: 50,
                },
                {
                    text: "100WTT",
                    value: 100,
                },
                {
                    text: "188WTT",
                    value: 188,
                },
                {
                    text: "680WTT",
                    value: 680,
                },
                {
                    text: "1888WTT",
                    value: 1888,
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
        //国际化
        i18n() {
            return this.$_i18n.messages[this.$_i18n.locale];
        },
    },
    watch: {
        value(val) {
            this.showModal = val;
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
            // if (
            //     !this.form.amount ||
            //     parseFloat(this.form.amount) > parseFloat(this.wttBalance)
            // ) {
            //     this.warning.amount = true;
            //     return;
            // } else {
            //     this.warning.amount = false;
            // }
            this.btnLoading = true;
            let result = await this.contractTransfer(
                "ct_uGk1rkSdccPKXLzS259vdrJGTWAY9sfgVYspv6QYomxvWZWBM",
                this.postInfo.users.userAddress,
                this.form.amount
            );
            if (result) {
                this.rewardSubmit(result.hash);
                this.form = {
                    amount: "",
                };
                this.showModal = false;
                this.uShowToast("打赏成功，谢谢大爷打赏！");
            }
            this.btnLoading = false;
        },
        //打赏提交
        rewardSubmit(hash) {
            let params = { hash: hash, toHash: this.postInfo.hash };
            this.$http.post("/Submit/reward", params)
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
