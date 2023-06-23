
<script setup>
import { ref, reactive, getCurrentInstance } from 'vue'
import { Icon } from '@iconify/vue';
import { onLoad } from '@dcloudio/uni-app'
import { getStore } from "@/util/service";
import { useUserStore } from "@/stores/userStore";
import { mixinUtils } from'@/mixins/mixinUtils'
const userStore = useUserStore();
const { proxy } = getCurrentInstance();

const onLoadVal = ref( null )
const form = reactive({
	password: "",
})
//按钮加载状态
const btnLoading = ref( false )
//跳转来时的路由
const link = ref( "" )
const keystoreArr = reactive( getStore("keystoreArr") )

onLoad ( (option) => {
    onLoadVal.value = option.link
    if (!!userStore.password || !userStore.token) {
        setTimeout(() => {
            uni.reLaunch({
                url: "/pages/my/index",
            });
        }, 300);
    };
    if (!!onLoadVal.value) {
        link.value = decodeURIComponent(onLoadVal.value);
    };
})

const login = () => {
    btnLoading.value = true;
    if ( !form.password || form.password.length < 6 ) {
        proxy.uShowToast(proxy.$t('login.passWarning', ['6-20']));
        btnLoading.value = false;
        return;
    }
    setTimeout(() => {
        check();
    }, 100);
}
//检查密码是否和keystore匹配
const check = async() => {
    const newPassword = await mixinUtils.cryptoPassword( form.password );
    try {
        const secretKey = await proxy.keystoreToSecretKey( newPassword );
        if (!!secretKey) {
            proxy.uShowToast(proxy.$t('login.loginSuccess'));
            userStore.password = newPassword
            mixinUtils.getConfigInfo();
            proxy.getUnreadMsg();
            getUserInfo();
            proxy.connectAe();
            btnLoading.value = false;
            if (!!link.value) {
                setTimeout(() => {
                    proxy.reLaunchUrl('/'+link.value)
                    clearTimeout();
                }, 100);
            } else {
                setTimeout(() => {
                    proxy.reLaunchUrl("/pages/index/index")
                    clearTimeout();
                }, 100);
            }
        }
    } catch (error) {
        proxy.uShowToast( proxy.$t('login.passwordErr') );
        form.password = "";
        btnLoading.value = false;
    }
}
//获取用户信息
const getUserInfo = () => {
    let params = {
        userAddress: userStore.token,
        type: "login",
    };
    proxy.$http.post("/User/info", params).then((res) => {
        if (res.code === 200) {
            userStore.setUserInfo(res.data)
        }
    }).catch((err) => {
        console.log("getUserInfo Error",err)
    });
}
//退出登录
const logout = () => {
    userStore.deleteKeystoreArr(userStore.token)
    proxy.reLaunchUrl("/pages/my/index")
}
</script>

<template>
    <view class="check">
        <view class="check-box">
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
                {{ $t('login.securePassword', [$t('login.verify')]) }}
            </view>
            <u-gap height="60"></u-gap>
            <view class="form">
                <u-gap height="14"></u-gap>
                <u-input
                    @confirm="login"
                    v-model="form.password"
                    type="text"
                    :focus="true"
                    border
                    :placeholder="$t('login.securePassword', ['ak_...'+ userStore.token?.slice(-4)])"
                />
            </view>
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
            <view class="clearfix">
                <view class="pull-left">
                    <view class="mnemonic" @click="goUrl('login')">
                        {{ $t('login.mnemonicLogin') }}
                    </view>
                </view>
                <view class="pull-right">
                    <view class="mnemonic" @click="logout">
                        {{ $t('login.logoutCurrent') }}
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

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
        .title {
            font-size: 46rpx;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .account {
            position: absolute;
            right: 20rpx;
            top: 20rpx;
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
