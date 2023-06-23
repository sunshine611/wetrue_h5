<!--质押挖矿-->
<template>
    <view class="mapping-dig">
        <view class="icon-list" v-show="!validThirdPartySource()">
        <view :style="{height:`${statusBarHeight}px`}"></view>
            <u-icon
                name="home"
                class="mr-30"
                size="34"
                color="#fff"
                @click="reLaunchUrl('index')"
            ></u-icon>
        </view>
        <view class="title">映射AE参与挖矿<br />领取WTT</view>
        <view class="start-mapping" v-if="userInfo.isVip">
            <Icon
                icon="fa:trophy"
                width="15"
                class="trophy"
                color="#f04a82"
                @click="topShow=true"
            />
            <view class="mapping">
                <view class="top">
                    <view class="desc">我的收益(WTT)</view>
                    <view class="earning">
                        <view class="amount">
                            <u-count-to
                                color="##f04a82"
                                :decimals="7"
                                :font-size="42"
                                :bold="true"
                                :start-val="0"
                                :end-val="balanceFormat(mappingInfo.earning, 7)"
                                v-if="mappingInfo.earning"
                            ></u-count-to>
                            <view v-else>≈0.00000000</view>
                        </view>
                        <view class="receive">
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
                        </view>
                    </view>
                </view>
                <view class="bottom">
                    <view class="mapping-num">
                        <view class="desc">您已映射(AE)</view>
                        <u-gap :height="10"></u-gap>
                        <view class="num">
                            {{ balanceFormat(mappingInfo.amount, 2) || "0.00" }}
                        </view>
                    </view>
                    <view class="mapping-total">
                        <view class="desc">总映射(AE)</view>
                        <u-gap :height="10"></u-gap>
                        <view class="num">
                            {{ balanceFormat(mappingInfo.total_ae, 2) || 0 }}
                        </view>
                    </view>
                </view>
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
            </view>
        </view>
        <view class="open-mapping" v-else>
            <Icon
                icon="fa:trophy"
                width="15"
                class="trophy"
                color="#f04a82"
                @click="topShow=true"
            />
            <view class="title">
                <u-image
                    width="92rpx"
                    height="46rpx"
                    src="@/static/logo.png"
                    class="inline mr-5"
                ></u-image>
                开通映射挖矿
            </view>
            <view class="content">
                <view class="text">
                    开通需支付680WTT，同意请勾选开通选项。
                </view>
            </view>
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
            <view class="clearfix">
                <view class="pull-right">WTT余额：{{ wttBalance }}WTT</view>
            </view>
        </view>
        <view class="rule">
            <view class="h3">WTT质押挖矿规则</view>
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
        </view>
        <u-popup
            v-model="showMapping"
            mode="center"
            width="80%"
            border-radius="20"
        >
            <view class="form-box">
                <view class="title">
                    <u-image
                        width="92rpx"
                        height="46rpx"
                        src="@/static/logo.png"
                        class="inline mr-5"
                    ></u-image>
                    映射AE
                </view>
                <u-gap :height="30"></u-gap>
                <view class="balance-input">
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
                </view>
                <u-gap :height="10"></u-gap>
                <view class="warnning" v-show="warning.amount">
                    {{ $t('my.balanceErr') }}
                </view>
                <view class="clearfix">
                    <view class="pull-right">账户余额：{{ aeBalance }}AE</view>
                </view>
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
            <view class="top-content">
                <view class="title mb-40">
                    <u-image
                        width="92rpx"
                        height="46rpx"
                        src="@/static/logo.png"
                        class="inline mr-5"
                    ></u-image>
                    映射挖矿排行榜
                </view>
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
            </view>
        </u-popup>
        <u-modal
            v-model="blackHouseShow"
            content="您已违反规则进入小黑屋"
        ></u-modal>
    </view>
</template>

<script>
//import { mapGetters } from "vuex"; //改pinia
import { getStore } from "@/util/service";
import Request from "luch-request";
const http = new Request();
import Backend from "@/util/backend";
import { Icon } from '@iconify/vue';

export default {
    components: {
        Icon
    },
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
        //...mapGetters(["token"]),
    },
    onLoad() {
        this.getUserInfo();
        this.getMappingInfo();
        this.getBalance();
        this.getAEX9Balance();
        this.getConfigInfo();
        this.getTop();
    },
    activated() {},
    //下拉刷新
    onPullDownRefresh() {
        this.getUserInfo();
        this.getBalance();
        this.getAEX9Balance();
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
                this.configInfo.wttContract,
                this.configInfo.openMapAddress,
                this.configInfo.openMapAmount / Math.pow(10, 18)
            );
            if (result) {
                this.$http.post("/Mining/openAccount", { hash: result.hash });
                this.getUserInfo();
                this.getAEX9Balance();
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
                this.form.amount > this.aeBalance
            ) {
                this.warning.amount = true;
                return;
            } else {
                this.warning.amount = false;
            }
            if (this.aeBalance - this.form.amount < 1) {
                this.uShowToast("映射金额请至少保留1AE");
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
                        this.uShowToast("映射成功");
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
                    this.uShowToast("取消映射成功");
                }
            });
        },
        //领取映射奖励
        receive() {
            if (this.balanceFormat(this.mappingInfo.earning) < 0.1) {
                this.uShowToast("请收益大于0.1后领取");
                return;
            }
            this.receiveLoading = true;
            this.$http.post("/Mining/earning").then((res) => {
                if (res.code === 200) {
                    this.receiveLoading = false;
                    this.uShowToast("领取成功");
                    this.getMappingInfo();
                }
            });
        },
        //全部事件
        totalBalance() {
            if (this.aeBalance - 1 > 0) {
                this.form.amount = this.aeBalance - 1;
            } else {
                this.form.amount = 0;
            }
        },
        //获取账户AE余额
        getBalance() {
            this.getAeBalance().then((res) => {
                this.aeBalance = res;
            });
        },
        //获取AEX9余额
        getAEX9Balance() {
            this.getTokenBalance(
                this.configInfo.wttContract,
                this.token
            ).then((res) => {
                this.wttBalance = this.balanceFormat( res ) || 0;
            });
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
