<script setup>
import multiavatar from '@multiavatar/multiavatar';
import { reactive, getCurrentInstance } from 'vue'
import { onReady, onPullDownRefresh } from '@dcloudio/uni-app';
import { useUserStore } from "@/stores/userStore";
const userStore = useUserStore();
const { proxy } = getCurrentInstance();

const userInfoEdit = reactive({
    nickname: userStore.userInfo.nickname, //用户昵称
    sex: userStore.userInfo.sex,
    avatar: "", //头像
    avatarID: "", //头像
    sexName: "", //性别
    isVip: "", //VIP
    avatarInfo: {}, //后端配置项
    wttBalance: 0, //账户WTT余额
})

const boolInfo = reactive({
    avatarShow: false, //头像弹层
    nameShow: false, //名字弹层
    sexShow: false, //性别弹层
    btnLoading: false,
})

const sexList = reactive([{
        name: 0,
        sexName: proxy.$t('my.girl'),
    },{
        name: 1,
        sexName: proxy.$t('my.boy'),
    },{
        name: 2,
        sexName: proxy.$t('my.unknown'),
}])


onReady ( () => {
    proxy.uSetBarTitle(proxy.$t('my.infoEdit.infoEdit'));
    upUserInfo();
    getAvatarInfo();
});

//下拉刷新
onPullDownRefresh ( () => {
    proxy.getUserInfo();
    getAvatarInfo();
    setTimeout(function() {
        uni.stopPullDownRefresh();
    }, 500);
});

//暴露方法名"receiveWeTrueMessage"
window["receiveWeTrueMessage"] = async (res) => {
    if (res.code == 200) {
        proxy.postHashToWeTrue(res);
    } else {
        res = null;
    }
    releaseCallback(res);
};

//更新用户信息
const upUserInfo = () => {
    if (userStore.userInfo.sex === 0) {
        userInfoEdit.sexName = proxy.$t('my.girl');
    } else if (userStore.userInfo.sex === 1) {
        userInfoEdit.sexName = proxy.$t('my.boy');
    } else {
        userInfoEdit.sexName = proxy.$t('my.unknown');
    }

    if (userStore.userInfo.isVip) {
        userInfoEdit.isVip = proxy.$t('my.openVipTrue');
    } else {
        userInfoEdit.isVip = proxy.$t('my.openVipFalse');
    }

    if (userStore.userInfo.avatar) {
        userInfoEdit.avatar   = multiavatar( userStore.userInfo.avatar );
        userInfoEdit.avatarID = userStore.userInfo.avatar.slice(0,4) + '...' + userStore.userInfo.avatar.slice(-12);
    } else {
        userInfoEdit.avatar   = multiavatar( userStore.userInfo.userAddress );
        userInfoEdit.avatarID = userStore.userInfo.userAddress.slice(0,4) + '...' + userStore.userInfo.userAddress.slice(-12);
    }  
}
//验证昵称
const checkNickname = () => {
    proxy.$http.post("/User/isNickname", { nickname: userInfoEdit.nickname }).then((res) => {
        if (res.code === 200) {
            if (res.data.isNickname) {
                uni.showToast({
                    title: proxy.$t('my.checkNickname'),
                    icon: "none",
                });
            } else {
                updateNickname();
            }
        }
    });
}
//更新昵称
const updateNickname = async () => {
    boolInfo.btnLoading = true;
    let payload = {
        content: userInfoEdit.nickname,
    };
    let res = await proxy.wetrueSend("nickname", payload);
    releaseCallback(res);
}
//更新性别
const updateSex = async () => {
    boolInfo.btnLoading = true;
    let payload = {
        content: userInfoEdit.userInfo.sex,
    };
    let res = await proxy.wetrueSend('sex',payload);
    releaseCallback(res);
}
//随机头像
const randomAvatar = async () => {
    boolInfo.btnLoading = true;

    if(!userStore.userInfo.isVip) {
        proxy.uShowToast( proxy.$t('my.infoEdit.noVip') );
        boolInfo.btnLoading = false;
        boolInfo.avatarShow = false;
        return;
    }
    if(!userInfoEdit.avatarInfo.randomAvatar) {
        proxy.uShowToast( proxy.$t('my.infoEdit.channel') );
        boolInfo.btnLoading = false;
        boolInfo.avatarShow = false;
        return;
    }
    if ( boolInfo.wttBalance < (userInfoEdit.avatarInfo.recAmount / Math.pow(10, 18)) ) {
        proxy.uShowToast( proxy.$t('my.infoEdit.balanceLow') );
        boolInfo.btnLoading = false;
        return;
    }
    const result = await proxy.contractTransfer(
        userInfoEdit.avatarInfo.recToken,
        userInfoEdit.avatarInfo.recAddress,
        userInfoEdit.avatarInfo.recAmount/ Math.pow(10, 18),
        {type:'random_avatar'}
    );
    if (result) {
        proxy.postHashToWeTrueApi(result); //提交
        setTimeout(() => {
            uni.hideLoading();
            boolInfo.btnLoading = false;
            boolInfo.avatarShow = false;
            getAvatarInfo();
            proxy.uShowToast(proxy.$t('my.infoEdit.waiting') , "none", 3000);
        }, 1000);
    } else {
        boolInfo.btnLoading = false;
        uni.hideLoading();
    }
}
//获取随机头像信息
const getAvatarInfo = () => {
    proxy.$http.post("/Config/randomAvatar").then((res) => {
        if (res.code === 200) {
            userInfoEdit.avatarInfo = res.data;
            getWttBalance();
        }
    });
}
//上链回调
const releaseCallback = (res) => {
    if (JSON.stringify(res) !== "{}" && !!res) {
        setTimeout(() => {
            boolInfo.nameShow = false;
            boolInfo.btnLoading = false;
            uni.hideLoading();
            proxy.getUserInfo();
            upUserInfo();
        }, 2000);
        setTimeout(() => {
            boolInfo.sexShow = false;
            boolInfo.btnLoading = false;
            uni.hideLoading();
            proxy.getUserInfo();
            upUserInfo();
        }, 2000);
    } else {
        boolInfo.btnLoading = false;
        uni.hideLoading();
    }
}
//获取WTT余额
const getWttBalance = () => {
    proxy.getTokenBalance(
        userInfoEdit.avatarInfo.recToken,
        userStore.token
    ).then((res) => {
        userInfoEdit.wttBalance = proxy.balanceFormat( res ) || 0;
    });;
}
</script>

<template>
    <view class="user-info">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-navbar :is-fixed="false" :title="$t('my.infoEdit.infoEdit')" v-show="!validThirdPartySource()">
            <template v-slot:right>
                <u-icon
                    class="mr-30"
                    name="home"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('../../my/index')"
                ></u-icon>
            </template>
        </u-navbar>
        <u-cell-group>
            <u-cell-item 
                :title="$t('my.infoEdit.avatar') + ' ID: ' + userInfoEdit.avatarID"
                @click="boolInfo.avatarShow = true"
            >
                <view
                    class="user-avatar"
                    v-html="userInfoEdit.avatar"
                ></view>
            </u-cell-item>
            <u-cell-item
                :title="$t('my.nickname')"
                :value="userInfoEdit.nickname || $t('my.cryptonym')"
                @click="
                    boolInfo.nameShow = true;
                    nickname = userInfoEdit.nickname;
                "
            >
            </u-cell-item>
            <u-cell-item 
                :title="$t('my.sex')"
                :value="userInfoEdit.sexName"
                @click="boolInfo.sexShow = true">
            </u-cell-item>
            <u-cell-item 
                title="VIP"
                :value="userInfoEdit.isVip"
                :arrow="!userInfoEdit.isVip"
                @click="reLaunchUrl('./openVip')"
            ></u-cell-item>
        </u-cell-group>
        <u-popup
            v-model="boolInfo.nameShow"
            mode="center"
            border-radius="20"
        >
            <view class="name-box">
                <u-input
                    v-model="userInfoEdit.nickname"
                    type="text"
                    :border="true"
                    :placeholder="$t('my.enterNickname')"
                    maxlength="15"
                />
                <u-gap :height="30"></u-gap>
                <u-button
                    type="primary"
                    @click="checkNickname"
                    :loading="boolInfo.btnLoading"
                    >{{ $t('my.send') }}</u-button
                >
            </view>
        </u-popup>
        <u-popup v-model="boolInfo.sexShow" mode="center" border-radius="20">
            <view class="name-box">
                <u-radio-group v-model="userInfoEdit.sex">
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
                    :loading="boolInfo.btnLoading"
                    >{{ $t('my.send') }}</u-button
                >
            </view>
        </u-popup>
        <u-popup v-model="boolInfo.avatarShow" mode="center" border-radius="20">
            <view class="random-avatar">
                <view class="title">
                    <u-image
                        width="92rpx"
                        height="46rpx"
                        src="@/static/logo.png"
                        class="inline mr-5"
                    ></u-image>
                    Random Avatar
                </view>
                <u-gap height="30"></u-gap>
                <view class="text">
                    {{ $t('my.infoEdit.randomAvatarExpend', [ (userInfoEdit.avatarInfo.recAmount / Math.pow(10, 18)) ]) }}<br />
                    {{ $t('my.infoEdit.randomAvatarText') }}<br />
                    <view class="rule">{{ $t('my.infoEdit.avatarRule') }}</view>
                </view>
                <u-gap height="30"></u-gap>
                <u-button
                    type="primary"
                    @click="randomAvatar"
                    :loading="boolInfo.btnLoading"
                >
                {{ $t('my.infoEdit.agree') }}
                </u-button>
                <u-gap :height="20"></u-gap>
                <view>
                    <view class="pull-right">{{ $t('my.infoEdit.balance', [userInfoEdit.wttBalance]) }}</view>
                </view>
            </view>
        </u-popup>

    </view>
</template>

<style lang="scss" scoped>
.user-info {
    .user-avatar {
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
    .random-avatar {
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
