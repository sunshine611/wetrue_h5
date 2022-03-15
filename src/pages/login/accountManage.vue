<template>
    <view class="account-manage">
        <u-status-bar></u-status-bar>
        <u-navbar
            :title="i18n.login.accountManage"
            :placeholder="true"
            :autoBack="true"
        >
            <view slot="right">
                <u-icon
                    name="home"
                    class="mr-30"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('../index/index')"
                ></u-icon>
            </view>

        </u-navbar>
        <view class="account">
            <draggable
                v-model="keystoreArr"
                group="keystore"
                animation="300"
                :preventOnFilter="false"
                delay="100"
            >
                <transition-group>
                    <view
                        class="account-list"
                        v-for="(item, index) in keystoreArr"
                        :key="item.id"
                    >
                        <view class="active" v-show="item.public_key === token">
                            <fa-FontAwesome
                                type="fas fa-check"
                                size="24"
                                class="star"
                                color="#fff"
                            >
                            </fa-FontAwesome>
                        </view>
                        <view
                            class="address"
                            @click="copy(index)"
                            :ref="'address' + index"
                        >
                            <u--text :text="item.public_key"></u--text>
                        </view>
                        <view class="dotted"></view>
                        <view class="opera clearfix">
                            <view class="pull-right">
                                <view
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
                                    </fa-FontAwesome>
                                    <u--text :text="i18n.login.delete"></u--text>
                                </view>
                                <view
                                    class="item"
                                    @click="
                                        showQrcode = true;
                                        currentAddress = item.public_key;
                                    "
                                >
                                    <fa-FontAwesome
                                        type="fas fa-qrcode"
                                        size="28"
                                        class="mr-6"
                                        color="#fff"
                                    >
                                    </fa-FontAwesome>
                                    <u--text :text="i18n.login.qrcode"></u--text>
                                </view>
                                <view
                                    class="item"
                                    @click="switchAccount(item.public_key)"
                                >
                                    <fa-FontAwesome
                                        type="fas fa-hand-point-right"
                                        size="28"
                                        class="mr-6"
                                        color="#fff"
                                    >
                                    </fa-FontAwesome>
                                    <u--text :text="i18n.login.replace"></u--text>
                                </view>
                            </view>
                        </view>
                    </view>
                </transition-group>
            </draggable>

            <u-gap :height="120"></u-gap>
        </view>
        <u-modal
            v-model="showDelete"
            :content="i18n.login.deleteAccount"
            @confirm="deleteAccount"
            :show-cancel-button="true"
        ></u-modal>
        <view class="add-area">
            <u-button
                class="add-btn"
                shape="circle"
                type="primary"
                :plain="true"
                @click="goUrl('login')"
                ><fa-FontAwesome
                    type="fas fa-user-plus"
                    size="28"
                    class="mr-10"
                    color="#f04a82"
                >
                </fa-FontAwesome>
                <u--text :text="i18n.login.addAccount"></u--text>
            </u-button>
        </view>
        <Qrcode v-model="showQrcode" :address="currentAddress"></Qrcode>
    </view>
</template>

<script>
import { getStore, setStore } from "@/util/service";
import { mapGetters } from "vuex";
import Qrcode from "@/components/Qrcode";
import draggable from "vuedraggable";

export default {
    components: { 
        Qrcode,
        draggable
    },
    data() {
        return {
            keystoreArr: getStore("keystoreArr"),
            showDelete: false, //删除弹层
            currentAddress: "", //当前选择的地址
            showQrcode: false, //二维码弹层
        };
    },
    watch: {
        keystoreArr: {
            handler() {
                this.$nextTick(() => {
                    setStore("keystoreArr", this.keystoreArr);
                });
            },
            deep: true,
        },
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
        this.isLogin();
        this.uSetBarTitle(this.i18n.titleBar.accountManage);
    },
    activated() {},
    methods: {
        //切换账户
        switchAccount(address) {
            this.$store.dispatch("user/switchAccount", address);
            uni.reLaunch({
                url: "/pages/my/index",
            });
        },
        //删除某个账户
        deleteAccount() {
            this.$store.dispatch("user/deleteKeystoreArr", this.currentAddress);
            this.keystoreArr = getStore("keystoreArr");
            this.isLogin();
        },
        //判断账户是否为0
        isLogin() {
            if (this.keystoreArr.length === 0) {
                uni.reLaunch({
                    url: "/pages/login/login",
                });
            }
        },
        //复制粘贴板
        copy(index) {
           this.copyContent(this.keystoreArr[index].public_key);
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
                padding: 0rpx 30rpx;
                .item {
                    display: inline-block;
                    margin-right: 30rpx;
                    padding: 20rpx 0;
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
    .add-area {
        background: #fff;
        position: fixed;
        width: 100%;
        height: 120rpx;
        left: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0px 0px 10rpx rgba($color: #f04a82, $alpha: 0.5);
        .add-btn {
            width: 92%;
        }
    }
}
</style>
