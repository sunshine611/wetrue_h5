<template>
    <div class="my">
        <view
            class="top-background"
            :style="{height:`${statusBarHeight}px`}"
        ></view>
        <div class="user-info" v-if="!!token">
            <div class="my-info">
                <div class="block">
                    <div class="icon-list">
                        <u-icon
                            class="mr-15"
                            name="bookmark"
                            color="#fff"
                            size="40"
                            @click="whitePaper"
                        ></u-icon>
                    </div>
                    <div class="user-box">
                        <div class="user-top">
                            <div class="head">
                                <HeadImg
                                    :userInfo="userInfo"
                                    width="120rpx"
                                    height="120rpx"
                                ></HeadImg>
                                <u-gap height="10"></u-gap>
                                 <div class="open-vip" v-if="userInfo.isVip">
                                    <u-icon 
                                        name="level"
                                        size="30"
                                        color="#CD7F32"
                                    ></u-icon>
                                </div>
                                <div :class="[userInfo.isAuth ? 'auth' : '']">
                                    {{ userInfo.nickname || $t('my.cryptonym') }}
                                </div>
                            </div>
                            <div class="address" @tap="copy" id="copy">
                                {{ address }}
                            </div>
                        </div>
                        <div class="user-bottom">
                            <div
                                class="item"
                                @click="goUrl('topicList?type=myTopic')"
                            >
                                <div class="value">
                                    {{ userInfo.topic || 0 }}
                                </div>
                                <div class="label">{{ $t('my.topic') }}</div>
                            </div>
                            <div
                                class="item"
                                @click="goUrl('topicList?type=myStar')"
                            >
                                <div class="value">
                                    {{ userInfo.star || 0 }}
                                </div>
                                <div class="label">{{ $t('my.star') }}</div>
                            </div>
                            <div class="item">
                                <div class="value">
                                    {{ userInfo.active || 0 }}
                                </div>
                                <div class="label">{{ $t('my.active') }}</div>
                            </div>
                            <div
                                class="item"
                                @click="goUrl('userList?type=focus')"
                            >
                                <div class="value">
                                    {{ userInfo.focus || 0 }}
                                </div>
                                <div class="label">{{ $t('my.focus') }}</div>
                            </div>
                            <div
                                class="item"
                                @click="goUrl('userList?type=fans')"
                            >
                                <div class="value">
                                    {{ userInfo.fans || 0 }}
                                </div>
                                <div class="label">{{ $t('my.fans') }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="grid">
                <u-grid col="4" :border="false">
                    <u-grid-item @click="goUrl('./setting/infoEdit')">
                        <u-icon 
                            name="account"
                            size="46"
                            color="#f04a82"
                        ></u-icon>
                        <view class="grid-text">{{ $t('my.userInfo') }}</view>
                    </u-grid-item>

                    <u-grid-item @click="goUrl('./setting/blacklistManage')">
                        <u-icon 
                            name="account"
                            size="46"
                        ></u-icon>
                        <view class="grid-text">{{ $t('my.blacklistManage') }}</view>
                    </u-grid-item>

                    <u-grid-item @click="goAccountManage()">
                        <u-icon 
                            name="man-add"
                            size="46"
                            color="#f04a82"
                        ></u-icon>
                        <view class="grid-text"> {{ $t('my.accountManage') }}</view>
                    </u-grid-item>

                    <u-grid-item @click="goUrl('aens/index')">
                        <fa-FontAwesome
                            type="fab fa-neos"
                            size="42"
                            color="#f04a82"
                        >
                        </fa-FontAwesome>
                        <view class="grid-text">AENS</view>
                    </u-grid-item>

                </u-grid>
            </div>
            <div class="menu">
                <u-cell-group :border="false">
                    <u-cell-item
                        :title="$t('my.myWallet')"
                        :value="'AE: ' + balance"
                        @click="goUrl('tokenList')"
                    >
                        <fa-FontAwesome
                            slot="icon"
                            type="fas fa-wallet"
                            size="32"
                            class="mr-10"
                            color="#f04a82"
                        >
                        </fa-FontAwesome>
                    </u-cell-item>
                    <u-cell-item
                        :title="$t('my.migrateToken')"
                        @click="goUrl('migrateToken')"
                    >
                        <fa-FontAwesome
                            slot="icon"
                            type="fas fa-exchange-alt"
                            size="32"
                            class="mr-10"
                            color="#f04a82"
                        >
                        </fa-FontAwesome>
                    </u-cell-item>
                    <u-cell-item
                        :title="$t('my.mappingMining')"
                        @click="goUrl('mappingDig')"
                    >
                        <fa-FontAwesome
                            slot="icon"
                            type="fas fa-hammer"
                            size="32"
                            class="mr-10"
                            color="#f04a82"
                        >
                        </fa-FontAwesome>
                    </u-cell-item>
                    <u-cell-item :title="$t('my.setting.setting')" @click="goUrl('set')">
                        <u-icon 
                            slot="icon"
                            name="setting-fill"
                            size="40"
                            class="mr-10"
                            color="#f04a82"
                        ></u-icon>
                    </u-cell-item>
                </u-cell-group>
            </div>
            <div class="version">
                <div class="version-code" @click="versionCheck">
                    {{ $t('my.version') }}：{{ version }}
                    <u-badge
                        v-if="versionCode < parseInt(versionInfo.newVer)"
                        type="error"
                        count="1"
                        :is-dot="true"
                        :offset="[0, -12]"
                    ></u-badge>
                </div>
            </div>
        </div>
        <div class="login" v-else>
            <div class="opera-icon">
                <fa-FontAwesome
                    class="mr-30"
                    type="fas fa-language"
                    size="32"
                    color="#fff"
                   @click="selectLanguage"
                ></fa-FontAwesome>
                <fa-FontAwesome
                    type="fas fa-user-shield"
                    size="32"
                    color="#fff"
                    @click="goUrl('../login/accountManage')"
                ></fa-FontAwesome>
            </div>
            <div class="login-box">
                <div class="item" @tap="goUrl('../login/login')">
                    <fa-FontAwesome
                        slot="icon"
                        type="fas fa-wallet"
                        size="48"
                        class="mr-20"
                        color="#f04a82"
                    >
                    </fa-FontAwesome
                    >{{ $t('login.mnemonicLogin') }}
                </div>
                <u-gap height="80"></u-gap>
                <div class="item" @tap="goUrl('../login/mnemonic')">
                    <fa-FontAwesome
                        slot="icon"
                        type="fas fa-plus-circle"
                        size="48"
                        class="mr-20"
                        color="#f04a82"
                    >
                    </fa-FontAwesome
                    >{{ $t('login.createAccount') }}
                </div>
            </div>
        </div>
        <u-gap height="280" v-show="keystoreArr.length > 0"></u-gap>
        <VersionTip
            v-model="versionShow"
            :versionInfo="versionInfo"
        ></VersionTip>
    </div>
</template>

<script>
import Request from "luch-request";
const http = new Request();
import { version } from "@/config/config.js";
import { mapGetters } from "vuex";
import HeadImg from "@/components/HeadImg.vue";
import VersionTip from "@/components/VersionTip.vue";
import { getStore } from "@/util/service";

export default {
    components: {
        HeadImg,
        VersionTip,
    },
    data() {
        return {
            userInfo: {}, //用户信息
            version: version, //应用版本号
            address: "", //ae地址
            balance: 0, //余额
            versionInfo: {}, //版本信息
            versionCode: parseInt(version.replace(/\./g, "")), //版本号
            versionShow: false, //版本提示弹层
            keystoreArr: getStore("keystoreArr"),
            language: getStore("language"),
        };
    },
    computed: {
        ...mapGetters(["token"]),
    },
    onLoad() {
        this.uSetBarTitle(this.$t('titleBar.my'));
        if (!!this.token) {
            this.getUserInfo();
            this.getAccount().then((res) => {
                this.balance = res;
            });
            this.getUnreadMsg();
        }
    },
    activated() {
        if (!!this.token) {
            this.getUserInfo();
            this.getAccount().then((res) => {
                this.balance = res;
            });
            this.getUnreadMsg();
        }
        this.appVersion();
    },
    methods: {
        //获取用户信息
        getUserInfo() {
            let params = {
                userAddress: this.token,
            };
            this.address = "";
            for (let i = 0, len = this.token.length; i < len; i++) {
                this.address += this.token[i];
                if (i % 3 === 2) this.address += " ";
            }
            this.$http.post("/User/info", params).then((res) => {
                if (res.code === 200) {
                    this.userInfo = res.data;
                }
            });
        },
        //复制粘贴板
        copy() {
            this.copyContent(this.userInfo.userAddress);
        },
        //打开白皮书
        whitePaper() {
            window.open("https://wetrue.io/assets/Wetrue_White_Paper.pdf");
        },
        //检查版本
        async versionCheck() {
            await this.appVersion();
            if (this.versionCode < parseInt(this.versionInfo.newVer)) {
                this.versionShow = true;
            } else {
                this.uShowToast(this.$t('my.versionTips'));
            }
        },
        //获取服务端版本信息
        appVersion() {
            this.getVersionInfo().then((res) => {
                this.versionInfo = res;
                if (this.versionInfo.mustUpdate) {
                    this.versionShow = true;
                }
            });
        },
        //账户管理
        goAccountManage() {
            if (this.validThirdPartySource()) {
                this.uShowToast(
                    this.$t('index.thirdPartyNotOpen'),
                );
                return false;
            };
            this.goUrl('../login/accountManage');
        },
    },
};
</script>

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

        .version {
            color: #999;
            font-size: 24rpx;
            position: absolute;
            bottom: 30rpx;
            width: 100%;
            text-align: center;
            .version-code {
                position: relative;
                display: inline-block;
            }
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
}
</style>
