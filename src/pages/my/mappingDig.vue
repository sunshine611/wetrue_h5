<!--质押挖矿-->
<template>
    <div class="mapping-dig">
        <div class="icon-list" v-if="!validThirdPartySource()">
            <u-icon
                name="home"
                class="mr-30"
                size="34"
                color="#fff"
                @click="reLaunchUrl('index')"
            ></u-icon>
        </div>
        <div class="title">映射AE参与挖矿<br />领取WTT</div>
        <div class="start-mapping" v-if="userInfo.isMapping">
            <fa-FontAwesome
                type="fas fa-trophy"
                size="30"
                class="trophy"
                color="#f04a82"
                @click="topShow=true"
            >
            </fa-FontAwesome>
            <div class="mapping">
                <div class="top">
                    <div class="desc">我的收益(WTT)</div>
                    <div class="earning">
                        <div class="amount">
                            <u-count-to
                                color="##f04a82"
                                :decimals="7"
                                :font-size="42"
                                :bold="true"
                                :start-val="0"
                                :end-val="balanceFormat(mappingInfo.earning, 7)"
                                v-if="mappingInfo.earning"
                            ></u-count-to>
                            <div v-else>≈0.00000000</div>
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
                    >开始映射</u-button
                >
            </div>
        </div>
        <div class="open-mapping" v-else>
            <fa-FontAwesome
                type="fas fa-trophy"
                size="30"
                class="trophy"
                color="#f04a82"
                @click="topShow=true"
            >
            </fa-FontAwesome>
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
            挖矿资格:
            需支付680WTT开通权限,所消耗WTT划转至[AE中国社区公共账户]供后续发展WTT所用<br />
            <u-gap :height="10"></u-gap>
            挖矿收益: 14.4WTT/1万AE/天,映射总量不设上限<br />
            <u-gap :height="10"></u-gap>
            收益领取:
            2天内需领取1次,超时收益不再增加,收益需大于0.1WTT才可领取<br />
            <u-gap :height="10"></u-gap>
            开放时间: 2021年7月15日至9月15日<br />
            <u-gap :height="10"></u-gap>
            规则说明:
            映射期间账户余额不得少于映射数量,否则自动取消收益及挖矿资格,需要重新支付WTT开通<br />
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
                <div class="balance-input">
                    <u-input
                        v-model="form.amount"
                        type="number"
                        :border="true"
                        placeholder="映射金额"
                        maxlength="10"
                    />
                    <u-button
                        size="mini"
                        type="primary"
                        shape="circle"
                        class="total"
                        @click="totalBalance"
                        >全部</u-button
                    >
                </div>
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
        <u-popup
            v-model="topShow"
            mode="center"
            width="85%"
            :border-radius="10"
        >
            <div class="top-content">
                <div class="title mb-40">
                    <u-image
                        width="92rpx"
                        height="46rpx"
                        src="@/static/logo.png"
                        class="inline mr-5"
                    ></u-image>
                    映射挖矿排行榜
                </div>
                <u-table>
                    <u-tr>
                        <u-th width="100rpx">排名</u-th>
                        <u-th>地址</u-th>
                        <u-th>映射AE数量</u-th>
                    </u-tr>
                    <u-tr v-for="(item,index) in topList" :key="index">
                        <u-td width="100rpx">{{index+1}}</u-td>
                        <u-td>ak_...{{item.userAddress.slice(-4)}}</u-td>
                        <u-td>{{balanceFormat(item.amount, 2)}} AE</u-td>
                    </u-tr>
                </u-table>
            </div>
        </u-popup>
        <u-modal
            v-model="blackHouseShow"
            content="您已违反规则进入小黑屋"
        ></u-modal>
    </div>
</template>

<script>
import UGap from "@/uview-ui/components/u-gap/u-gap.vue";
import { mapGetters } from "vuex";
import UButton from "@/uview-ui/components/u-button/u-button.vue";
import { getStore } from "@/util/service";
import Request from "luch-request";
const http = new Request();
import { aeknow, nodeUrl, wttContract } from "@/config/config.js";

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
            blackHouseShow: false, //黑屋提示弹层
            topList:[],//排行榜
            topShow:false,//排行榜弹层
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
    onLoad() {
        this.getUserInfo();
        this.getMappingInfo();
        this.getAccount();
        this.getWttBalance();
        this.getConfigInfo();
        this.getTop();
    },
    activated() {},
    //上拉刷新
    onPullDownRefresh() {
        this.getUserInfo();
        this.getAccount();
        this.getWttBalance();
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
                .post("/User/info", params, { custom: { isToast: true } })
                .then((res) => {
                    if (res.code === 200) {
                        this.userInfo = res.data;
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
                            this.uShowToast("开通中，请勿重复提交！");
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
                wttContract,
                this.configInfo.openMapAddress,
                this.configInfo.openMapAmount / Math.pow(10, 18)
            );
            if (result) {
                this.$http.post("/Mining/openAccount", { hash: result.hash });
                this.getUserInfo();
                this.getWttBalance();
                this.uShowToast("执行开通中，请30秒后再来！", "none", 3000);
            }
        },
        //获取映射信息
        getMappingInfo() {
            this.$http
                .post("/Mining/mapInfo", { custom: { isToast: true } })
                .then((res) => {
                    if (res.code === 200) {
                        this.mappingInfo = res.data;
                        this.blackHouseShow = this.mappingInfo.black_house;
                        if (!this.mappingInfo.state) {
                            this.getUserInfo();
                        }
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
            if (parseFloat(this.aeBalance) - parseFloat(this.form.amount) < 1) {
                this.uShowToast("映射金额请至少保留1AE！");
                return;
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
                        this.btnLoading = false;
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
            if (this.balanceFormat(this.mappingInfo.earning) < 0.1) {
                this.uShowToast("请收益大于0.1后领取！");
                return;
            }
            this.receiveLoading = true;
            this.$http.post("/Mining/earning").then((res) => {
                if (res.code === 200) {
                    this.receiveLoading = false;
                    this.uShowToast("领取成功！");
                    this.getMappingInfo();
                }
            });
        },
        //全部事件
        totalBalance() {
            if (parseInt(this.aeBalance) - 1 > 0) {
                this.form.amount = parseInt(this.aeBalance) - 1;
            } else {
                this.form.amount = 0;
            }
        },
        //获取账户AE余额
        getAccount() {
            http.get(nodeUrl + "/v3/accounts/" + this.token).then((res) => {
                this.aeBalance = this.balanceFormat(res.data.balance);
            });
        },
        //获取WTT余额
        getWttBalance() {
            http.get(`${aeknow}/api/mytoken/${this.token}/${wttContract}`).then(
                (res) => {
                    this.wttBalance = this.balanceFormat(res.data.balance);
                }
            );
        },
        //获取映射榜单
        getTop(){
            this.$http.post("/Mining/top").then((res) => {
                if (res.code === 200) {
                    this.topList=res.data;
                }
            });
        }
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
        position:relative;
        .trophy {
            position: absolute;
            right: 30rpx;
            top: 30rpx;
        }
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
                        font-weight: bold;
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
        position: relative;
        .trophy {
            position: absolute;
            right: 30rpx;
            top: 30rpx;
        }
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
        padding: 50rpx;
        border-radius: 20rpx;
        .title {
            font-size: 36rpx;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .balance-input {
            position: relative;
            .total {
                position: absolute;
                right: 14rpx;
                top: 50%;
                transform: translateY(-50%);
            }
        }
        .warnning {
            font-size: 20rpx;
            color: #f00;
            margin-top: 10rpx;
        }
    }
    .top-content {
        padding: 50rpx 40rpx;
        .title {
            font-size: 36rpx;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
}
</style>
