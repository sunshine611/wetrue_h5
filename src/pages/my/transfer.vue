<template>
    <div class="transfer">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-navbar :is-fixed="false" :title="title" v-show="!validThirdPartySource()">
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
            <div class="form-title">{{ $t('my.recipient') }}：</div>
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
                {{ $t('my.addressErr') }}
            </div>
        </div>
        <u-gap height="20"></u-gap>
        <div class="form">
            <div class="form-title">{{ $t('my.amount') }}：</div>
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
                {{ $t('my.balanceErr') }}
            </div>
            <u-gap height="18"></u-gap>
            <div class="clearfix">
                <div class="pull-right">
                    {{
                        $t('my.addressBalance') +
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
            <u-button type="primary" @click="transfer" :loading="btnLoading">
                {{ $t('my.transfer') }}
            </u-button>
        </div>
        <u-modal
            :title="$t('my.success')"
            v-model="hashShow"
            :show-cancel-button="true"
            :cancel-text="$t('my.close')"
            :confirm-text="$t('my.check')"
            @confirm="viewHash"
        >
            <view class="slot-content"> {{ result ? result.hash : "noHash" }} </view>
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
                    :placeholder="`ak_...${token.slice(-4)} ` + $t('login.securePassword')"
                />
                <u-gap :height="30"></u-gap>
                <u-button
                    type="primary"
                    @click="startTransfer"
                    :loading="btnLoading"
                    >{{ $t('my.send') }}</u-button
                >
            </view>
        </u-popup>
    </div>
</template>

<script>
import Request from "luch-request";
const http = new Request();
//import {  } from "@aeternity/aepp-sdk/es/utils/crypto";
import Backend from "@/util/backend";
import { mapGetters } from "vuex";
import { AE_AMOUNT_FORMATS, encode, Encoding, isAddressValid } from '@aeternity/aepp-sdk';

export default {
    components: {

    },
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
            result: {}, //合约转账成功信息
            passwordShow: false, //密码弹层
        };
    },
    computed: {
        ...mapGetters(["token"]),
    },
    onLoad(option) {
        this.isPassword();
        if (!!option.contractId) {
            this.tokenInfo = {
                tokenName: option.tokenName,
                contractId: option.contractId,
                balance: this.balanceFormat(option.balance),
            };
            this.title = `${this.tokenInfo.tokenName + " " +this.$t('my.transfer')}`;
            this.getAEX9Balance()
        } else {
            this.getAccount();
            this.title = `AE ${this.$t('my.transfer')}`;
        }
        this.uSetBarTitle(this.title);
    },
    activated() {

    },
    //下拉刷新
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
                        title: this.$t('my.loading'),
                    });
                    this.btnLoading = true;
                    try {
                        const aeSdk = await this.initSdk();
                        const option = {   
                            denomination: AE_AMOUNT_FORMATS.AE,
                            payload: encode(new TextEncoder().encode('WeTrue Wallet'), Encoding.Bytearray)
                        }
                        const res = await aeSdk.spend(
                            this.form.money,
                            this.form.address,
                            option
                        );
                        const tx = res.tx;
                        if (tx !== {} && !!tx) {
                            uni.hideLoading();
                            uni.showToast({
                                icon: "success",
                                title: this.$t('my.success'),
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
                        this.uShowToast(this.$t('my.connectionFail'));
                        this.hideLoading = false;
                        this.btnLoading = false;
                    }
                }
            } catch (err) {
                this.uShowToast(this.$t('my.passwordErr'));
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
            this.getAEX9Balance();
        },
        //解析域名
        async ParsingDomainName(domainName) {
            await http
                .get(Backend.nodeApiNames(domainName))
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
            http.get(Backend.nodeApiAccounts(this.token)).then((res) => {
                this.aeBalance = this.balanceFormat(res.data.balance);
            });
        },
        //获取AEX9余额
        getAEX9Balance() {
            this.getTokenBalance(
                this.tokenInfo.contractId,
                this.token
            ).then((res) => {
                this.tokenInfo.balance = this.balanceFormat( res.toString(10) ) || 0;
            });;
        },
        //查看合约调用成功后返回的交易哈希
        viewHash() {
            this.hashShow = false;
            window.open(Backend.viewExplorerUrl(this.result.hash));
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
