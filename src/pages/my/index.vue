<template>
    <div class="my">
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
                        <u-icon
                            name="edit-pen"
                            color="#fff"
                            size="40"
                            @click="goUrl('infoEdit')"
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
                                <div :class="[userInfo.isAuth ? 'auth' : '']">
                                    {{ userInfo.nickname || i18n.my.cryptonym }}
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
                                <div class="label">{{ i18n.my.topic }}</div>
                            </div>
                            <div
                                class="item"
                                @click="goUrl('topicList?type=myStar')"
                            >
                                <div class="value">
                                    {{ userInfo.star || 0 }}
                                </div>
                                <div class="label">{{ i18n.my.star }}</div>
                            </div>
                            <div class="item">
                                <div class="value">
                                    {{ userInfo.active || 0 }}
                                </div>
                                <div class="label">{{ i18n.my.active }}</div>
                            </div>
                            <div
                                class="item"
                                @click="goUrl('userList?type=focus')"
                            >
                                <div class="value">
                                    {{ userInfo.focus || 0 }}
                                </div>
                                <div class="label">{{ i18n.my.focus }}</div>
                            </div>
                            <div
                                class="item"
                                @click="goUrl('userList?type=fans')"
                            >
                                <div class="value">
                                    {{ userInfo.fans || 0 }}
                                </div>
                                <div class="label">{{ i18n.my.fans }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="menu">
                <u-cell-group :border="false">
                    <u-cell-item
                        :title="i18n.my.myWallet"
                        :value="'AE：' + balance"
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
                        :title="i18n.my.defi"
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
                    <u-cell-item
                        :title="i18n.my.accountManage"
                        @click="goUrl('../login/accountManage')"
                        v-if="!this.validThirdPartySource()"
                    >
                        <fa-FontAwesome
                            slot="icon"
                            type="fas fa-user-shield"
                            size="32"
                            class="mr-10"
                            color="#f04a82"
                        >
                        </fa-FontAwesome>
                    </u-cell-item>
                    <u-cell-item title="Language" @click="selectLanguage" :arrow="false">
                        <fa-FontAwesome
                            slot="icon"
                            type="fas fa-language"
                            size="32"
                            class="mr-10"
                            color="#f04a82"
                            
                            v-show="language === 'zh-cn'"
                        >
                        </fa-FontAwesome>
                        <fa-FontAwesome
                            slot="icon"
                            type="fas fa-language"
                            size="32"
                            class="mr-10"
                            color="#03a9f4"
                            v-show="language === 'en'"
                        >
                        </fa-FontAwesome>
                    </u-cell-item>
                </u-cell-group>
            </div>
            <div class="version">
                <div class="version-code" @click="versionCheck">
                    {{ i18n.my.version }}：{{ version }}
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
            <fa-FontAwesome
                v-if="keystoreArr.length > 0"
                class="account"
                type="fas fa-user-shield"
                size="32"
                color="#fff"
                @click="goUrl('../login/accountManage')"
            ></fa-FontAwesome>
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
                    >{{ i18n.login.mnemonicLogin }}
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
                    >{{ i18n.login.createAccount }}
                </div>
            </div>
        </div>
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
import { getStore, setStore } from "@/util/service";
import moment from "moment";

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
        //国际化
        i18n: {
            get() {
                return this.$_i18n.messages[this.$_i18n.locale];
            },
        },
    },
    onLoad() {
        this.uSetBarTitle(this.i18n.titleBar.my);
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
        this.getVersionInfo();
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
        //获取服务端版本信息
        getVersionInfo() {
            this.$http
                .post(
                    "/Config/version",
                    { version: version },
                    { custom: { isToast: true } }
                )
                .then((res) => {
                    if (res.code === 200) {
                        this.versionInfo = res.data;
                        if (this.versionInfo.mustUpdate) {
                            this.versionShow = true;
                        }
                    }
                });
        },
        //检查版本
        async versionCheck() {
            await this.getVersionInfo();
            if (this.versionCode < parseInt(this.versionInfo.newVer)) {
                this.versionShow = true;
            } else {
                this.uShowToast(this.i18n.my.versionTips);
            }
        },
        //切换语言
        selectLanguage() {
            if (getStore("language") === "zh-cn") {
                setStore("language", "en");
            } else if (getStore("language") === "en") {
                setStore("language", "zh-cn");
            }
            //控制语言显示
            this.language = getStore("language");
            moment.locale(this.language);
            this.$_i18n.locale = this.language;
        },
    },
};
</script>

<style lang="scss">
page {
    background-color: #fff;
}

.my {
    .user-info {
        .my-info {
            .block {
                background: #f04a82;
                width: 100%;
                height: 320upx;
                position: relative;
                box-sizing: border-box;
                color: #101010;
                position: relative;
                .icon-list {
                    position: absolute;
                    right: 30rpx;
                    top: 30rpx;
                }
                .user-box {
                    width: 90%;
                    background-color: #fff;
                    box-shadow: 0px 2px 6px 0px
                        rgba($color: #f04a82, $alpha: 0.3);
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

                        .address {
                            display: inline-flex;
                            flex-wrap: wrap;
                            align-items: center;
                            line-height: 50rpx;
                            color: #f04a82;
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

        .menu {
            width: 80%;
            margin: 180upx auto 80upx;
        }

        .version {
            color: #999;
            font-size: 24upx;
            position: absolute;
            bottom: 30upx;
            width: 100%;
            text-align: center;
            .version-code {
                position: relative;
                display: inline-block;
            }
        }
    }

    .login {
        background-color: #f04a82;
        height: calc(100vh - 50px);
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        .account {
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
