<!--质押挖矿-->
<template>
    <div class="mapping-dig">
        <div class="icon-list" v-show="!validThirdPartySource()">
        <view :style="`padding-top:${statusBarHeight}px`"></view>
            <u-icon
                name="home"
                class="mr-30"
                size="34"
                color="#fff"
                @click="reLaunchUrl('../../index/index')"
            ></u-icon>
        </div>
        <div class="title">开通<br />WeTrue VIP</div>
        <div class="open-mapping" v-if="!userInfo.isVip">
            <div class="title">
                <u-image
                    width="92rpx"
                    height="46rpx"
                    src="@/static/logo.png"
                    class="inline mr-5"
                ></u-image>
                开通 WeTrue VIP
            </div>
            <div class="content">
                <div class="text">
                    开通需支付 {{ configInfo.openMapAmount / Math.pow(10, 18) }} WTT。
                </div>
            </div>
            <u-checkbox-group>
                <u-checkbox v-model="isAgree" name="同意开通">
                    同意
                </u-checkbox>
            </u-checkbox-group>
            <u-gap :height="30"></u-gap>
            <u-button type="primary" @click="open" :loading="btnLoading"
                >开通</u-button
            >
            <u-gap :height="20"></u-gap>
            <div class="clearfix">
                <div class="pull-right">WTT余额: {{ wttBalance }} WTT</div>
            </div>
        </div>

        <div class="start-mapping" v-else>
            <div class="mapping">
                已开通
            </div>
        </div>
        <div class="rule">
            <div class="h3">开通 WeTrue VIP 规则</div>
            <u-gap :height="10"></u-gap>
            <b>开通费用: </b> {{ configInfo.openMapAmount / Math.pow(10, 18) }} WTT.<br />
            <u-gap :height="10"></u-gap>
            <b>VIP权益: </b>
            <br />WeTrue会员专属功能.如:映射挖矿、头像更换等<br />
            <u-gap :height="10"></u-gap>
            <b>规则说明: </b>
            <br />WeTrue将根据生态所需不定期开通或关闭VIP开通通道<br />
            <u-gap :height="10"></u-gap>
            <b>消耗去哪: </b>
            <br />所消耗WTT将划转至[AE中国社区公共账户]供后续生态发展使用.<br />
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import { getStore } from "@/util/service";
import Request from "luch-request";
const http = new Request();
import Backend from "@/util/backend";

export default {
    components: {

    },
    data() {
        return {
            userInfo: {}, //用户信息
            isAgree: false, //是否同意
            btnLoading: false, //按钮状态
            configInfo: getStore("configInfo"), //后端配置项
            wttBalance: 0, //账户WTT余额
        };
    },
    computed: {
        ...mapGetters(["token"]),
    },
    onLoad() {
        this.getUserInfo();
        this.getWttBalance();
        this.getConfigInfo();
    },
    //下拉刷新
    onPullDownRefresh() {
        this.getUserInfo();
        this.getWttBalance();
        setTimeout(function() {
            uni.stopPullDownRefresh();
        }, 500);
    },
    methods: {
        //获取用户信息
        getUserInfo() {
            let params = {
                userAddress: this.token,
            };
            this.$http
                .post("/User/info", params, { custom: { isToast: true } })
                .then((res) => {
                    if (res.code === 200) {
                        this.userInfo = res.data;
                    }
                });
        },
        //开通映射挖矿
        open() {
            if (this.isAgree) {
                this.btnLoading = true;
                this.$http.post("/Mining/submitState").then((res) => {
                    if (res.code === 200) {
                        if (res.data) {
                            this.uShowToast("开通中，请勿重复提交！");
                        } else {
                            this.startOpen();
                        }
                    }
                });
                this.btnLoading = false;
            } else {
                this.uShowToast("请阅读并勾选同意开通！");
            }
        },
        //开始开通
        async startOpen() {
            /*
            const result = await this.contractTransfer(
                this.configInfo.wttContract,
                this.configInfo.openMapAddress,
                this.configInfo.openMapAmount / Math.pow(10, 18)
            );
            
            if (result) {
                this.$http.post("/Mining/openAccount", { hash: result.hash });
                this.getUserInfo();
                this.getWttBalance();
                this.uShowToast("执行开通中，请30秒后再来！", "none", 3000);
            }
            */
           this.uShowToast("开发中", "none", 3000);
        },
        //获取WTT余额
        getWttBalance() {
            http.get(
                Backend.aeMdwApiMyToken(this.token, this.configInfo.wttContract)
            ).then((res) => {
                this.wttBalance = res.data.amount || 0;
            });
        },
    },
};
</script>
<style lang="scss" scoped>
page {
    background-color: #beb8c8;
}
.mapping-dig {
    background: url("@/static/openvip_bg.png") no-repeat;
    background-size: 100%;
    display: flex;
    justify-content: center;
    flex-flow: wrap;
    position: relative;
    .icon-list {
        position: absolute;
        right: 0rpx;
        top: 30rpx;
    }
    & > .title {
        position: absolute;
        top: 150rpx;
        left: 10%;
        font-size: 46rpx;
        font-weight: 600;
        color: #fff;
        line-height: 70rpx;
    }
    .start-mapping {
        margin-top: 400rpx;
        background: #fff;
        width: 80%;
        min-height: 400rpx;
        border-radius: 30rpx;
        padding: 40rpx;
        box-sizing: border-box;
        position:relative;
        .title {
            font-size: 36rpx;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
    .open-mapping {
        margin-top: 400rpx;
        background: #fff;
        width: 80%;
        min-height: 400rpx;
        border-radius: 30rpx;
        padding: 40rpx;
        box-sizing: border-box;
        position: relative;
        .title {
            font-size: 36rpx;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .content {
            .text {
                margin: 40rpx 0 20rpx;
            }
        }
    }
    .rule {
        color: #000;
        width: 80%;
        padding: 50rpx 0;
        line-height: 50rpx;
        font-size: 24rpx;
        .h3 {
            color: #604fff;
            font-size: 28rpx;
            font-weight: 600;
        }
    }
    .top-content {
        padding: 50rpx 40rpx;
        .title {
            font-size: 36rpx;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
}
</style>
