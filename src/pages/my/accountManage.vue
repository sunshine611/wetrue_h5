<template>
    <div class="account-manage">
        <u-navbar title="账户管理">
            <div slot="right">
                <u-icon
                    name="home"
                    class="mr-30"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('index')"
                ></u-icon>
            </div>
        </u-navbar>
        <div class="account">
            <div
                class="account-list"
                v-for="(item, index) in keystoreArr"
                :key="item.public_key"
            >
                <div class="active" v-show="item.public_key === token">
                    <fa-FontAwesome
                        type="fas fa-check"
                        size="24"
                        class="star"
                        color="#fff"
                    >
                    </fa-FontAwesome>
                </div>
                <div
                    class="address"
                    @click="copy(index)"
                    :ref="'address' + index"
                >
                    {{ item.public_key }}
                </div>
                <div class="dotted"></div>
                <div class="opera clearfix">
                    <div class="pull-right">
                        <div
                            class="item"
                            @click="
                                showDelete = true;
                                currentAddress = item.public_key;
                            "
                        >
                            <fa-FontAwesome
                                type="fas fa-trash-alt"
                                size="28"
                                class="mr-6"
                                color="#fff"
                            >
                            </fa-FontAwesome
                            >删除
                        </div>
                        <div class="item">
                            <fa-FontAwesome
                                type="fas fa-qrcode"
                                size="28"
                                class="mr-6"
                                color="#fff"
                            >
                            </fa-FontAwesome
                            >二维码
                        </div>
                        <div class="item">
                            <fa-FontAwesome
                                type="fas fa-hand-point-right"
                                size="28"
                                class="mr-6"
                                color="#fff"
                            >
                            </fa-FontAwesome
                            >切换
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <u-modal
            v-model="showDelete"
            content="是否删除该账户？"
            @confirm="deleteAccount"
            :show-cancel-button="true"
        ></u-modal>
    </div>
</template>

<script>
import { getStore } from "@/util/service";
import UGap from "../../uview-ui/components/u-gap/u-gap.vue";
import Clipboard from "clipboard";
import { mapGetters } from "vuex";
import UButton from "../../uview-ui/components/u-button/u-button.vue";
export default {
    components: { UGap, UButton },
    data() {
        return {
            keystoreArr: getStore("keystoreArr"),
            showDelete: false, //删除弹层
            currentAddress: "", //当前选择的地址
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
        this.isLogin();
    },
    activated() {},
    methods: {
        //判断账户是否为0
        isLogin() {
            if (this.keystoreArr.length === 0) {
                uni.reLaunch({
                    url: "/pages/login/login",
                });
            }
        },
        //删除某个账户
        deleteAccount() {
            this.$store.dispatch("user/deleteKeystoreArr", this.currentAddress);
            this.keystoreArr = getStore("keystoreArr");
            this.isLogin();
        },
        //复制粘贴板
        copy(index) {
            // #ifdef H5
            let clipboard = new Clipboard(this.$refs["address" + index][0], {
                text: (trigger) => {
                    uni.showToast({
                        title: "复制成功",
                        icon: "none",
                        duration: 600,
                    });
                    return this.keystoreArr[index].public_key;
                },
            });
            // #endif
            // #ifndef H5
            let that = this;
            uni.setClipboardData({
                data: that.keystoreArr[index].public_key,
                success: function() {
                    uni.showToast({
                        title: "复制成功",
                        icon: "none",
                        duration: 600,
                    });
                },
            });
            // #endif
        },
    },
};
</script>
<style lang="scss" scoped>
page {
    background: #fff;
}
.account-manage {
    .account {
        margin: 40rpx auto;
        width: 92%;
        .account-list {
            background: #f04a82;
            box-shadow: 0px 0px 10rpx inset rgba($color: #f04a82, $alpha: 0.5);
            margin: 30rpx 0;
            border-radius: 14rpx;
            color: #fff;
            word-wrap: break-word;
            word-break: break-all;
            overflow: hidden;
            position: relative;
            .address {
                padding: 25rpx;
            }
            .dotted {
                border-top: 2rpx dashed #fff;
                position: relative;
                &::before {
                    background: #fff;
                    position: absolute;
                    content: "";
                    height: 20rpx;
                    width: 20rpx;
                    border-radius: 50%;
                    left: -10rpx;
                    top: -12rpx;
                    z-index: 10;
                }
                &::after {
                    background: #fff;
                    position: absolute;
                    content: "";
                    height: 20rpx;
                    width: 20rpx;
                    border-radius: 50%;
                    right: -10rpx;
                    top: -12rpx;
                    z-index: 10;
                }
            }
            .opera {
                padding: 20rpx;
                .item {
                    display: inline-block;
                    margin-right: 30rpx;
                    &:last-child {
                        margin: 0;
                    }
                }
            }
            .active {
                position: absolute;
                right: 0;
                top: 0;
                width: 0;
                height: 0;
                border-top: 60rpx solid #bb0944;
                border-left: 60rpx solid transparent;
                .star {
                    position: absolute;
                    right: 6rpx;
                    top: -52rpx;
                }
            }
        }
    }
}
</style>
