<script setup>
import { ref, reactive, getCurrentInstance, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { onLoad } from '@dcloudio/uni-app';
import { getStore, setStore } from "@/util/service";
import Qrcode from "@/components/Qrcode";
import draggable from "vuedraggable";
const { proxy } = getCurrentInstance();
import { useUserStore } from "@/stores/userStore";
const userStore = useUserStore();

const ksData = reactive({
    drag: false,
    keystoreArr: getStore("keystoreArr")
});

const showQrcode = ref( false ) //二维码弹层
const showDelete = ref( false ) //删除弹层
const currentAddress = ref( "" ) //当前选择的地址
const amHeight = ref( 0 ) //数组换算高度
const token = ref( getStore("token") )

onLoad ( () => {
    isLogin();
    proxy.uSetBarTitle(proxy.$t('titleBar.accountManage'));
});

watch(
    () => ksData.keystoreArr,
    (val) => {
        setStore("keystoreArr", val);
        amHeight.value = (val.length * 150)>680 ? 680 : (val.length * 150);
    }
);

const openQrcode = (val) => {
    currentAddress.value = val;
    showQrcode.value = true;
};

//切换账户
const switchAddress = (address) => {
    userStore.changeAccount(address)
    uni.reLaunch({
        url: "/pages/my/index",
    });
};

//删除某个账户
const deleteAccount = async () => {
    userStore.deleteKeystoreArr(currentAddress.value);
    ksData.keystoreArr = await getStore("keystoreArr");
    if (ksData.keystoreArr.length !== 0) {
        userStore.changeAccount(ksData.keystoreArr[0].public_key);
        proxy.getUserInfo();
    }
    isLogin();
};

//判断账户是否为0
const isLogin = () => {
    if (ksData.keystoreArr.length === 0) {
        uni.reLaunch({
            url: "/pages/login/login",
        });
    }
};
//复制粘贴板
const copy = (value) => {
    showQrcode.value = false
    proxy.copyContent(value);
};
</script>

<template>
    <view class="account-manage">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-navbar :is-fixed="false" :title="$t('login.accountManage')">
            <template v-slot:right>
                <u-icon
                    name="home"
                    class="mr-30"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('../index/index')"
                ></u-icon>
            </template>
        </u-navbar>
        <view class="account">
            <draggable 
                v-model="ksData.keystoreArr" 
                group="keystore" 
                @start="ksData.drag=true" 
                @end="ksData.drag=false"
                itemKey="id"
            >
                <template #item="{ element }">
                    <view class="account-list">
                        <view class="active" v-show="element.public_key === token">
                            <Icon
                                icon="fa:check"
                                class="star"
                                width="14"
                                color="#fff"
                            />
                        </view>
                        <view
                            class="address"
                            @click="copy(element.public_key)"
                            :ref="'address' + element.id"
                        >
                            {{ element.public_key }}
                        </view>
                        <view class="dotted"></view>
                        <view class="opera clearfix">
                            <view class="pull-right">
                                <view
                                    class="item"
                                    @click="
                                        showDelete = true;
                                        currentAddress = element.public_key;
                                    "
                                >
                                    <Icon
                                        icon="fa:trash"
                                        width="12"
                                        class="mr-6"
                                        color="#fff"
                                    />
                                    {{ $t('login.delete') }}
                                </view>
                                <view
                                    class="item"
                                    @click="openQrcode(element.public_key)"
                                >
                                    <Icon
                                        icon="fa:qrcode"
                                        width="12"
                                        class="mr-6"
                                        color="#fff"
                                    />
                                    {{ $t('login.qrcode') }}
                                </view>
                                <view
                                    class="item"
                                    @click="switchAddress(element.public_key)"
                                >
                                    <Icon
                                        icon="fa-solid:hand-point-right"
                                        width="14"
                                        class="mr-6"
                                        color="#fff"
                                    />
                                    {{ $t('login.replace') }}
                                </view>
                            </view>
                        </view>
                    </view>
                </template>
            </draggable>
        
            <u-gap :height="680-amHeight"></u-gap>
        </view>
        <u-modal
            :show-title="false"
            v-model="showDelete"
            :content="$t('login.deleteAccount')"
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
                >
                <Icon
                    icon="fa:user-plus"
                    width="20"
                    class="mr-10"
                    color="#f04a82"
                />
                {{ $t('login.addAccount') }}
            </u-button>
        </view>
        <Qrcode v-model="showQrcode" :address="currentAddress"></Qrcode>
    </view>
</template>

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
