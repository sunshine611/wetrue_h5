<template>
    <view class="login">
        <div class="login-box">
            <fa-FontAwesome
                v-if="keystoreArr.length > 0"
                class="account"
                type="fas fa-user-shield"
                size="32"
                color="#f04a82"
                @click="goUrl('accountManage')"
            ></fa-FontAwesome>
            <div class="title">
                <u-image
                    width="92rpx"
                    height="46rpx"
                    src="../../static/logo.png"
                    class="inline mr-5"
                ></u-image>
                {{ $t('login.mnemonicLogin') }}
            </div>
            <u-gap height="60"></u-gap>
            <div class="form">
                <div class="form-title">{{ $t('login.importMnemonic') }}</div>
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
                <div class="warnning" v-show="warning.mnemonic">
                    {{ $t('login.mnemonicWarning') }}
                </div>
                <u-gap height="30"></u-gap>
                <div class="form-title">{{ $t('login.setPassword') }}</div>
                <u-gap height="14"></u-gap>
                <u-input
                    v-model="form.password"
                    type="text"
                    border
                    clearable
                    :placeholder="$t('login.passWarning', ['6-20'])"
                    maxlength="20"
                />
                <div class="warnning" v-show="warning.password">
                    {{ $t('login.passWarning', ['6-20']) }}
                </div>
            </div>
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
            <div class="clearfix">
                <div
                    class="pull-left mnemonic"
                    @tap="reLaunchUrl('../index/index')"
                >
                    {{ $t('home.index') }}
                </div>
                <div class="pull-right mnemonic" @tap="goUrl('mnemonic')">
                    {{ $t('login.createMnemonic') }}
                </div>
            </div>
        </div>
    </view>
</template>

<script>

import { getHdWalletAccountFromSeed } from '@aeternity/aepp-sdk/es/utils/hd-wallet'
import { validateMnemonic, mnemonicToSeed } from '@aeternity/bip39';
import { dump } from "@aeternity/aepp-sdk/es/utils/keystore";
import { getStore } from "@/util/service";

export default {
    data() {
        return {
            //表单
            form: {
                mnemonic: "",
                password: "",
            },
            //表单验证
            warning: {
                mnemonic: false,
                password: false,
            },
            loading: false, //按钮加载状态
            keystoreArr: getStore("keystoreArr"),
        };
    },
    onLoad() {
        this.uSetBarTitle(this.$t('titleBar.loginWeTrue'));
    },
    computed: {
    },
    methods: {
        //登录
        login() {
            this.loading = true;
            setTimeout(() => {
                this.importMnemonic();
            }, 100);
        },
        //导入助记词
        async importMnemonic() {
            const newMnemonic = this.form.mnemonic
                .toLowerCase()
                .replace(/\s+/g, ' ')
                .replace(/[^a-z ]/g, '')
                .trim();
            if (!newMnemonic || !validateMnemonic(newMnemonic)) {
                this.warning.mnemonic = true;
                this.loading = false;
                return;
            } else {
                this.warning.mnemonic = false;
            }
            if (!this.form.password || this.form.password.length < 6) {
                this.warning.password = true;
                this.loading = false;
                return;
            } else {
                this.warning.password = false;
            }
            //助记词转换成钱包地址和秘钥
            const seed = mnemonicToSeed(newMnemonic);
			const publicKeyInsecretKey = getHdWalletAccountFromSeed(seed, 0);
            //通过密码和私钥生成keystore
            let newPassword = this.cryptoPassword(this.form.password);
            await dump(
                "WeTrueWallet",
                newPassword,
                publicKeyInsecretKey.secretKey
            ).then((keystore) => {
                this.$store.commit("user/SET_KEYSTORE", keystore);
                this.$store.commit("user/SET_PASSWORD", newPassword);
                this.$store.dispatch("user/setKeystoreArr", keystore);
            });
            this.$store.commit(
                "user/SET_TOKEN",
                publicKeyInsecretKey.publicKey
            );
            this.getUserInfo(publicKeyInsecretKey.publicKey);
            this.getConfigInfo();
            this.connectAe();
            this.reLaunchUrl("../my/index");
        },
        //登陆
        getUserInfo(address) {
            let params = {
                userAddress: address,
                type: "login",
            };
            this.$http.post("/User/info", params).then((res) => {
                if (res.code === 200) {
                    this.$store.commit("user/SET_USERINFO", res.data || {});
                }
                this.loading = false;
            });
        },
    },
};
</script>

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
