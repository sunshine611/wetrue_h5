<!--质押挖矿-->
<template>
    <div class="openvip-dig">
        <div class="icon-list" v-show="!validThirdPartySource()">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
            <u-icon
                name="home"
                class="mr-30"
                size="34"
                color="#fff"
                @click="reLaunchUrl('../../index/index')"
            ></u-icon>
        </div>
        <div class="title">{{ $t('my.openVipPage.open') }}<br />WeTrue VIP</div>
        <div class="open-openvip" v-if="!isWaiting && !userInfo.isVip">
            <div class="title">
                <u-image
                    width="92rpx"
                    height="46rpx"
                    src="@/static/logo.png"
                    class="inline mr-5"
                ></u-image>
                WeTrue VIP
            </div>
            <div class="content">
                <div class="text">
                    {{ $t('my.openVipPage.openText', [configInfo.openVipAmount / Math.pow(10, 18)]) }}
                </div>
            </div>
            <u-checkbox-group>
                <u-checkbox v-model="isAgree" name="agreeOpen">
                    {{ $t('my.openVipPage.agree') }}
                </u-checkbox>
            </u-checkbox-group>
            <u-gap :height="30"></u-gap>
            <u-button 
                type="primary"
                @click="openVip"
                :loading="btnLoading"
            >
            {{ $t('my.openVipPage.determine') }}
            </u-button
            >
            <u-gap :height="20"></u-gap>
            <div class="clearfix">
                <div class="pull-right">{{ $t('my.openVipPage.balance', [wttBalance]) }}</div>
            </div>
        </div>

        <div class="start-openvip" v-else>
            <div class="text">
                {{ isWaiting ? $t('my.openVipPage.waiting') : $t('my.openVipPage.complete') }}
            </div>
        </div>

        <div class="rule">
            <div class="h3">{{ $t('my.openVipPage.openRule') }}</div>
            <u-gap :height="10"></u-gap>
            <b>{{ $t('my.openVipPage.ruleFeeTitle') }}</b>
            <br />{{ configInfo.openVipAmount / Math.pow(10, 18) }} WTT.<br />
            <u-gap :height="10"></u-gap>
            <b>{{ $t('my.openVipPage.ruleBenefitsTitle') }}</b>
            <br />{{ $t('my.openVipPage.ruleBenefitsText') }}<br />
            <u-gap :height="10"></u-gap>
            <b>{{ $t('my.openVipPage.ruleExplainTitle') }}</b>
            <br />{{ $t('my.openVipPage.ruleExplainText') }}<br />
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    components: {

    },
    data() {
        return {
            userInfo: {}, //用户信息
            isAgree: false, //是否同意
            btnLoading: false, //按钮状态
            configInfo: {}, //后端openVip配置项
            wttBalance: 0, //账户WTT余额
            isWaiting: false, //内容
        };
    },
    computed: {
        ...mapGetters(["token"]),
    },
    onLoad() {
        this.getConfigInfo();
        this.getUserInfo();
    },
    //下拉刷新
    onPullDownRefresh() {
        this.getConfigInfo();
        this.getUserInfo();
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
        //获取开通信息
        getConfigInfo() {
            this.$http
                .post("/OpenVip/configInfo").then((res) => {
                    if (res.code === 200) {
                        this.configInfo = res.data;
                        this.getWttBalance();
                    }
                });
        },
        //开通
        openVip() {
            if (this.isAgree) {
                this.btnLoading = true;
                if(!this.configInfo.openVip) {
                    this.uShowToast( this.$t('my.openVipPage.channel') );
                    this.btnLoading = false;
                    return;
                }
                if ( this.wttBalance < (this.configInfo.openVipAmount / Math.pow(10, 18)) ) {
                    this.uShowToast( this.$t('my.openVipPage.balanceLow') );
                    this.btnLoading = false;
                    return;
                }
                this.$http.post("/OpenVip/state").then((res) => {
                    if (res.code === 200) {
                        if (res.data) {
                            this.uShowToast( this.$t('my.openVipPage.repeatOpen') );
                        } else {
                            this.openStart();
                        }
                    }
                });
                this.btnLoading = false;
            } else {
                this.uShowToast( this.$t('my.openVipPage.clause') );
            }
        },
        //开始开通
        async openStart() {
            const result = await this.contractTransfer(
                this.configInfo.openTokenAddress,
                this.configInfo.openVipAddress,
                this.configInfo.openVipAmount / Math.pow(10, 18),
                {type:'open_vip'}
            );
            
            if (result) {
                this.postHashToWeTrue(result); //打赏提交
                this.getUserInfo();
                this.getWttBalance();
                this.uShowToast(this.$t('my.openVipPage.waiting') , "none", 3000);
                this.isWaiting = true;
                uni.hideLoading();
            }
        },
        //获取WTT余额
        getWttBalance() {
            this.getTokenBalance(
                this.configInfo.openTokenAddress,
                this.token
            ).then((res) => {
                this.wttBalance = this.balanceFormat( res.toString(10) ) || 0;
            });;
        },
    },
};
</script>
<style lang="scss" scoped>
page {
    background-color: #beb8c8;
}
.openvip-dig {
    background: url("@/static/openvip_bg.png") no-repeat;
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
    .start-openvip {
        margin-top: 400rpx;
        background: #fff;
        width: 80%;
        min-height: 200rpx;
        border-radius: 30rpx;
        padding: 80rpx;
        box-sizing: border-box;
        position:relative;
        .text {
            font-size: 32rpx;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
    .open-openvip {
        margin-top: 400rpx;
        background: #fff;
        width: 80%;
        min-height: 400rpx;
        border-radius: 30rpx;
        padding: 40rpx;
        box-sizing: border-box;
        position: relative;
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
        color: #000;
        width: 80%;
        padding: 50rpx 0;
        line-height: 50rpx;
        font-size: 24rpx;
        .h3 {
            color: #604fff;
            font-size: 28rpx;
            font-weight: 600;
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
