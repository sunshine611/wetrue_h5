<template>
    <div class="transfer">
        <u-navbar title="转账">
            <div slot="right">
                <u-icon
                    name="home"
                    class="mr-30"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('index')"
                ></u-icon>
            </div>
        </u-navbar>
        <u-gap height="20"></u-gap>
        <div class="form">
            <div class="form-title">收款地址：</div>
            <u-gap height="14"></u-gap>
            <u-input
                v-model="form.address"
                type="textarea"
                class="textarea"
                :clearable="false"
                height="80"
                :custom-style="{ padding: '15rpx' }"
                placeholder="请输入收款地址"
                maxlength="100"
            />
            <div class="warnning" v-show="warning.address">
                地址格式错误
            </div>
        </div>
        <u-gap height="20"></u-gap>
        <div class="form">
            <div class="form-title">转帐金额：</div>
            <u-gap height="14"></u-gap>
            <u-input
                v-model="form.money"
                type="text"
                class="textarea"
                :clearable="false"
                :custom-style="{ padding: '0 15rpx' }"
                placeholder="请输入数量"
                maxlength="20"
            />
            <div class="warnning" v-show="warning.money">
                金额输入错误
            </div>
            <u-gap height="18"></u-gap>
            <div class="clearfix">
                <div class="pull-right">钱包余额：{{ aeBalance }}</div>
            </div>
        </div>
        <u-gap height="60"></u-gap>
        <div class="ok-btn">
            <u-button type="primary" @click="transfer" :loading="btnLoading"
                >确认</u-button
            >
        </div>
    </div>
</template>

<script>
import Request from "@/js_sdk/luch-request/luch-request/index.js";
const http = new Request();
import { aeknow } from "@/config/config.js";
import { mapGetters } from "vuex";
import UCellItem from "../../uview-ui/components/u-cell-item/u-cell-item.vue";
import UButton from "../../uview-ui/components/u-button/u-button.vue";
export default {
    components: { UCellItem, UButton },
    data() {
        return {
            aeBalance: 0, //ae余额
            form: {
                address: "",
                money: "",
            },
            warning: {
                address: false,
                money: false,
            },
            btnLoading: false,
        };
    },
    computed: {
        ...mapGetters(["token"]),
        //国际化
        i18n() {
            return this.$_i18n.messages[this.$_i18n.locale];
        },
    },
    onLoad() {
        this.isPassword();
        this.getAccount();
    },
    activated() {},
    //上拉刷新
    onPullDownRefresh() {
        this.getAccount();
        setTimeout(function() {
            uni.stopPullDownRefresh();
        }, 500);
    },
    methods: {
        //转账
        async transfer() {
            if (!this.form.address) {
                this.warning.address = true;
                return;
            } else {
                this.warning.address = false;
            }
            if (!this.form.money || this.form.money > this.aeBalance) {
                this.warning.money = true;
                return;
            } else {
                this.warning.money = false;
            }
            uni.showLoading({
                title: "正在转账...",
            });
            this.btnLoading = true;
            var client;
            if (JSON.stringify(this.$store.state.user.client) === "{}") {
                await this.connectAe();
                client = this.$store.state.user.client;
            } else {
                client = this.$store.state.user.client;
            }
            try {
                const res = await client.spend(
                    this.form.money * Math.pow(10, 18),
                    this.form.address
                );
                if (res.hash) {
                    uni.hideLoading();
                    uni.showToast({
                        icon: "success",
                        title: "转账成功",
                    });
                    this.btnLoading = false;
                    this.getAccount();
                }
            } catch (err) {
                this.hideLoading = false;
                this.btnLoading = false;
            }
        },
        //获取账户AE余额
        getAccount() {
            http.get(aeknow + "api/account/" + this.token).then((res) => {
                this.aeBalance = this.balanceFormat(res.data.balance);
            });
        },
    },
};
</script>
<style lang="scss" scoped>
.transfer {
    .form {
        background: #fff;
        padding: 30rpx;
        .textarea {
            border: 1px solid #ccc;
            border-radius: 10rpx;
        }
        .warnning {
            font-size: 20rpx;
            color: #f00;
            margin-top: 10rpx;
        }
    }
    .ok-btn {
        padding: 30rpx;
    }
}
</style>
