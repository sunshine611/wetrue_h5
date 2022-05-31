<!--迁移Token-->
<template>
    <div class="migrate-token">
        <div class="icon-list" v-show="!validThirdPartySource()">
        <view :style="{height:`${statusBarHeight}px`}"></view>
            <u-icon
                name="home"
                class="mr-30"
                size="34"
                color="#fff"
                @click="reLaunchUrl('index')"
            ></u-icon>
        </div>
        <div class="title">映射迁移 WET<br />兑换 WTT</div>
        <div class="start-migrate">
            <fa-FontAwesome
                type="fas fa-retweet"
                size="36"
                class="trophy"
                color="#f04a82"
                @click="retweet"
            >
            </fa-FontAwesome>
            <div class="migrate">
                <div class="top">
                    <div class="desc">全网未迁移(WTT)</div>
                    <div class="earning">
                        <div class="amount">
                            <u-count-to
                                color="##f04a82"
                                :decimals="3"
                                :font-size="42"
                                :bold="true"
                                :start-val="0"
                                :end-val="migrateBalance"
                            ></u-count-to>
                        </div>
                    </div>
                </div>
                <div class="bottom">
                    <div class="migrate-num">
                        <div class="desc">可迁移(WET)</div>
                        <u-gap :height="10"></u-gap>
                        <div class="num">
                            {{ balanceFormat(wetBalance) || "0.0000" }}
                        </div>
                    </div>
                    <div class="migrate-total">
                        <div class="desc">余额(WTT)</div>
                        <u-gap :height="10"></u-gap>
                        <div class="num">
                            {{ balanceFormat(wttBalance) || "0.0000" }}
                        </div>
                    </div>
                </div>
                <u-button
                    shape="circle"
                    type="primary"
                    @click="showMigrate = true"
                    :loading="btnLoading"
                    >开始迁移</u-button
                >
            </div>
        </div>
        <div class="rule">
            <div class="h3">映射迁移说明</div>
            <u-gap :height="10"></u-gap>
            WET是什么: 
                    为了更好区分,原WTT更名WET(以下称WET)<br />
            <u-gap :height="10"></u-gap>
            为何迁移:
                    WeTrue 升级及后续功能开发所需<br />
            <u-gap :height="10"></u-gap>
            迁移资格:
                    持有WET用户,本次迁移为1:1迁移映射<br />
            <u-gap :height="10"></u-gap>
            为何不自动映射迁移:
                    考虑到现有WET用户数、持有复杂度、规模等已不适合,因此额外开发迁移程序<br />
            <u-gap :height="10"></u-gap>
            迁移时间: 
                    迁移上线即日起不低于1年<br />
            <u-gap :height="10"></u-gap>
            补充说明: 
                    准确余额更新需1个链上确认数。成功迁移WTT,同等数量WET将被回收
        </div>
        <u-popup
            v-model="showMigrate"
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
                    迁移WET到WTT
                </div>
                <u-gap :height="30"></u-gap>
                <div class="balance-input">
                    <u-input
                        v-model="form.amount"
                        type="number"
                        :border="true"
                        placeholder="迁移金额"
                        maxlength="15"
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
                    {{ $t('my.balanceErr') }}
                </div>
                <div class="clearfix">
                    <div class="pull-right">余额：{{ balanceFormat(wetBalance) }} WET</div>
                </div>
                <u-gap :height="30"></u-gap>
                <u-button type="primary" @click="migrate" :loading="btnLoading"
                    >确定</u-button
                >
            </view>
        </u-popup>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import { getStore } from "@/util/service";
import Request from "luch-request";
const http = new Request();

export default {
    components: {

    },
    data() {
        return {
            userInfo: {}, //用户信息
            btnLoading: false, //按钮状态
            configInfo: getStore("configInfo"), //后端配置项
            showMigrate: false, //迁移弹层
            form: {
                amount: "", //映射金额
            },
            wetBalance: 0, //账户WET余额
            wttBalance: 0, //账户WTT余额
            migrateBalance: 0, //迁移总数
            warning: {
                amount: false,
            }, //警报

        };
    },
    computed: {
        ...mapGetters(["token"]),
    },
    onLoad() {
        this.getConfigInfo();
        this.getMigrateWttBalance();
        this.getWttBalance();
        this.getWetBalance();
    },
    activated() {},
    //下拉刷新
    onPullDownRefresh() {
        this.getMigrateWttBalance();
        this.getWttBalance();
        this.getWetBalance();
        setTimeout(function() {
            uni.stopPullDownRefresh();
        }, 500);
    },
    methods: {
        //获取WET余额
        getWetBalance() {
            this.getTokenBalance(
                this.configInfo.oldWttContract,
                this.token
            ).then((res) => {
                this.wetBalance = res.toString(10) || 0;
            });;
        },
        //获取WTT余额
        getWttBalance() {
            this.getTokenBalance(
                this.configInfo.wttContract,
                this.token
            ).then((res) => {
                this.wttBalance = res.toString(10) || 0;
            });;
        },
        //获取已迁移WTT
        getMigrateWttBalance() {
            this.getTokenBalance(
                this.configInfo.wttContract,
                "ak" + this.configInfo.migrateContract.slice(2)
            ).then((res) => {
                this.migrateBalance = this.balanceFormat( res.toString(10) ) || 0;
            });;
        },
        //全部事件
        totalBalance() {
            if (parseInt(this.balanceFormat(this.wetBalance)) > 0) {
                this.form.amount = this.balanceFormat(this.wetBalance);
            } else {
                this.form.amount = 0;
            }
        },
        //迁移
        migrate() {
            if (this.validThirdPartySource()) {
                this.uShowToast(
                    this.$t('index.thirdPartyNotOpen'),
                );
                return false;
            };
            if ( !this.form.amount || this.form.amount > this.balanceFormat(this.wetBalance) ) {
                this.warning.amount = true;
                return;
            } else {
                this.warning.amount = false;
            }
            this.btnLoading = true;
             //开始迁移
            this.contractMigrate(
                this.configInfo.migrateContract,
                this.configInfo.oldWttContract,
                this.token,
                parseFloat(this.form.amount)
            ).then((res) => {
                if (res) {
                    this.uShowToast("成功,约3分钟更新余额");
                    this.showMigrate = false;
                    this.btnLoading = false;
                    this.getMigrateWttBalance()
                    this.getWetBalance()
                    this.getWttBalance()
                } else {
                    this.uShowToast("失败");
                    this.btnLoading = false;
                }
            });
        },
        //更新余额
        retweet() {
            this.wetBalance = 0 //账户WET余额
            this.wttBalance = 0 //账户WTT余额
            this.migrateBalance = 0 //迁移总数
            this.getConfigInfo();
            this.getMigrateWttBalance();
            this.getWttBalance();
            this.getWetBalance();
            this.uShowToast("余额更新中");
        },
    },
};
</script>
<style lang="scss" scoped>
page {
    background-color: #000;
}
.migrate-token {
    background: url("@/static/migrate_bg.png") no-repeat;
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
    .start-migrate {
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
        .migrate {
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
}
</style>
