<script setup>
import { ref, getCurrentInstance } from 'vue'
import { Icon } from '@iconify/vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from "@/stores/userStore";

import draggable from "vuedraggable";
const { proxy } = getCurrentInstance();
const userStore = useUserStore();

const drag = ref( false )
const showDelete = ref( false ) //删除弹层
const currentAddress = ref( "" ) //当前选择的地址

onLoad ( () => {
    proxy.uSetBarTitle(proxy.$t('my.blacklistManage'));
})

//删除某个账户
const deleteBlack = () => {
    userStore.deleteBlacklist(currentAddress.value);
};

</script>

<template>
    <view class="blacklist-manage">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-navbar
            :is-fixed="false"
            :title="$t('my.blacklistManage')"
            v-show="!validThirdPartySource()"
        >
            <template v-slot:right>
                <u-icon
                    class="mr-30"
                    name="home"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('../../index/index')"
                ></u-icon>
            </template>
        </u-navbar>
        <view class="account">
            <draggable 
                v-model="userStore.blacklist" 
                group="keystore" 
                @start="drag=true" 
                @end="drag=false"
                itemKey="id"
            >
                <template #item="{ element }">
                    <view class="account-list">
                        <view
                            class="address"
                            :ref="'address' +  element.index"
                        >
                            {{  element }}
                        </view>
                        <view class="dotted"></view>
                        <view class="opera clearfix">
                            <view class="pull-right">
                                <view
                                    class="item"
                                    @click="
                                        showDelete = true;
                                        currentAddress = element;
                                    "
                                >
                                    <Icon
                                        icon="fa:check"
                                        width="14"
                                        class="mr-6"
                                        color="#fff"
                                    />
                                    {{ $t('login.delete') }}
                                </view>
                            </view>
                        </view>
                    </view>
                </template>
            </draggable>
            <u-gap height="1080"></u-gap>
        </view>
        <u-modal
            :show-title="false"
            v-model="showDelete"
            :content="$t('my.deleteBlacklist')"
            @confirm="deleteBlack"
            :show-cancel-button="true"
        ></u-modal>
    </view>
</template>

<style lang="scss" scoped>
page {
    background: #fff;
}
.blacklist-manage {
    .account {
        margin: 40rpx auto;
        width: 92%;
        .account-list {
            background: #383838;
            box-shadow: 0px 0px 10rpx inset rgba($color: #b02525, $alpha: 0.5);
            margin: 20rpx 0;
            border-radius: 14rpx;
            color: #fff;
            word-wrap: break-word;
            word-break: break-all;
            overflow: hidden;
            position: relative;
            .address {
                padding: 15rpx;
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
                    margin-right: 20rpx;
                    padding: 15rpx 0;
                    &:last-child {
                        margin: 0;
                    }
                }
            }
        }
    }
}
</style>
