<template>
    <div class="blacklist-manage">
        <view :style="`padding-top:${statusBarHeight}px`"></view>
        <u-navbar :is-fixed="false" :title="$t('my.blacklistManage')">
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
        <div class="account">
            <draggable
                v-model="blacklist"
                group="keystore"
                animation="300"
                :preventOnFilter="false"
                delay="100"
            >
                <transition-group>
                    <div
                        class="account-list"
                        v-for="(item, index) in blacklist"
                        :key="item"
                    >
                        <div
                            class="address"
                            :ref="'address' + index"
                        >
                            {{ item }}
                        </div>
                        <div class="dotted"></div>
                        <div class="opera clearfix">
                            <div class="pull-right">
                                <div
                                    class="item"
                                    @click="
                                        showDelete = true;
                                        currentAddress = item;
                                    "
                                >
                                    <fa-FontAwesome
                                        type="fas fa-trash-alt"
                                        size="28"
                                        class="mr-6"
                                        color="#fff"
                                    >
                                    </fa-FontAwesome>
                                    {{ $t('login.delete') }}
                                </div>
                            </div>
                        </div>
                    </div>
                </transition-group>
            </draggable>
            <u-gap height="1080"></u-gap>
        </div>
        <u-modal
            :show-title="false"
            v-model="showDelete"
            :content="$t('my.deleteBlacklist')"
            @confirm="deleteBlacklist"
            :show-cancel-button="true"
        ></u-modal>
    </div>
</template>

<script>
import { getStore, setStore } from "@/util/service";
import { mapGetters } from "vuex";
import draggable from "vuedraggable";

export default {
    components: { 
        draggable,
    },
    data() {
        return {
            blacklist: getStore("blacklist"),
            showDelete: false, //删除弹层
            currentAddress: "", //当前选择的地址
        };
    },
    watch: {
        blacklist: {
            handler() {
                this.$nextTick(() => {
                    setStore("blacklist", this.blacklist);
                });
            },
            deep: true,
        },
    },
    computed: {
        ...mapGetters(["token"]),
    },
    onLoad() {
        this.uSetBarTitle(this.$t('my.blacklistManage'));
    },
    activated() {},
    methods: {
        //删除某个账户
        deleteBlacklist() {
            this.$store.dispatch("user/deleteBlacklist", this.currentAddress);
            this.blacklist = getStore("blacklist");
        },
    },
};
</script>
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
