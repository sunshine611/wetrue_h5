<script setup>
import { reactive, getCurrentInstance } from 'vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { mixinUtils } from'@/mixins/mixinUtils'
import { useUserStore } from "@/stores/userStore";
import Request from "luch-request";
const http = new Request();
import Backend from "@/util/backend";
import { AE_AMOUNT_FORMATS, encode, Encoding, isAddressValid } from '@aeternity/aepp-sdk';
const { proxy } = getCurrentInstance();
const userStore = useUserStore();

const myTransfer = reactive({
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
})

onLoad ( (option) => {
    proxy.isPassword();
    if (!!option.contractId) {
        myTransfer.tokenInfo = {
            tokenName: option.tokenName,
            contractId: option.contractId,
            balance: proxy.balanceFormat(option.balance),
        };
        myTransfer.title = `${myTransfer.tokenInfo.tokenName + " " +proxy.$t('my.transfer')}`;
        getAEX9Balance()
    } else {
        getAeBalance();
        myTransfer.title = `AE ${proxy.$t('my.transfer')}`;
    }
    proxy.uSetBarTitle(myTransfer.title);
})

//下拉刷新
onPullDownRefresh ( () => {
    getAeBalance();
    setTimeout(function() {
        uni.stopPullDownRefresh();
    }, 500);
})

//合约转账
const transfer = async() => {
    if (myTransfer.form.address.slice(-6) === ".chain") {
        await ParsingDomainName(myTransfer.form.address);
    } else {
        const isAddress = isAddressValid(myTransfer.form.address);
        if (!myTransfer.form.address || !isAddress) {
            myTransfer.warning.address = true;
            return;
        } else {
            myTransfer.warning.address = false;
        }
    }
    if (
        !myTransfer.form.money ||
        parseFloat(myTransfer.form.money) >
            parseFloat(myTransfer.tokenInfo.balance || myTransfer.aeBalance)
    ) {
        myTransfer.warning.money = true;
        return;
    } else {
        myTransfer.warning.money = false;
    }
    if (!myTransfer.warning.address && !myTransfer.warning.money) {
        if (!!myTransfer.tokenInfo.contractId) {
            compileContact();
        } else {
            myTransfer.passwordShow = true;
        }
    }
}
//开始转账AE
const startTransfer = () => {
    myTransfer.btnLoading = true;
    setTimeout(() => {
        aeTransfer();
    }, 100);
}
//AE转账
const aeTransfer = async() => {
    try {
        const secretKey = await proxy.keystoreToSecretKey(
            mixinUtils.cryptoPassword(myTransfer.form.password)
        );
        if (!!secretKey) {
            uni.showLoading({
                title: proxy.$t('my.loading'),
            });
            myTransfer.btnLoading = true;
            try {
                const aeSdk = await proxy.initSdk();
                const option = {   
                    denomination: AE_AMOUNT_FORMATS.AE,
                    payload: encode(new TextEncoder().encode('WeTrue Wallet'), Encoding.Bytearray)
                }
                const res = await aeSdk.spend(
                    myTransfer.form.money,
                    myTransfer.form.address,
                    option
                );
                const tx = res.tx;
                if (tx !== {} && !!tx) {
                    uni.hideLoading();
                    uni.showToast({
                        icon: "success",
                        title: proxy.$t('my.success'),
                    });
                    myTransfer.passwordShow = false;
                    myTransfer.btnLoading = false;
                    getAeBalance();
                    myTransfer.form = {
                        address: "",
                        money: "",
                        password: "",
                    };
                }
            } catch (err) {
                proxy.uShowToast(proxy.$t('my.connectionFail'));
                uni.hideLoading = false;
                myTransfer.btnLoading = false;
            }
        }
    } catch (err) {
        proxy.uShowToast(proxy.$t('my.passwordErr'));
        myTransfer.form.password = "";
        myTransfer.btnLoading = false;
    }
}
//合约转账
const compileContact = async() => {
    myTransfer.btnLoading = true;
    myTransfer.result = await proxy.contractTransfer(
        myTransfer.tokenInfo.contractId,
        myTransfer.form.address,
        myTransfer.form.money
    );
    myTransfer.form = {
        address: "",
        money: "",
    };
    myTransfer.btnLoading = false;
    myTransfer.hashShow = true;
    getAEX9Balance();
}
//解析域名
const ParsingDomainName = async(domainName) => {
    await http.get(Backend.nodeApiNames(domainName)).then((res) => {
        if (res.data.id) {
            if (res.data.pointers.length > 0) {
                myTransfer.form.address = res.data.pointers[0].id;
            } else {
                myTransfer.form.address = res.data.owner;
            }
            myTransfer.warning.address = false;
        }
    })
    .catch(() => {
        myTransfer.warning.address = true;
    });
}
//获取账户AE余额
const getAeBalance = () => {
    proxy.getAeBalance().then((res) => {
        myTransfer.aeBalance = res;
    });
}
//获取AEX9余额
const getAEX9Balance = () => {
    proxy.getTokenBalance(
        myTransfer.tokenInfo.contractId,
        userStore.token
    ).then((res) => {
        myTransfer.tokenInfo.balance = proxy.balanceFormat( res ) || 0;
    });
}
//查看合约调用成功后返回的交易哈希
const viewHash = () => {
    myTransfer.hashShow = false;
    window.open(Backend.viewExplorerUrl(myTransfer.result.hash));
}
</script>

<template>
    <view class="transfer">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-navbar :is-fixed="false" :title="myTransfer.title" v-show="!validThirdPartySource()">
            <template v-slot:right>
                <u-icon
                    name="home"
                    class="mr-30"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('index')"
                ></u-icon>
            </template>
        </u-navbar>
        <u-gap height="20"></u-gap>
        <view class="form">
            <view class="form-title">{{ $t('my.recipient') }}：</view>
            <u-gap height="14"></u-gap>
            <u-input
                v-model="myTransfer.form.address"
                type="textarea"
                class="textarea"
                :clearable="true"
                height="80"
                :custom-style="{ padding: '15rpx' }"
                placeholder="ak_ … or name.chain"
                maxlength="100"
            />
            <view class="warnning" v-show="myTransfer.warning.address">
                {{ $t('my.addressErr') }}
            </view>
        </view>
        <u-gap height="20"></u-gap>
        <view class="form">
            <view class="form-title">{{ $t('my.amount') }}：</view>
            <u-gap height="14"></u-gap>
            <u-input
                v-model="myTransfer.form.money"
                type="number"
                class="textarea"
                :clearable="false"
                :custom-style="{ padding: '0 15rpx' }"
                placeholder="Amount"
                maxlength="20"
            />
            <view class="warnning" v-show="myTransfer.warning.money">
                {{ $t('my.balanceErr') }}
            </view>
            <u-gap height="18"></u-gap>
            <view class="clearfix">
                <view class="pull-right">
                    {{
                        $t('my.addressBalance') +
                        ": " +
                        (myTransfer.tokenInfo.balance || myTransfer.aeBalance) +
                        " " +
                        (myTransfer.tokenInfo.tokenName || "AE")
                    }}
                </view>
            </view>
        </view>
        <u-gap height="60"></u-gap>
        <view class="ok-btn">
            <u-button type="primary" @click="transfer" :loading="myTransfer.btnLoading">
                {{ $t('my.transfer') }}
            </u-button>
        </view>
        <u-modal
            :title="$t('my.success')"
            v-model="myTransfer.hashShow"
            :show-cancel-button="true"
            :cancel-text="$t('my.close')"
            :confirm-text="$t('my.check')"
            @confirm="viewHash"
        >
            <view class="slot-content"> {{ myTransfer.result ? myTransfer.result.hash : "noHash" }} </view>
        </u-modal>
        <u-popup
            v-model="myTransfer.passwordShow"
            mode="center"
            width="80%"
            border-radius="20"
        >
            <view class="password-box">
                <u-input
                    v-model="myTransfer.form.password"
                    type="text"
                    :border="true"
                    :placeholder="`ak_...${userStore.token.slice(-4)} ` + $t('login.securePassword')"
                />
                <u-gap :height="30"></u-gap>
                <u-button
                    type="primary"
                    @click="startTransfer"
                    :loading="myTransfer.btnLoading"
                    >{{ $t('my.send') }}</u-button
                >
            </view>
        </u-popup>
    </view>
</template>

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
