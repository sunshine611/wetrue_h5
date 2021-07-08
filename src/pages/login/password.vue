<template>
    <view class="check">
        <div class="check-box">
            <div class="title">
                <u-image
                    width="92rpx"
                    height="46rpx"
                    src="../../static/logo.png"
                    class="inline mr-5"
                ></u-image>
                {{ i18n.login.verify + " " + i18n.login.securePassword }}
            </div>
            <u-gap height="60"></u-gap>
            <div class="form">
                <u-gap height="14"></u-gap>
                <u-input
                    v-model="form.password"
                    class="password"
                    :placeholder="i18n.login.passwordTips"
                    :custom-style="{ padding: '10rpx 20rpx' }"
                />
            </div>
            <u-gap height="40"></u-gap>
            <u-button
                size="default"
                type="primary"
                shape="circle"
                ripple
                @click="check"
                :throttle-time="3000"
                :loading="btnLoading"
                >{{ i18n.login.verify }}
            </u-button>
            <u-gap height="25"></u-gap>
            <div class="clearfix">
                <div class="pull-left">
                    <div class="mnemonic" @click="goUrl('login')">
                        {{ i18n.login.mnemonicLogin }}
                    </div>
                </div>
                <div class="pull-right">
                    <div class="mnemonic" @click="logout">
                        {{ i18n.my.logout }}
                    </div>
                </div>
            </div>
        </div>
    </view>
</template>

<script>
import { mapGetters } from "vuex";
export default {
    data() {
        return {
            form: {
                password: "",
            },
            btnLoading: false, //按钮加载状态
            link: "", //跳转来时的路由
        };
    },
    onLoad(option) {
        if (!!this.$store.state.user.password || !this.token) {
            setTimeout(() => {
                uni.reLaunch({
                    url: "/pages/index/index",
                });
            }, 1000);
        }
        if (!!option.link) {
            this.link = decodeURIComponent(option.link);
        }
    },
    computed: {
        ...mapGetters(["token"]),
        i18n() {
            return this.$_i18n.messages[this.$_i18n.locale];
        },
    },
    methods: {
        //检查密码是否和keystore匹配
        async check() {
            try {
                this.btnLoading = true;
                const secretKey = await this.keystoreToSecretKey(
                    this.form.password
                );
                if (!!secretKey) {
                    this.uShowToast("OK");
                    this.$store.commit("user/SET_PASSWORD", this.form.password);
                    this.getConfigInfo();
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
                this.uShowToast("密码错误！");
                this.btnLoading = false;
            }
        },
        //退出登录
        logout() {
            uni.clearStorage();
            this.$store.commit("user/SET_TOKEN", "");
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
