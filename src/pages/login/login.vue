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
                {{ i18n.login.mnemonicLogin }}
            </div>
            <u-gap height="60"></u-gap>
            <div class="form">
                <div class="form-title">{{ i18n.ImportCreate }}</div>
                <u-gap height="14"></u-gap>
                <u-input
                    v-model="form.mnemonic"
                    type="textarea"
                    border
                    trim
                    :clearable="false"
                    height="160"
                    placeholder="one two three..."
                    maxlength="220"
                />
                <div class="warnning" v-show="warning.mnemonic">
                    {{ i18n.login.mnemonicWarning }}
                </div>
                <div class="warnning" v-show="warning.mnemonicFormat">
                    {{ i18n.login.mnemonicFormat }}
                </div>
                <u-gap height="30"></u-gap>
                <div class="form-title">{{ i18n.Setpassword }}</div>
                <u-gap height="14"></u-gap>
                <u-input
                    v-model="form.password"
                    type="text"
                    border
                    clearable
                    placeholder="Password..."
                    maxlength="20"
                />
                <div class="warnning" v-show="warning.password">
                    {{ i18n.login.passWarning }}
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
                {{ i18n.login.login }}
            </u-button>
            <u-gap height="25"></u-gap>
            <div class="clearfix">
                <div
                    class="pull-left mnemonic"
                    @tap="reLaunchUrl('../index/index')"
                >
                    {{ i18n.home.index }}
                </div>
                <div class="pull-right mnemonic" @tap="goUrl('mnemonic')">
                    {{ i18n.login.createAccount }}
                </div>
            </div>
        </div>
    </view>
</template>

<script>
import {
    generateSaveHDWallet,
    getHdWalletAccountFromMnemonic,
} from "@aeternity/aepp-sdk/es/utils/hd-wallet";
import { dump } from "@aeternity/aepp-sdk/es/utils/keystore";
import { getStore } from "@/util/service";
export default {
    data() {
        return {
            //表单
            form: {
                mnemonic: "",
                mnemonicFormat: "",
                password: "",
            },
            //表单验证
            warning: {
                mnemonic: false,
                mnemonicFormat: false,
                password: false,
            },
            loading: false, //按钮加载状态
            keystoreArr: getStore("keystoreArr"),
        };
    },
    onLoad() {
        uni.setNavigationBarTitle({
            title:this.i18n.titleBar.loginWeTrue
        });
    },
    computed: {
        i18n() {
            return this.$_i18n.messages[this.$_i18n.locale];
        },
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
            if (!this.form.mnemonic) {
                this.warning.mnemonic = true;
                this.loading = false;
                return;
            } else {
                this.warning.mnemonic = false;
            }
            try {
                await generateSaveHDWallet(this.form.mnemonic, 0);
            } catch (err) {
                this.warning.mnemonicFormat = true;
                this.loading = false;
                return;
            }
            if (!this.form.password || this.form.password.length < 6) {
                this.warning.password = true;
                this.loading = false;
                return;
            } else {
                this.warning.password = false;
            }
            //助记词转换成钱包地址和秘钥
            let publicKeyInsecretKey = await getHdWalletAccountFromMnemonic(
                this.form.mnemonic,
                0
            );
            //通过密码和私钥生成keystore
            await dump(
                "WeTrueWallet",
                this.cryptoPassword(this.form.password),
                publicKeyInsecretKey.secretKey
            ).then((keystore) => {
                this.$store.commit("user/SET_KEYSTORE", keystore);
                this.$store.commit(
                    "user/SET_PASSWORD",
                    this.cryptoPassword(this.form.password)
                );
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
