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
                    {{i18n.components.reward}}
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
                    {{ i18n.my.balanceErr }}
                </div>
                <div class="clearfix">
                    <div class="pull-right">
                        {{ i18n.my.addressBalance + "：" + wttBalance + "WTT" }}
                    </div>
                </div>
                <u-gap height="50"></u-gap>
                <u-button type="primary" @click="reward" :loading="btnLoading"
                    >{{i18n.components.reward}}</u-button
                >
            </div>
        </u-popup>
    </div>
</template>
<script>
import UTag from "@/uview-ui/components/u-tag/u-tag.vue";
import { mapGetters } from "vuex";
import Request from "luch-request";
const http = new Request();
import Backend from "@/util/backend";
import { wttContract } from "@/config/config.js";

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
        //国际化
        i18n: {
            get() {
                return this.$_i18n.messages[this.$_i18n.locale];
            },
        },
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
                this.uShowToast(this.i18n.components.rewardTips);
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
                wttContract,
                this.postInfo.users.userAddress,
                this.form.amount
            );
            if (result) {
                this.rewardSubmit(result.hash);
                this.form = {
                    amount: "",
                };
                this.showModal = false;
                this.uShowToast(this.i18n.components.rewardSuccess);
                this.getWttBalance();
            }
            this.btnLoading = false;
        },
        //打赏提交
        rewardSubmit(hash) {
            let params = { hash: hash, toHash: this.postInfo.hash };
            this.$http.post("/Submit/reward", params);
        },
        //获取WTT余额
        getWttBalance() {
            http.get(
                Backend.aeMdwApiMyToken(this.token, wttContract)
                //Backend.aeknowApiMyToken(this.token, wttContract)
            ).then((res) => {
                this.wttBalance = this.balanceFormat(res.data.amount || res.data.balance);
            });
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
