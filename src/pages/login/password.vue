<template>
    <view class="check">
        <div class="check-box">
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
                {{ $t('login.verify') + " " + $t('login.securePassword') }}
            </div>
            <u-gap height="60"></u-gap>
            <div class="form">
                <u-gap height="14"></u-gap>
                <u-input
                    @confirm="login"
                    v-model="form.password"
                    type="text"
                    :focus="true"
                    border
                    :placeholder="`ak_...${token.slice(-4)} ` + $t('login.securePassword')"
                />
            </div>
            <u-gap height="40"></u-gap>
            <u-button
                size="default"
                type="primary"
                shape="circle"
                ripple
                @click.native="login"
                :throttle-time="3000"
                :loading="btnLoading"
                >{{ $t('login.verify') }}
            </u-button>
            <u-gap height="25"></u-gap>
            <div class="clearfix">
                <div class="pull-left">
                    <div class="mnemonic" @click="goUrl('login')">
                        {{ $t('login.mnemonicLogin') }}
                    </div>
                </div>
                <div class="pull-right">
                    <div class="mnemonic" @click="logout">
                        {{ $t('login.logoutCurrent') }}
                    </div>
                </div>
            </div>
        </div>
    </view>
</template>

<script>
import { mapGetters } from "vuex";
import { getStore } from "@/util/service";

export default {
    data() {
        return {
            form: {
                password: "",
            },
            btnLoading: false, //按钮加载状态
            link: "", //跳转来时的路由
            keystoreArr: getStore("keystoreArr"),
        };
    },
    onLoad(option) {
        this.uSetBarTitle(this.$t('titleBar.verifyPassword'));
        if (!!this.$store.state.user.password || !this.token) {
            setTimeout(() => {
                uni.reLaunch({
                    url: "/pages/my/index",
                });
            }, 300);
        };
        if (!!option.link) {
            this.link = decodeURIComponent(option.link);
        };
    },
    computed: {
        ...mapGetters(["token"]),
    },
    methods: {
        login() {
            this.btnLoading = true;
            if (!this.form.password || this.form.password.length < 6) {
                    this.uShowToast(this.$t('login.passWarning', ['6-20']));
                    this.btnLoading = false;
                    return;
                }
            setTimeout(() => {
                this.check();
            }, 100);
        },
        //检查密码是否和keystore匹配
        async check() {
            const newPassword = this.cryptoPassword(this.form.password);
            try {
                const secretKey = await this.keystoreToSecretKey(
                    newPassword
                );
                if (!!secretKey) {
                    this.uShowToast(this.$t('login.loginSuccess'));
                    this.$store.commit(
                        "user/SET_PASSWORD",
                        newPassword
                    );
                    this.getConfigInfo();
                    this.getUnreadMsg();
                    this.getUserInfo();
                    this.connectAe();
                    this.btnLoading = false;
                    if (!!this.link) {
                        setTimeout(() => {
                            uni.reLaunch({
                                url: `/${this.link}`,
                            });
                        }, 1000);
                    } else {
                        setTimeout(() => {
                            uni.reLaunch({
                                url: "/pages/index/index",
                            });
                        }, 1000);
                    }
                }
            } catch (error) {
                this.uShowToast( this.$t('login.passwordErr') );
                this.form.password = "";
                this.btnLoading = false;
            }
        },
        //获取用户信息
        getUserInfo() {
            let params = {
                userAddress: this.token,
                type: "login",
            };
            this.$http.post("/User/info", params).then((res) => {
                if (res.code === 200) {
                    this.$store.commit("user/SET_USERINFO", res.data || {});
                }
            });
        },
        //退出登录
        logout() {
            this.$store.dispatch("user/deleteKeystoreArr", this.token);
            uni.reLaunch({
                url: "/pages/my/index",
            });
        },
    },
};
</script>

<style lang="scss" scoped>
page {
    background-color: #f04a82;
}

.check {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;

    .check-box {
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
            .password {
                background-color: #fff;
                border: 1px solid #ccc;
                border-radius: 10rpx;
            }
        }

        .mnemonic {
            font-size: 24rpx;
            color: #2196f3;
        }
    }
}
</style>
