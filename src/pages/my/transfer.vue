<template>
    <div class="transfer">
        <u-navbar :title="title">
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
            <div class="form-title">{{ i18n.my.recipient }}：</div>
            <u-gap height="14"></u-gap>
            <u-input
                v-model="form.address"
                type="textarea"
                class="textarea"
                :clearable="true"
                height="80"
                :custom-style="{ padding: '15rpx' }"
                placeholder="ak_ … or name.chain"
                maxlength="100"
            />
            <div class="warnning" v-show="warning.address">
                {{ i18n.my.addressErr }}
            </div>
        </div>
        <u-gap height="20"></u-gap>
        <div class="form">
            <div class="form-title">{{ i18n.my.amount }}：</div>
            <u-gap height="14"></u-gap>
            <u-input
                v-model="form.money"
                type="number"
                class="textarea"
                :clearable="false"
                :custom-style="{ padding: '0 15rpx' }"
                placeholder="Amount"
                maxlength="20"
            />
            <div class="warnning" v-show="warning.money">
                {{ i18n.my.balanceErr }}
            </div>
            <u-gap height="18"></u-gap>
            <div class="clearfix">
                <div class="pull-right">
                    {{
                        i18n.my.addressBalance +
                            ": " +
                            (tokenInfo.balance || aeBalance) +
                            " " +
                            (tokenInfo.tokenName || "AE")
                    }}
                </div>
            </div>
        </div>
        <u-gap height="60"></u-gap>
        <div class="ok-btn">
            <u-button type="primary" @click="transfer" :loading="btnLoading">{{
                i18n.my.transfer
            }}</u-button>
        </div>
        <u-modal
            :title="i18n.my.success"
            v-model="hashShow"
            :show-cancel-button="true"
            :cancel-text="i18n.my.close"
            :confirm-text="i18n.my.check"
            @confirm="viewHash"
        >
            <view class="slot-content"> {{ result.hash }} </view>
        </u-modal>
        <u-popup
            v-model="passwordShow"
            mode="center"
            width="80%"
            border-radius="20"
        >
            <view class="password-box">
                <u-input
                    v-model="form.password"
                    type="text"
                    :border="true"
                    :placeholder="`ak_...${token.slice(-4)} ` + i18n.login.securePassword"
                />
                <u-gap :height="30"></u-gap>
                <u-button
                    type="primary"
                    @click="startTransfer"
                    :loading="btnLoading"
                    >{{ i18n.my.send }}</u-button
                >
            </view>
        </u-popup>
    </div>
</template>

<script>
import Request from "luch-request";
const http = new Request();
import { isAddressValid } from "@aeternity/aepp-sdk/es/utils/crypto";
import { aeknow, nodeUrl } from "@/config/config.js";
import { mapGetters } from "vuex";
import UCellItem from "../../uview-ui/components/u-cell-item/u-cell-item.vue";
import UButton from "../../uview-ui/components/u-button/u-button.vue";
export default {
    components: { UCellItem, UButton },
    data() {
        return {
            title: "", //标题
            tokenInfo: {}, //token信息
            aeBalance: 0, //ae余额
            form: {
                address: "",
                money: "",
                password: "",
            },
            warning: {
                address: false,
                money: false,
            },
            btnLoading: false, //按钮状态
            hashShow: false, //合约转账成功弹层
            result: {}, //合约转正成功信息
            passwordShow: false, //密码弹层
        };
    },
    computed: {
        ...mapGetters(["token"]),
        //国际化
        i18n() {
            return this.$_i18n.messages[this.$_i18n.locale];
        },
    },
    onLoad(option) {
        this.isPassword();
        if (!!option.contractId) {
            this.tokenInfo = {
                tokenName: option.tokenName,
                contractId: option.contractId,
                balance: this.balanceFormat(option.balance),
            };
            this.title = `${this.tokenInfo.tokenName} ${this.i18n.my.transfer}`;
        } else {
            this.getAccount();
            this.title = `AE ${this.i18n.my.transfer}`;
        }
        uni.setNavigationBarTitle({
            title:this.i18n.titleBar.transfer
        });
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
        //合约转账
        async transfer() {
            if (this.form.address.slice(-6) === ".chain") {
                await this.ParsingDomainName(this.form.address);
            } else {
                const isAddress = isAddressValid(this.form.address);
                if (!this.form.address || !isAddress) {
                    this.warning.address = true;
                    return;
                } else {
                    this.warning.address = false;
                }
            }
            if (
                !this.form.money ||
                parseFloat(this.form.money) >
                    parseFloat(this.tokenInfo.balance || this.aeBalance)
            ) {
                this.warning.money = true;
                return;
            } else {
                this.warning.money = false;
            }
            if (!this.warning.address && !this.warning.money) {
                if (!!this.tokenInfo.contractId) {
                    this.compileContact();
                } else {
                    this.passwordShow = true;
                }
            }
        },
        //开始转账AE
        startTransfer() {
            this.btnLoading = true;
            setTimeout(() => {
                this.aeTransfer();
            }, 100);
        },
        //AE转账
        async aeTransfer() {
            try {
                const secretKey = await this.keystoreToSecretKey(
                    this.cryptoPassword(this.form.password)
                );
                if (!!secretKey) {
                    uni.showLoading({
                        title: this.i18n.my.loading,
                    });
                    this.btnLoading = true;
                    let client = await this.client();
                    try {
                        const res = await client.spend(
                            this.form.money * Math.pow(10, 18),
                            this.form.address
                        );
                        if (JSON.stringify(res) !== "{}" && !!res) {
                            uni.hideLoading();
                            uni.showToast({
                                icon: "success",
                                title: this.i18n.my.success,
                            });
                            this.passwordShow = false;
                            this.btnLoading = false;
                            this.getAccount();
                            this.form = {
                                address: "",
                                money: "",
                                password: "",
                            };
                        }
                    } catch (err) {
                        this.uShowToast(this.i18n.my.connectionFail);
                        this.hideLoading = false;
                        this.btnLoading = false;
                    }
                }
            } catch (err) {
                this.uShowToast(this.i18n.my.passwordErr);
                this.form.password = "";
                this.btnLoading = false;
            }
        },
        //合约转账
        async compileContact() {
            this.btnLoading = true;
            this.result = await this.contractTransfer(
                this.tokenInfo.contractId,
                this.form.address,
                this.form.money
            );
            this.form = {
                address: "",
                money: "",
            };
            this.btnLoading = false;
            this.hashShow = true;
        },
        //解析域名
        async ParsingDomainName(domainName) {
            await http
                .get(nodeUrl + "v3/names/" + domainName)
                .then((res) => {
                    if (res.data.id) {
                        if (res.data.pointers.length > 0) {
                            this.form.address = res.data.pointers[0].id;
                        } else {
                            this.form.address = res.data.owner;
                        }
                        this.warning.address = false;
                    }
                })
                .catch(() => {
                    this.warning.address = true;
                });
        },
        //获取账户AE余额
        getAccount() {
            http.get(nodeUrl + "v3/accounts/" + this.token).then((res) => {
                this.aeBalance = this.balanceFormat(res.data.balance);
            });
        },
        //查看合约调用成功后返回的交易哈希
        viewHash() {
            this.hashShow = false;
            window.open(aeknow + "/miner/viewaccount/" + this.result.hash);
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
    .slot-content {
        padding: 30rpx;
        word-wrap: break-word;
        word-break: normal;
        overflow: hidden;
    }
    .password-box {
        padding: 50rpx;
        border-radius: 20rpx;
    }
}
</style>
