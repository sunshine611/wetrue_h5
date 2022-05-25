<template>
    <div class="user-info">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-navbar :is-fixed="false" :title="$t('my.infoEdit.infoEdit')" v-show="!validThirdPartySource()">
            <div slot="right">
                <u-icon
                    name="home"
                    class="mr-30"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('../../index/index')"
                ></u-icon>
            </div>
        </u-navbar>
        <u-cell-group>
            <u-cell-item 
                :title="$t('my.infoEdit.portrait') + ' ID: ' + portraitID"
                @click="portraitShow = true"
            >
                <div
                    class="user-portrait"
                    v-html="portrait"
                ></div>
            </u-cell-item>
            <u-cell-item
                :title="$t('my.nickname')"
                :value="userInfo.nickname || $t('my.cryptonym')"
                @click="
                    nameShow = true;
                    nickname = userInfo.nickname;
                "
            >
            </u-cell-item>
            <u-cell-item 
                :title="$t('my.sex')"
                :value="sexName"
                @click="sexShow = true">
            </u-cell-item>
            <u-cell-item 
                title="VIP"
                :value="isVip"
                :arrow="!userInfo.isVip"
                @click="reLaunchUrl('./openVip')"
            ></u-cell-item>
        </u-cell-group>
        <u-popup
            v-model="nameShow"
            mode="center"
            border-radius="20"
        >
            <view class="name-box">
                <u-input
                    v-model="nickname"
                    type="text"
                    :border="true"
                    :placeholder="$t('my.enterNickname')"
                    maxlength="15"
                />
                <u-gap :height="30"></u-gap>
                <u-button
                    type="primary"
                    @click="checkNickname"
                    :loading="btnLoading"
                    >{{ $t('my.send') }}</u-button
                >
            </view>
        </u-popup>
        <u-popup v-model="sexShow" mode="center" border-radius="20">
            <view class="name-box">
                <u-radio-group v-model="userInfo.sex">
                    <u-radio
                        v-for="(item, index) in sexList"
                        :key="index"
                        :name="item.name"
                    >
                        {{ item.sexName }}
                    </u-radio>
                </u-radio-group>
                <u-gap :height="30"></u-gap>
                <u-button
                    type="primary"
                    @click="updateSex"
                    :loading="btnLoading"
                    >{{ $t('my.send') }}</u-button
                >
            </view>
        </u-popup>
        <u-popup v-model="portraitShow" mode="center" border-radius="20">
            <view class="random-portrait">
                <view class="title">
                    <u-image
                        width="92rpx"
                        height="46rpx"
                        src="@/static/logo.png"
                        class="inline mr-5"
                    ></u-image>
                    Random Portrait
                </view>
                <u-gap height="30"></u-gap>
                <view class="text">
                    {{ $t('my.infoEdit.randomPortraitExpend', [ (portraitInfo.recAmount / Math.pow(10, 18)) ]) }}<br />
                    {{ $t('my.infoEdit.randomPortraitText') }}<br />
                    <div class="rule">{{ $t('my.infoEdit.portraitRule') }}</div>
                </view>
                <u-gap height="30"></u-gap>
                <u-button
                    type="primary"
                    @click="randomPortrait"
                    :loading="btnLoading"
                >
                {{ $t('my.infoEdit.agree') }}
                </u-button>
                <u-gap :height="20"></u-gap>
                <view>
                    <view class="pull-right">{{ $t('my.infoEdit.balance', [wttBalance]) }}</view>
                </view>
            </view>
        </u-popup>

    </div>
</template>

<script>
import { mapGetters } from "vuex";
import multiavatar from '@multiavatar/multiavatar';

export default {
    components: {

    },
    data() {
        return {
            userInfo: {
                nickname: this.$t('my.cryptonym'), //用户昵称
                sex: 2,
            },
            portrait: "", //头像
            portraitID: "", //头像
            portraitShow: false, //头像弹层
            portraitInfo: {}, //后端配置项
            wttBalance: 0, //账户WTT余额
            nameShow: false, //名字弹层
            sexShow: false, //性别弹层
            nickname: "", //昵称
            sexName: "", //性别
            isVip: "", //VIP
            btnLoading: false,
            sexList: [
                {
                    name: 0,
                    sexName: this.$t('my.girl'),
                },
                {
                    name: 1,
                    sexName: this.$t('my.boy'),
                },
                {
                    name: 2,
                    sexName: this.$t('my.unknown'),
                },
            ],
        };
    },
    computed: {
        ...mapGetters(["token"]),
    },
    onLoad() {
        this.uSetBarTitle(this.$t('my.infoEdit.infoEdit'));
        this.getUserInfo();
        this.getPortraitInfo();
    },
    mounted() {
        //暴露方法名"receiveWeTrueMessage"
        window["receiveWeTrueMessage"] = async (res) => {
            if (res.code == 200) {
                this.postHashToWeTrue(res);
            } else {
                res = null;
            }
            this.releaseCallback(res);
        };
    },
    //下拉刷新
    onPullDownRefresh() {
        this.getUserInfo();
        this.getPortraitInfo();
        setTimeout(function() {
            uni.stopPullDownRefresh();
        }, 500);
    },
    activated() {},
    methods: {
        //获取用户信息
        getUserInfo() {
            let params = {
                userAddress: this.token,
                type: "login",
            };
            this.$http.post("/User/info", params).then((res) => {
                if (res.code === 200) {
                    this.userInfo = res.data;
                    if (this.userInfo.sex === 0) {
                        this.sexName = this.$t('my.girl');
                    } else if (this.userInfo.sex === 1) {
                        this.sexName = this.$t('my.boy');
                    } else {
                        this.sexName = this.$t('my.unknown');
                    }

                    if (this.userInfo.isVip) {
                        this.isVip = this.$t('my.openVipTrue');
                    } else {
                        this.isVip = this.$t('my.openVipFalse');
                    }

                    if (this.userInfo.portrait) {
                        this.portrait  = multiavatar( this.userInfo.portrait );
                        this.portraitID = this.userInfo.portrait.slice(0,4) + '...' + this.userInfo.portrait.slice(-12);
                    } else {
                        this.portrait = multiavatar( this.userInfo.userAddress );
                        this.portraitID = this.userInfo.userAddress.slice(0,4) + '...' + this.userInfo.userAddress.slice(-12);
                    }
                    
                }
                this.loading = false;
            });
        },
        //验证昵称
        checkNickname() {
            this.$http
                .post("/User/isNickname", { nickname: this.nickname })
                .then((res) => {
                    if (res.code === 200) {
                        if (res.data.isNickname) {
                            uni.showToast({
                                title: this.$t('my.checkNickname'),
                                icon: "none",
                            });
                        } else {
                            this.updateNickname();
                        }
                    }
                });
        },
        //更新昵称
        async updateNickname() {
            this.btnLoading = true;
            let payload = {
                content: this.nickname,
            };
            let res = await this.wetrueSend("nickname", payload);
            this.releaseCallback(res);
        },
        //更新性别
        async updateSex() {
            this.btnLoading = true;
            let payload = {
                content: this.userInfo.sex,
            };
            let res = await this.wetrueSend('sex',payload);
            this.releaseCallback(res);
        },
        //随机头像
        async randomPortrait() {
            this.btnLoading = true;
            
            if(!this.userInfo.isVip) {
                this.uShowToast( this.$t('my.infoEdit.noVip') );
                this.btnLoading = false;
                this.portraitShow = false;
                return;
            }
            if(!this.portraitInfo.randomPortrait) {
                this.uShowToast( this.$t('my.infoEdit.channel') );
                this.btnLoading = false;
                this.portraitShow = false;
                return;
            }
            if ( this.wttBalance < (this.portraitInfo.recAmount / Math.pow(10, 18)) ) {
                this.uShowToast( this.$t('my.infoEdit.balanceLow') );
                this.btnLoading = false;
                return;
            }
            const result = await this.contractTransfer(
                this.portraitInfo.recToken,
                this.portraitInfo.recAddress,
                this.portraitInfo.recAmount/ Math.pow(10, 18),
                {type:'randomPortrait'}
            );
            if (result) {
                this.postHashToWeTrue(result); //提交
                setTimeout(() => {
                    uni.hideLoading();
                    this.btnLoading = false;
                    this.portraitShow = false;
                    this.getPortraitInfo();
                    this.uShowToast(this.$t('my.infoEdit.waiting') , "none", 3000);
                }, 1000);
            } else {
                this.btnLoading = false;
                uni.hideLoading();
            }
        },
        //获取随机头像信息
        getPortraitInfo() {
            this.$http
                .post("/Config/randomPortrait").then((res) => {
                    if (res.code === 200) {
                        this.portraitInfo = res.data;
                        this.getWttBalance();
                    }
                });
        },
        //上链回调
        releaseCallback(res) {
            if (JSON.stringify(res) !== "{}" && !!res) {
                setTimeout(() => {
                    this.nameShow = false;
                    this.btnLoading = false;
                    uni.hideLoading();
                    this.getUserInfo();
                }, 2000);
                setTimeout(() => {
                    this.sexShow = false;
                    this.btnLoading = false;
                    uni.hideLoading();
                    this.getUserInfo();
                }, 2000);
            } else {
                this.btnLoading = false;
                uni.hideLoading();
            }
        },
        //获取WTT余额
        getWttBalance() {
            this.getTokenBalance(
                this.portraitInfo.recToken,
                this.token
            ).then((res) => {
                this.wttBalance = this.balanceFormat( res.toString(10) ) || 0;
            });;
        },
    },
};
</script>
<style lang="scss" scoped>
.user-info {
    .user-portrait {
        width: 100rpx;
        height: 100rpx;
        border-radius: 10rpx;
        margin-right: 10rpx;
        float:right;
    }
    .name-box {
        padding: 50rpx;
        border-radius: 20rpx;
    }
    .random-portrait {
        background: #fff;
        border-radius: 30rpx;
        padding: 80rpx;
        box-sizing: border-box;
        position:relative;
        .title {
            font-size: 36rpx;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .text {
            font-size: 26rpx;
            height: 100rpx;
            .rule {
                color: #757575;
            }
        }
    }
}
</style>
