<script setup>
import { ref, reactive, getCurrentInstance } from 'vue'
import { Icon } from '@iconify/vue';
import { validateMnemonic, mnemonicToSeed } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { dump as KS_dump, getHdWalletAccountFromSeed } from "@aeternity/aepp-sdk";
import { getStore } from "@/util/service";
import { mixinUtils } from'@/mixins/mixinUtils'
import { useUserStore } from "@/stores/userStore";
const { proxy } = getCurrentInstance();
const userStore = useUserStore();
//表单
const form = reactive({
    mnemonic: "",
    password: "",
})
//表单验证
const warning = reactive({
    mnemonic: false,
    password: false,
})
const loading = ref( false )
const keystoreArr = reactive( getStore("keystoreArr") )

//登录
const login = () => {
    loading.value = true;
    setTimeout(() => {
        importMnemonic();
    }, 100);
}

//导入助记词
const importMnemonic = async () => {
    const newMnemonic = form.mnemonic
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^a-z ]/g, '')
        .trim();
    if (!newMnemonic || validateMnemonic(newMnemonic, wordlist) == false) {
        warning.mnemonic = true;
        loading.value = false;
        return;
    } else {
        warning.mnemonic = false;
    }
    if (!form.password || form.password.length < 6) {
        warning.password = true;
        loading.value = false;
        return;
    } else {
        warning.password = false;
    }
    //助记词转换成钱包地址和秘钥
    const seed = await mnemonicToSeed(newMnemonic);
    const publicKeyInsecretKey = getHdWalletAccountFromSeed(seed, 0);

    //通过密码和私钥生成keystore
    const newPassword = await mixinUtils.cryptoPassword(form.password);
    await KS_dump(
        "WeTrueWallet",
        newPassword,
        publicKeyInsecretKey.secretKey
    ).then((keystore) => {
        userStore.setPassword(newPassword)
        userStore.setKeystore(keystore)
        userStore.setKeystoreArr(keystore)
    });
    userStore.setToken(publicKeyInsecretKey.publicKey)
    proxy.getUserInfo();
    mixinUtils.getConfigInfo();
    proxy.connectAe();
    uni.reLaunch({
        url: "/pages/my/index",
    });
}
</script>

<template>
    <view class="login">
        <view class="login-box">
            <view class="account">
                <Icon
                    v-if="keystoreArr.length > 0"
                    icon="fa-solid:user-shield"
                    width="28"
                    color="#f04a82"
                    @click="goUrl('accountManage')"
                />
            </view>
            <view class="title">
                <u-image
                    width="92rpx"
                    height="46rpx"
                    src="../../static/logo.png"
                    class="inline mr-5"
                ></u-image>
                {{ $t('login.mnemonicLogin') }}
            </view>
            <u-gap height="60"></u-gap>
            <view class="form">
                <view class="form-title">{{ $t('login.importMnemonic') }}</view>
                <u-gap height="14"></u-gap>
                <u-input
                    v-model="form.mnemonic"
                    type="textarea"
                    border
                    trim
                    :clearable="false"
                    height="160"
                    placeholder="gadget vocal excess layer topic check number exercise nurse ..."
                    maxlength="220"
                />
                <view class="warnning" v-show="warning.mnemonic">
                    {{ $t('login.mnemonicWarning') }}
                </view>
                <u-gap height="30"></u-gap>
                <view class="form-title">{{ $t('login.setPassword') }}</view>
                <u-gap height="14"></u-gap>
                <u-input
                    v-model="form.password"
                    type="text"
                    border
                    clearable
                    :placeholder="$t('login.passWarning', ['6-20'])"
                    maxlength="20"
                />
                <view class="warnning" v-show="warning.password">
                    {{ $t('login.passWarning', ['6-20']) }}
                </view>
            </view>
            <u-gap height="40"></u-gap>
            <u-button
                size="default"
                type="primary"
                shape="circle"
                ripple
                @tap="login"
                :loading="loading"
                :throttle-time="1000"
            >
                {{ $t('login.login') }}
            </u-button>
            <u-gap height="25"></u-gap>
            <view class="clearfix">
                <view
                    class="pull-left mnemonic"
                    @tap="reLaunchUrl('../index/index')"
                >
                    {{ $t('home.index') }}
                </view>
                <view class="pull-right mnemonic" @tap="goUrl('mnemonic')">
                    {{ $t('login.createMnemonic') }}
                </view>
            </view>
        </view>
    </view>
</template>

<style lang="scss" scoped>
page {
    background-color: #f04a82;
}

.login {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;

    .login-box {
        box-sizing: border-box;
        width: 90%;
        background-color: #ffffff;
        border-radius: 10rpx;
        min-height: 200rpx;
        padding: 60rpx 30rpx;
        box-shadow: 0rpx 5rpx 18rpx rgba($color: #666, $alpha: 0.7);
        position: relative;
        .account {
            position: absolute;
            right: 20rpx;
            top: 20rpx;
        }
        .title {
            font-size: 46rpx;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .form {
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

        .mnemonic {
            font-size: 24rpx;
            color: #2196f3;
        }
    }
}
</style>
