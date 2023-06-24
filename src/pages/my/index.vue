
<script setup>
import { reactive, getCurrentInstance } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from "@/stores/userStore";
import { version as cVersion, diceUrl } from "@/config/config.js";
import { useI18n } from "vue-i18n";
import { Icon } from '@iconify/vue';
import HeadImg from "@/components/HeadImg.vue";
import VersionTip from "@/components/VersionTip.vue";
const userStore = useUserStore();
const { proxy } = getCurrentInstance();
const { locale } = useI18n();

//表单
const myIndex = reactive({
    version: cVersion, //应用版本号
    addressShow: "", //ae地址
    versionInfo: {}, //版本信息
    versionCode: parseInt(cVersion.replace(/\./g, "")), //版本号
    versionShow: false, //版本提示弹层
})

onLoad ( () => {
    proxy.uSetBarTitle(proxy.$t('titleBar.my'));
    if (!!userStore.token) {
        getUserInfo();
        proxy.getAeBalance().then((res) => {
            myIndex.balance = res;
        });
        proxy.getUnreadMsg();
    }
});

//获取用户信息
const getUserInfo = () => {
    let params = {
        userAddress: userStore.token,
    };
    myIndex.addressShow = "";
    for (let i = 0, len = userStore.token.length; i < len; i++) {
        myIndex.addressShow += userStore.token[i];
        if (i % 3 === 2) myIndex.addressShow += " ";
    }
    proxy.$http.post("/User/info", params).then((res) => {
        if (res.code === 200) {
            userStore.setUserInfo(res.data)
        }
    }).catch((err) => {
        console.log("getUserInfo Error",err)
    });
}
//复制粘贴板
const copy = () => {
    proxy.copyContent(userStore.userInfo.userAddress);
}
//打开白皮书
const whitePaper = () => {
    window.open(diceUrl + "/app/Wetrue_White_Paper.pdf");
}
//检查版本
const versionCheck = async () => {
    await appVersion();
    if (myIndex.versionCode < parseInt(myIndex.versionInfo.newVer)) {
        myIndex.versionShow = true;
    } else {
        proxy.uShowToast(proxy.$t('my.versionTips'));
    }
}
//获取服务端版本信息
const appVersion = () => {
    proxy.getVersionInfo().then((res) => {
        myIndex.versionInfo = res;
        if (myIndex.versionInfo.mustUpdate) {
            myIndex.versionShow = true;
        }
    }).catch((err) => {
        console.log("getVersionInfo",err)
    });;
}
//账户管理
const goAccountManage = () => {
    if (proxy.validThirdPartySource()) {
        proxy.uShowToast(
            proxy.$t('index.thirdPartyNotOpen'),
        );
        return false;
    };
    proxy.goUrl('../login/accountManage');
}

//选择语言
const changeLang = () => {
    let lang
    if (userStore.language == 'zh-cn') {
        lang = 'en'
    } else if (userStore.language == 'en') {
        lang = 'zh-cn'
    }
    userStore.setLanguage(lang)
    locale.value = lang;
    proxy.$moment.locale(lang);
};
</script>

<template>
    <view class="my">
        <view class="top-background" :style="{height:`${statusBarHeight}px`}"></view>
        <view class="user-info" v-if="!!userStore.token">
            <view class="my-info">
                <view class="block">
                    <view class="icon-list">
                        <u-icon
                            class="mr-15"
                            name="bookmark"
                            color="#fff"
                            size="40"
                            @click="whitePaper"
                        ></u-icon>
                    </view>
                    <view class="user-box">
                        <view class="user-top">
                            <view class="head">
                                <HeadImg
                                    :userInfo="userStore.userInfo"
                                    width="120rpx"
                                    height="120rpx"
                                ></HeadImg>
                                <u-gap height="10"></u-gap>
                                 <view class="open-vip" v-if="userStore.userInfo?.isVip">
                                    <u-icon 
                                        name="level"
                                        size="30"
                                        color="#CD7F32"
                                    ></u-icon>
                                </view>
                                <view :class="[userStore.userInfo?.isAuth ? 'auth' : '']">
                                    {{ userStore.userInfo?.nickname || $t('my.cryptonym') }}
                                </view>
                            </view>
                            <view class="address" @tap="copy" id="copy">
                                {{ myIndex.addressShow }}
                            </view>
                        </view>
                        <view class="user-bottom">
                            <view
                                class="item"
                                @click="goUrl('topicList?type=myTopic')"
                            >
                                <view class="value">
                                    {{ userStore.userInfo?.topic || 0 }}
                                </view>
                                <view class="label">{{ $t('my.topic') }}</view>
                            </view>
                            <view
                                class="item"
                                @click="goUrl('topicList?type=myStar')"
                            >
                                <view class="value">
                                    {{ userStore.userInfo?.star || 0 }}
                                </view>
                                <view class="label">{{ $t('my.star') }}</view>
                            </view>
                            <view class="item">
                                <view class="value">
                                    {{ userStore.userInfo?.active || 0 }}
                                </view>
                                <view class="label">{{ $t('my.active') }}</view>
                            </view>
                            <view
                                class="item"
                                @click="goUrl('userList?type=focus')"
                            >
                                <view class="value">
                                    {{ userStore.userInfo?.focus || 0 }}
                                </view>
                                <view class="label">{{ $t('my.focus') }}</view>
                            </view>
                            <view
                                class="item"
                                @click="goUrl('userList?type=fans')"
                            >
                                <view class="value">
                                    {{ userStore.userInfo?.fans || 0 }}
                                </view>
                                <view class="label">{{ $t('my.fans') }}</view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
            <view class="grid">
                <u-grid col="4" :border="false">
                    <u-grid-item @click="goUrl('./setting/infoEdit')">
                        <Icon 
                            icon="mdi:user-outline"
                            width="30"
                            color="#f04a82"
                        />
                        <view class="grid-text">{{ $t('my.userInfo') }}</view>
                    </u-grid-item>

                    <u-grid-item @click="goUrl('./setting/blacklistManage')">
                        <Icon 
                            icon="mdi:user-outline"
                            width="30"
                        />
                        <view class="grid-text">{{ $t('my.blacklistManage') }}</view>
                    </u-grid-item>

                    <u-grid-item @click="goAccountManage()">
                        <Icon 
                            icon="mdi:user-add-outline"
                            color ="#f04a82"
                            width="30"
                        />
                        <view class="grid-text"> {{ $t('my.accountManage') }}</view>
                    </u-grid-item>

                    <u-grid-item @click="goUrl('aens/index')">
                        <Icon
                            icon="fa-brands:neos"
                            color="#f04a82"
                            width="30"
                        />
                        <view class="grid-text">AENS</view>
                    </u-grid-item>

                </u-grid>
            </view>
            <view class="menu">
                <u-cell-group :border="false">
                    <u-cell-item
                        :title="$t('my.myWallet')"
                        :value="'AE: ' + myIndex.balance"
                        @click="goUrl('tokenList')"
                    >
                        <template v-slot:icon>
                            <Icon 
                                icon="ph:wallet-fill"
                                width="28"
                                color="#f04a82"
                                class="mr-10"
                            />
                        </template>
                    </u-cell-item>
                    <u-cell-item
                        :title="$t('my.migrateToken')"
                        @click="goUrl('migrateToken')"
                        v-if="validAdmin()==true"
                    >
                        <template v-slot:icon>
                            <Icon 
                                icon="uil:exchange-alt"
                                width="28"
                                color="#f04a82"
                                class="mr-10"
                            />
                        </template>
                    </u-cell-item>
                    <u-cell-item
                        :title="$t('my.mappingMining')"
                        @click="goUrl('mappingDig')"
                        v-if="validAdmin()==true"
                    >
                        <template v-slot:icon>
                            <Icon 
                                icon="game-icons:mining"
                                width="28"
                                color="#f04a82"
                                class="mr-10"
                            />
                        </template>
                    </u-cell-item>
                    <u-cell-item
                        title="Space dice"
                        @click="goUrl('/pages/games/SpaceDice')"
                        :arrow="false"
                    >
                        <template v-slot:icon>
                            <Icon 
                                icon="ion:dice"
                                width="28"
                                color="#f04a82"
                                class="mr-10"
                            />
                        </template>
                    </u-cell-item>
                    <u-cell-item :title="$t('my.setting.setting')" @click="goUrl('set')">
                        <template v-slot:icon>
                            <Icon 
                                icon="uiw:setting"
                                width="28"
                                color="#f04a82"
                                class="mr-10"
                            />
                        </template>
                    </u-cell-item>
                </u-cell-group>
            </view>
            <view class="version">
                <view class="version-code" @click="versionCheck">
                    {{ $t('my.version') }}：{{ myIndex.version }}
                    <u-badge
                        v-if="myIndex.versionCode < parseInt(myIndex?.versionInfo?.newVer)"
                        type="error"
                        count="1"
                        :is-dot="true"
                        :offset="[0, -12]"
                    ></u-badge>
                </view>
            </view>
        </view>
        <view class="login" v-else>
            <view class="opera-icon">
                <Icon 
                    icon  ="cil:language"
                    class="mr-32"
                    color ="#fff"
                    width="32"
                    height="32"
                    @click ="changeLang"
                />
                <Icon 
                    icon="fa-solid:user-shield"
                    color="#fff"
                    width="32"
                    height="32"
                    @click="goUrl('../login/accountManage')"
                />
            </view>
            <view class="login-box">
                <view class="item" @tap="goUrl('../login/login')">
                    <template v-slot:icon>
                        <Icon 
                            icon="ph:wallet-fill"
                            width="48"
                            color="#f04a82"
                            class="mr-20"
                        />
                    </template>
                    {{ $t('login.mnemonicLogin') }}
                </view>
                <u-gap height="80"></u-gap>
                <view class="item" @tap="goUrl('../login/mnemonic')">
                    <template v-slot:icon>
                        <Icon 
                            icon="bi:plus-circle-fill"
                            width="48"
                            color="#f04a82"
                            class="mr-20"
                        />
                    </template>
                    {{ $t('login.createMnemonic') }}
                </view>
            </view>
            <view class="version">
                    {{ $t('my.version') }}：{{ myIndex.version }}
            </view>
        </view>
        <VersionTip
            v-model="myIndex.versionShow"
            :versionInfo="myIndex.versionInfo"
        ></VersionTip>
    </view>
</template>

<style lang="scss">
page {
    background-color: #fff;
}

.my {
    .top-background {
        background: $u-type-aeternity;
    }
    .user-info {
        .my-info {
            .block {
                background: $u-type-aeternity;
                width: 100%;
                height: 320rpx;
                position: relative;
                box-sizing: border-box;
                color: #101010;
                position: relative;
                .icon-list {
                    position: absolute;
                    left: 5%;
                    top: 30rpx;
                }
                .user-box {
                    width: 90%;
                    background-color: #fff;
                    box-shadow: 0px 2px 6px 0px
                        rgba($color: $u-type-aeternity, $alpha: 0.3);
                    z-index: 100;
                    border-radius: 20upx;
                    position: absolute;
                    left: 5%;
                    bottom: -160upx;
                    font-size: 26upx;
                    box-sizing: border-box;

                    .user-top {
                        padding: 30rpx 30rpx 0 30rpx;
                        display: flex;

                        .head {
                            text-align: center;
                            font-size: 24upx;
                            padding: 20rpx 30rpx;
                            .auth {
                                color: #2979ff;
                                font-weight: bold;
                                display: inline-block;
                            }
                        }

                        .open-vip {
                            margin-right: 4rpx;
                            display: inline-block;
                        }

                        .address {
                            display: inline-flex;
                            flex-wrap: wrap;
                            align-items: center;
                            line-height: 50rpx;
                            color: $u-type-aeternity;
                            font-size: 34rpx;
                        }
                    }

                    .user-bottom {
                        display: flex;
                        justify-content: space-around;
                        padding: 10rpx 30rpx 30rpx;

                        .item {
                            text-align: center;

                            .value {
                                font-size: 24rpx;
                                color: #000;
                            }

                            .label {
                                font-size: 24rpx;
                                color: #666;
                            }
                        }
                    }
                }
            }
        }

        .grid {
            width: 95%;
            margin: 180rpx auto 0rpx;
            border-bottom: 2rpx solid #ececec;
            .grid-text {
                font-size: 24rpx;
                margin-top:12rpx;
                color: #999;
            }
        }

        .menu {
            width: 80%;
            margin: 0 auto 80rpx;
        }
    }

    .login {
        background-color: $u-type-aeternity;
        height: calc(100vh - 50px);
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        .opera-icon {
            position: absolute;
            right: 30rpx;
            top: 30rpx;
        }
        .login-box {
            margin: 0 10%;
            width: 90%;
            .item {
                background-color: #fff;
                height: 110rpx;
                width: 100%;
                border-radius: 20rpx;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 44rpx;
                box-shadow: 0rpx 5rpx 18rpx rgba($color: #666, $alpha: 0.7);
                transition: all 0.3;

                &:active {
                    transform: scale(1.1);
                }
            }
        }
    }
    .version {
        font-size: 24rpx;
        display: flex;
        justify-content: center;
        position: absolute;
        bottom: 30rpx;
        width: 100%;
        text-align: center;
        .version-code {
            color: #999;
            position: relative;
            display: inline-block;
        }
    }
}
</style>
