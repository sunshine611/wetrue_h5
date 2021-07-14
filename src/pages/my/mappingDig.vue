<!--质押挖矿-->
<template>
    <div class="mapping-dig">
        <div class="icon-list">
            <u-icon
                name="home"
                class="mr-30"
                size="34"
                color="#fff"
                @click="reLaunchUrl('index')"
            ></u-icon>
        </div>
        <div class="title">映射AE参与挖矿<br />领取WTT</div>
        <div class="start-mapping" v-if="userInfo.is_map">
            <div class="mapping">
                <div class="top">
                    <div class="desc">我的收益(WTT)</div>
                    <div class="earning">
                        <div class="amount">
                            {{
                                balanceFormat(mappingInfo.earning, 6) ||
                                    "≈0.00000000"
                            }}
                        </div>
                        <div class="receive">
                            <u-button
                                v-if="mappingInfo.state"
                                type="primary"
                                @click="receive"
                                :loading="receiveLoading"
                                :plain="true"
                                shape="circle"
                                size="mini"
                                >领取</u-button
                            >
                        </div>
                    </div>
                </div>
                <div class="bottom">
                    <div class="mapping-num">
                        <div class="desc">您已映射(AE)</div>
                        <u-gap :height="10"></u-gap>
                        <div class="num">
                            {{ balanceFormat(mappingInfo.amount, 2) || "0.00" }}
                        </div>
                    </div>
                    <div class="mapping-total">
                        <div class="desc">总映射(AE)</div>
                        <u-gap :height="10"></u-gap>
                        <div class="num">
                            {{ balanceFormat(mappingInfo.total_ae, 2) || 0 }}
                        </div>
                    </div>
                </div>
                <u-button
                    v-if="mappingInfo.state"
                    type="primary"
                    :plain="true"
                    shape="circle"
                    @click="cancalMapping"
                    :loading="btnLoading"
                    >取消映射</u-button
                >
                <u-button
                    v-else
                    shape="circle"
                    type="primary"
                    @click="showMapping = true"
                    :loading="btnLoading"
                    >映射</u-button
                >
            </div>
        </div>
        <div class="open-mapping" v-else>
            <div class="title">
                <u-image
                    width="92rpx"
                    height="46rpx"
                    src="@/static/logo.png"
                    class="inline mr-5"
                ></u-image>
                开通映射挖矿
            </div>
            <div class="content">
                <div class="text">
                    开通需支付680WTT，同意请勾选开通选项。
                </div>
            </div>
            <u-checkbox-group>
                <u-checkbox v-model="isAgree" name="同意开通"
                    >同意开通</u-checkbox
                >
            </u-checkbox-group>
            <u-gap :height="30"></u-gap>
            <u-button type="primary" @click="open" :loading="btnLoading"
                >开通</u-button
            >
            <u-gap :height="20"></u-gap>
            <div class="clearfix">
                <div class="pull-right">WTT余额：{{ wttBalance }}WTT</div>
            </div>
        </div>
        <div class="rule">
            <div class="h3">WTT质押挖矿规则</div>
            <u-gap :height="10"></u-gap>
            挖矿资格: 需支付680WTT开通权限,所消耗WTT划转至[AE中国社区公共账户]供后续发展WTT所用<br />
            <u-gap :height="10"></u-gap>
            挖矿收益: 14.4WTT/1万AE/天,映射总量不设上限<br />
            <u-gap :height="10"></u-gap>
            收益领取: 2天内需领取1次,超时收益不再增加<br />
            <u-gap :height="10"></u-gap>
            开放时间: 2021年7月15日至9月15日<br />
            <u-gap :height="10"></u-gap>
            规则说明: 映射期间账户余额不得少于映射数量,否则自动取消收益及挖矿资格,需要重新支付WTT开通<br />
            <u-gap :height="10"></u-gap>
            补充说明: 可同时叠加其它AE映射挖矿,实现多重收益
        </div>
        <u-popup
            v-model="showMapping"
            mode="center"
            width="80%"
            border-radius="20"
        >
            <view class="form-box">
                <div class="title">
                    <u-image
                        width="92rpx"
                        height="46rpx"
                        src="@/static/logo.png"
                        class="inline mr-5"
                    ></u-image>
                    映射AE
                </div>
                <u-gap :height="30"></u-gap>
                <u-input
                    v-model="form.amount"
                    type="text"
                    :border="true"
                    placeholder="映射金额"
                    maxlength="10"
                />
                <u-gap :height="10"></u-gap>
                <div class="warnning" v-show="warning.amount">
                    {{ i18n.my.balanceErr }}
                </div>
                <div class="clearfix">
                    <div class="pull-right">账户余额：{{ aeBalance }}AE</div>
                </div>
                <u-gap :height="30"></u-gap>
                <u-button type="primary" @click="mapping" :loading="btnLoading"
                    >确定</u-button
                >
            </view>
        </u-popup>
    </div>
</template>

<script>
import UGap from "../../uview-ui/components/u-gap/u-gap.vue";
import { mapGetters } from "vuex";
import UButton from "../../uview-ui/components/u-button/u-button.vue";
import { getStore } from "@/util/service";
import Request from "@/js_sdk/luch-request/luch-request/index.js";
const http = new Request();
import { aeknow, nodeUrl } from "@/config/config.js";
export default {
    components: { UGap, UButton },
    data() {
        return {
            userInfo: {}, //用户信息
            isAgree: false, //是否同意
            btnLoading: false, //按钮状态
            receiveLoading: false, //领取收益按钮状态
            mappingInfo: {}, //映射信息
            configInfo: getStore("configInfo"), //后端配置项
            showMapping: false, //映射弹层
            form: {
                amount: "", //映射金额
            },
            aeBalance: 0, //账户AE余额
            wttBalance: 0, //账户AE余额
            warning: {
                amount: false,
            }, //警报
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
        this.getUserInfo();
        this.getAccount();
        this.getWttBalance();
    },
    activated() {
        this.getUserInfo();
        this.getAccount();
        this.getWttBalance();
    },
    //上拉刷新
    onPullDownRefresh() {
        this.getUserInfo();
        setTimeout(function() {
            uni.stopPullDownRefresh();
        }, 500);
    },
    methods: {
        //获取用户信息
        getUserInfo() {
            let params = {
                userAddress: this.token,
            };
            this.$http
                .post("/User/info", params)
                .then((res) => {
                    if (res.code === 200) {
                        this.userInfo = res.data;
                    }
                })
                .then(() => {
                    if (this.userInfo.is_map) {
                        this.getMappingInfo();
                    }
                });
        },
        //开通映射挖矿
        open() {
            if (this.isAgree) {
                this.btnLoading = true;
                this.$http.post("/Mining/submitState").then((res) => {
                    if (res.code === 200) {
                        if (res.data) {
                            this.uShowToast("您已经开通过了，请等待区块确认！");
                        } else {
                            this.startOpen();
                        }
                    }
                });
                this.btnLoading = false;
            } else {
                this.uShowToast("请先勾选同意开通！");
            }
        },
        //开始开通
        async startOpen() {
            const result = await this.contractTransfer(
                "ct_uGk1rkSdccPKXLzS259vdrJGTWAY9sfgVYspv6QYomxvWZWBM",
                this.configInfo.openMapAddress,
                this.configInfo.openMapAmount / Math.pow(10, 18)
            );
            if (result) {
                this.$http.post("/Mining/openAccount", { hash: result.hash });
                this.getUserInfo();
                this.uShowToast("开通成功，请过会刷新页面！");
            }
        },
        //获取映射信息
        getMappingInfo() {
            this.$http.post("/Mining/mapInfo").then((res) => {
                if (res.code === 200) {
                    this.mappingInfo = res.data;
                }
            });
        },
        //映射
        mapping() {
            if (
                !this.form.amount ||
                parseFloat(this.form.amount) > parseFloat(this.aeBalance)
            ) {
                this.warning.amount = true;
                return;
            } else {
                this.warning.amount = false;
            }
            this.btnLoading = true;
            this.$http
                .post("/Mining/mapping", {
                    amount: this.form.amount * Math.pow(10, 18),
                })
                .then((res) => {
                    if (res.code === 200) {
                        this.getMappingInfo();
                        this.showMapping = false;
                        this.btnLoading = false;
                        this.uShowToast("映射成功！");
                    } else {
                        this.uShowToast(res.msg);
                    }
                });
        },
        //取消映射
        cancalMapping() {
            this.btnLoading = true;
            this.$http.post("/Mining/unMapping").then((res) => {
                if (res.code === 200) {
                    this.getMappingInfo();
                    this.btnLoading = false;
                    this.uShowToast("取消映射成功！");
                }
            });
        },
        //领取映射奖励
        receive() {
            this.receiveLoading = true;
            this.$http.post("/Mining/earning").then((res) => {
                if (res.code === 200) {
                    this.receiveLoading = false;
                    this.uShowToast("领取成功！");
                    this.getMappingInfo();
                }
            });
        },
        //获取账户AE余额
        getAccount() {
            http.get(nodeUrl + "v2/accounts/" + this.token).then((res) => {
                this.aeBalance = this.balanceFormat(res.data.balance);
            });
        },
        //获取WTT余额
        getWttBalance() {
            http.get(
                `${aeknow}api/mytoken/${this.token}/ct_uGk1rkSdccPKXLzS259vdrJGTWAY9sfgVYspv6QYomxvWZWBM`
            ).then((res) => {
                this.wttBalance = this.balanceFormat(res.data.balance);
            });
        },
    },
};
</script>
<style lang="scss" scoped>
page {
    background-color: #7e2054;
}
.mapping-dig {
    background: url("@/static/mapping_bg.jpg") no-repeat;
    background-size: 100%;
    display: flex;
    justify-content: center;
    flex-flow: wrap;
    position: relative;
    .icon-list {
        position: absolute;
        right: 0rpx;
        top: 30rpx;
    }
    & > .title {
        position: absolute;
        top: 150rpx;
        left: 10%;
        font-size: 46rpx;
        font-weight: 600;
        color: #fff;
        line-height: 70rpx;
    }
    .start-mapping {
        margin-top: 400rpx;
        background: #fff;
        width: 80%;
        min-height: 400rpx;
        border-radius: 30rpx;
        padding: 40rpx;
        box-sizing: border-box;
        .title {
            font-size: 36rpx;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .mapping {
            .desc {
                color: #666;
            }
            .top {
                border-bottom: 1px solid #eee;
                .earning {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin: 10rpx 0 30rpx 0;
                    .amount {
                        color: #f04a82;
                        font-size: 42rpx;
                        font-weight: 600;
                    }
                }
            }
            .bottom {
                padding: 30rpx 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                .num {
                    color: #000;
                    font-size: 42rpx;
                    font-weight: 600;
                }
            }
        }
    }
    .open-mapping {
        margin-top: 400rpx;
        background: #fff;
        width: 80%;
        min-height: 400rpx;
        border-radius: 30rpx;
        padding: 40rpx;
        box-sizing: border-box;
        .title {
            font-size: 36rpx;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .content {
            .text {
                margin: 40rpx 0 20rpx;
            }
        }
    }
    .rule {
        color: #d1d1d1;
        width: 80%;
        padding: 50rpx 0;
        line-height: 40rpx;
        font-size: 24rpx;
        .h3 {
            color: #d1d1d1;
            font-size: 28rpx;
            font-weight: 600;
        }
    }
    .form-box {
        .title {
            font-size: 36rpx;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        padding: 50rpx;
        border-radius: 20rpx;
        .warnning {
            font-size: 20rpx;
            color: #f00;
            margin-top: 10rpx;
        }
    }
}
</style>
