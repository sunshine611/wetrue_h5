<template>
    <div class="user-info">
        <view :style="`padding-top:${statusBarHeight}px`"></view>
        <u-navbar :is-fixed="false" :title="$t('my.infoEdit')" v-show="!validThirdPartySource()">
            <div slot="right">
                <u-icon
                    name="home"
                    class="mr-30"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('../index/index')"
                ></u-icon>
            </div>
        </u-navbar>
        <u-cell-group>
            <u-cell-item :title="$t('my.profile')">
                <image
                    :src="userInfo.portrait"
                    slot="right-icon"
                    class="user-head"
                ></image>
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
            <u-cell-item :title="$t('my.se')" :value="sexName" @click="sexShow = true">
            </u-cell-item>
        </u-cell-group>
        <u-popup
            v-model="nameShow"
            mode="center"
            width="80%"
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
        <u-popup v-model="sexShow" mode="center" width="80%" border-radius="20">
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
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    components: {

    },
    data() {
        return {
            userInfo: {
                userHead: "", //用户头像
                nickname: this.$t('my.cryptonym'), //用户昵称
                sex: 2,
            },
            nameShow: false, //名字弹层
            sexShow: false, //性别弹层
            nickname: "", //昵称
            sexName: "", //性别
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
        this.uSetBarTitle(this.$t('titleBar.infoEdit'));
        this.getUserInfo();
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
    },
};
</script>
<style lang="scss" scoped>
.user-info {
    .user-head {
        width: 100rpx;
        height: 100rpx;
        border-radius: 10rpx;
    }
    .name-box {
        padding: 50rpx;
        border-radius: 20rpx;
    }
}
</style>
