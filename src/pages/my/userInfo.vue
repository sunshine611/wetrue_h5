<template>
    <div class="user-info">
        <u-navbar title="用户信息">
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
            <u-cell-item title="头像">
                <image
                    :src="userInfo.portrait"
                    slot="right-icon"
                    class="user-head"
                ></image>
            </u-cell-item>
            <u-cell-item
                title="昵称"
                :value="userInfo.nickname || '匿名'"
                @click="nameShow = true"
            >
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
                    placeholder="请输入昵称"
                    maxlength="10"
                />
                <u-gap :height="30"></u-gap>
                <u-button
                    type="primary"
                    @click="checkNickname"
                    :loading="btnLoading"
                    >提交</u-button
                >
            </view>
        </u-popup>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import UButton from "../../uview-ui/components/u-button/u-button.vue";
import UCellItem from "../../uview-ui/components/u-cell-item/u-cell-item.vue";
import UGap from "../../uview-ui/components/u-gap/u-gap.vue";
export default {
    components: { UCellItem, UButton, UGap },
    data() {
        return {
            userInfo: {
                userHead: "", //用户头像
                nickname: "匿名", //用户昵称
            },
            nameShow: false, //名字弹层
            nickname: "", //昵称
            btnLoading: false,
        };
    },
    computed: {
        ...mapGetters(["token"]),
        //国际化
        i18n() {
            return this.$_i18n.messages[this.$_i18n.locale];
        },
    },
    onLoad() {
        this.getUserInfo();
    },
    //上拉刷新
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
                }
                this.loading = false;
            });
        },
        //验证昵称
        checkNickname(){
            this.$http
                .post("/User/isNickname", { nickname: this.nickname })
                .then((res) => {
                    if (res.code === 200) {
                        if (res.isNickname) {
                            uni.showToast({
                                title: '该昵称已存在，请重新选择',
                                icon:'none'
                            });
                        }else{
                            this.updateNickname();
                        }
                    }
                });
        },
        //更新昵称
        async updateNickname() {
            this.btnLoading = true;
            uni.showLoading({
                title: this.i18n.index.inChain,
            });
            let payload = {
                content: this.nickname,
            };
            let res = await this.sendNickname(payload);
            if (!!res.hash) {
                uni.hideLoading();
                this.nameShow = false;
                this.btnLoading = false;
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
