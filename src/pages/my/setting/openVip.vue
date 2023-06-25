<script setup>
import { reactive, getCurrentInstance } from 'vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { useUserStore } from "@/stores/userStore";
const userStore = useUserStore();
const { proxy } = getCurrentInstance();

const vipConfig = reactive({
    isAgree: false, //是否同意
    btnLoading: false, //按钮状态
    configInfo: {}, //后端openVip配置项
    wttBalance: 0, //账户WTT余额
    isWaiting: false, //内容
})

onLoad ( () => {
    getVipConfig();
    proxy.getUserInfo();
});
//下拉刷新
onPullDownRefresh ( () => {
    getVipConfig();
    proxy.getUserInfo();
    getWttBalance();
    setTimeout(function() {
        uni.stopPullDownRefresh();
    }, 500);
});
//获取开通信息
const getVipConfig = () => {
    proxy.$http.post("/OpenVip/configInfo").then((res) => {
        if (res.code === 200) {
            vipConfig.configInfo = res.data;
            getWttBalance();
        }
    });
}
//开通
const openVip = () => {
    if (vipConfig.isAgree) {
        if (proxy.validThirdPartySource()) {
            proxy.uShowToast(
                proxy.$t('index.thirdPartyNotOpen'),
            );
            return false;
        };
        vipConfig.btnLoading = true;
        if(!vipConfig.configInfo.openVip) {
            proxy.uShowToast( proxy.$t('my.openVipPage.channel') );
            vipConfig.btnLoading = false;
            return;
        }
        if ( vipConfig.wttBalance < (vipConfig.configInfo.openVipAmount / Math.pow(10, 18)) ) {
            proxy.uShowToast( proxy.$t('my.openVipPage.balanceLow') );
            vipConfig.btnLoading = false;
            return;
        }
        proxy.$http.post("/OpenVip/state").then((res) => {
            if (res.code === 200) {
                if (res.data) {
                    proxy.uShowToast( proxy.$t('my.openVipPage.repeatOpen') );
                } else {
                    openStart();
                }
            }
        });
        vipConfig.btnLoading = false;
    } else {
        proxy.uShowToast( proxy.$t('my.openVipPage.clause') );
    }
}
//开始开通
const openStart = async () => {
    const result = await proxy.contractTransfer(
        vipConfig.configInfo.openTokenAddress,
        vipConfig.configInfo.openVipAddress,
        vipConfig.configInfo.openVipAmount / Math.pow(10, 18),
        {type:'open_vip'}
    );
    
    if (result) {
        proxy.postHashToWeTrueApi(result); //提交
        proxy.getUserInfo();
        getWttBalance();
        proxy.uShowToast(proxy.$t('my.openVipPage.waiting') , "none", 3000);
        vipConfig.isWaiting = true;
        uni.hideLoading();
    }
}
//获取WTT余额
const getWttBalance = () => {
    proxy.getTokenBalance(
        vipConfig.configInfo.openTokenAddress,
        userStore.token
    ).then((res) => {
        vipConfig.wttBalance = proxy.balanceFormat( res.toString(10) ) || 0;
    });;
}
</script>

<template>
    <view class="openvip-dig">
        <view class="icon-list" v-show="!validThirdPartySource()">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
            <u-icon
                name="home"
                class="mr-30"
                size="34"
                color="#fff"
                @click="reLaunchUrl('../../index/index')"
            ></u-icon>
        </view>
        <view class="title">{{ $t('my.openVipPage.open') }}<br />WeTrue VIP</view>
        <view class="open-openvip" v-if="!vipConfig.isWaiting && !userStore.userInfo.isVip">
            <view class="title">
                <u-image
                    width="92rpx"
                    height="46rpx"
                    src="@/static/logo.png"
                    class="inline mr-5"
                ></u-image>
                WeTrue VIP
            </view>
            <view class="content">
                <view class="text">
                    {{ $t('my.openVipPage.openText', [vipConfig.configInfo.openVipAmount / Math.pow(10, 18)]) }}
                </view>
            </view>
            <u-checkbox-group>
                <u-checkbox v-model="vipConfig.isAgree" name="agreeOpen">
                    {{ $t('my.openVipPage.agree') }}
                </u-checkbox>
            </u-checkbox-group>
            <u-gap :height="30"></u-gap>
            <u-button 
                type="primary"
                @click="openVip"
                :loading="vipConfig.btnLoading"
            >
            {{ $t('my.openVipPage.determine') }}
            </u-button
            >
            <u-gap :height="20"></u-gap>
            <view class="clearfix">
                <view class="pull-right">{{ $t('my.openVipPage.balance', [vipConfig.wttBalance]) }}</view>
            </view>
        </view>

        <view class="start-openvip" v-else>
            <view class="text">
                {{ vipConfig.isWaiting ? $t('my.openVipPage.waiting') : $t('my.openVipPage.complete') }}
            </view>
        </view>

        <view class="rule">
            <view class="h3">{{ $t('my.openVipPage.openRule') }}</view>
            <u-gap :height="10"></u-gap>
            <b>{{ $t('my.openVipPage.ruleFeeTitle') }}</b>
            <br />{{ vipConfig.configInfo.openVipAmount / Math.pow(10, 18) }} WTT.<br />
            <u-gap :height="10"></u-gap>
            <b>{{ $t('my.openVipPage.ruleBenefitsTitle') }}</b>
            <br />{{ $t('my.openVipPage.ruleBenefitsText') }}<br />
            <u-gap :height="10"></u-gap>
            <b>{{ $t('my.openVipPage.ruleExplainTitle') }}</b>
            <br />{{ $t('my.openVipPage.ruleExplainText') }}<br />
        </view>
    </view>
</template>

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
