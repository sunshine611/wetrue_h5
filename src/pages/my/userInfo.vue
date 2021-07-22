<template>
    <view class="user-info">
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
        <div class="user-box">
            <div class="user-top">
                <div class="head">
                    <HeadImg
                        :userInfo="userInfo"
                        width="120rpx"
                        height="120rpx"
                    ></HeadImg>
                    <u-gap height="10"></u-gap>
                    <div :class="[userInfo.isAuth ? 'auth' : '']">
                        {{ userInfo.nickname || i18n.my.cryptonym }}
                    </div>
                </div>
                <div class="address" @tap="copy" id="copy">
                    {{ address }}
                </div>
            </div>
            <div class="user-bottom">
                <div class="item">
                    <div class="value">
                        {{ userInfo.topic || 0 }}
                    </div>
                    <div class="label">{{ i18n.my.topic }}</div>
                </div>
                <div class="item">
                    <div class="value">
                        {{ userInfo.star || 0 }}
                    </div>
                    <div class="label">{{ i18n.my.star }}</div>
                </div>
                <div class="item">
                    <div class="value">
                        {{ userInfo.active || 0 }}
                    </div>
                    <div class="label">{{ i18n.my.active }}</div>
                </div>
                <div class="item">
                    <div class="value">
                        {{ userInfo.focus || 0 }}
                    </div>
                    <div class="label">{{ i18n.my.focus }}</div>
                </div>
                <div class="item">
                    <div class="value">
                        {{ userInfo.fans || 0 }}
                    </div>
                    <div class="label">{{ i18n.my.fans }}</div>
                </div>
            </div>
        </div>
        <u-tabs
            :list="tabList"
            :is-scroll="false"
            :current="current"
            @change="tabChange"
            active-color="#f04a82"
            style="border-bottom:1px solid #e4e7ed"
        ></u-tabs>
        <TopicList
            :postList="postList"
            v-if="current === 0 || current === 1"
        ></TopicList>
        <User :userList="postList" v-if="current === 2 || current === 3"></User>
        <BalanceList
            :tokenList="postList"
            :userAddress="userAddress"
            v-if="current === 4"
        ></BalanceList>
        <div class="empty" v-show="postList.length === 0">
            <u-empty :text="i18n.index.noData" mode="list"></u-empty>
        </div>
        <u-loadmore
            bg-color="rgba(0,0,0,0)"
            class="mb-20 mt-20"
            :status="more"
            v-show="postList.length > 0"
        />
        <u-gap :height="10"></u-gap>
    </view>
</template>

<script>
import Request from "luch-request";
const http = new Request();
import { mapGetters } from "vuex";
import TopicList from "../../components/TopicList.vue";
import HeadImg from "@/components/HeadImg.vue";
import Clipboard from "clipboard";
import User from "@/components/User.vue";
import BalanceList from "@/components/BalanceList.vue";
import { aeknow, nodeUrl } from "@/config/config.js";
import UGap from "../../uview-ui/components/u-gap/u-gap.vue";
export default {
    components: {
        TopicList,
        HeadImg,
        User,
        BalanceList,
        UGap,
    },
    data() {
        return {
            userAddress: "", //用户地址
            postList: [], //帖子列表
            pageInfo: {
                page: 1,
                pageSize: 10,
                totalPage: 1,
            }, //页码信息
            more: "loadmore", //加载更多
            userInfo: {}, //用户信息
            address: "", //用户格式化地址
            current: 0, //tab当前选项
            tabList: [
                {
                    name: "帖子",
                },
                {
                    name: "收藏",
                },
                {
                    name: "关注",
                },
                {
                    name: "粉丝",
                },
                {
                    name: "账户",
                },
            ],
        };
    },
    //上拉刷新
    onPullDownRefresh() {
        this.pageInfo.page = 1;
        this.getUserInfo();
        this.getPostList();
        setTimeout(function() {
            uni.stopPullDownRefresh();
        }, 500);
    },
    //下拉加载
    onReachBottom() {
        this.pageInfo.page++;
        this.getPostList();
        this.getUserInfo();
    },
    onLoad(option) {
        this.userAddress = option.userAddress;
        this.getUserInfo();
        this.getPostList();
    },
    computed: {
        ...mapGetters(["token"]),
        //国际化
        i18n() {
            return this.$_i18n.messages[this.$_i18n.locale];
        },
    },
    methods: {
        //获取用户信息
        getUserInfo() {
            let params = {
                userAddress: this.userAddress,
            };
            this.$http.post("/User/info", params).then((res) => {
                if (res.code === 200) {
                    this.userInfo = res.data;
                    this.address = "";
                    for (
                        let i = 0, len = this.userAddress.length;
                        i < len;
                        i++
                    ) {
                        this.address += this.userAddress[i];
                        if (i % 3 === 2) this.address += " ";
                    }
                }
            });
        },
        //获取帖子列表
        getPostList() {
            let params, url;
            if (this.current === 0) {
                params = {
                    page: this.pageInfo.page,
                    size: this.pageInfo.pageSize,
                    userAddress: this.userAddress,
                };
                url = "/User/contentList";
            } else if (this.current === 1) {
                params = {
                    page: this.pageInfo.page,
                    size: this.pageInfo.pageSize,
                    userAddress: this.userAddress,
                };
                url = "/Content/starList";
            } else if (this.current === 2) {
                params = {
                    page: this.pageInfo.page,
                    size: this.pageInfo.pageSize,
                    focus: "myFocus",
                    userAddress: this.userAddress,
                };
                url = "/User/focusList";
            } else if (this.current === 3) {
                params = {
                    page: this.pageInfo.page,
                    size: this.pageInfo.pageSize,
                    focus: "focusMy",
                    userAddress: this.userAddress,
                };
                url = "/User/focusList";
            }
            this.$http
                .post(url, params, {
                    custom: { isToast: true },
                })
                .then((res) => {
                    if (res.code === 200) {
                        this.pageInfo.totalPage = parseInt(res.data.totalPage);
                        this.more = "loadmore";
                        if (this.pageInfo.page === 1) {
                            this.$nextTick(() => {
                                if (this.current === 0 || this.current === 1) {
                                    this.postList = res.data.data.map(
                                        (item) => {
                                            item.payload = this.topicHighlight(
                                                item.payload
                                            );
                                            return item;
                                        }
                                    );
                                } else {
                                    this.postList = res.data.data;
                                }
                            });
                        } else {
                            if (this.pageInfo.page > this.pageInfo.totalPage) {
                                this.pageInfo.page = this.pageInfo.totalPage;
                                this.more = "nomore";
                            } else {
                                if (this.current === 0 || this.current === 1) {
                                    this.postList = this.postList.concat(
                                        res.data.data.map((item) => {
                                            item.payload = this.topicHighlight(
                                                item.payload
                                            );
                                            return item;
                                        })
                                    );
                                } else {
                                    this.postList = this.postList.concat(
                                        res.data.data
                                    );
                                }
                            }
                        }
                    } else {
                        this.more = "nomore";
                    }
                });
        },
        //获取账户token列表
        getTokenList() {
            uni.showLoading({
                title: "加载中",
            });
            http.get(nodeUrl + "v3/accounts/" + this.userAddress)
                .then((res) => {
                    this.postList.push({
                        balance: res.data.balance,
                        tokenname: "AE",
                        decimal: 18,
                        owner_id: "",
                        contract: "",
                    });
                })
                .then(() => {
                    http.get(aeknow + "api/token/" + this.userAddress).then(
                        (res) => {
                            if (res.data.tokens.length > 0) {
                                this.postList = this.postList.concat(res.data.tokens);
                            }
                            uni.hideLoading();
                            this.more = "nomore";
                        }
                    );
                });
        },
        //切换tab
        tabChange(index) {
            this.current = index;
            this.postList = [];
            if ([0, 1, 2, 3].includes(index)) {
                this.pageInfo.page = 1;
                this.getPostList();
            } else if (index === 4) {
                this.getTokenList();
            }
        },
        //复制粘贴板
        copy() {
            // #ifdef H5
            let clipboard = new Clipboard("#copy", {
                text: (trigger) => {
                    uni.showToast({
                        title: "复制成功",
                        icon: "none",
                        duration: 600,
                    });
                    return this.userInfo.userAddress;
                },
            });
            // #endif
            // #ifndef H5
            let that = this;
            uni.setClipboardData({
                data: that.userInfo.userAddress,
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
.user-info {
    .user-box {
        background-color: rgba($color: #fff, $alpha: 0.9);
        font-size: 26upx;
        box-sizing: border-box;
        margin-bottom: 20rpx;
        box-shadow: 0px 2px 6px 0px rgba($color: #999, $alpha: 0.3);
        .user-top {
            padding: 30rpx 30rpx 0 30rpx;
            display: flex;

            .head {
                text-align: center;
                font-size: 24upx;
                padding: 20rpx 30rpx;
                .auth {
                    color: #2979ff;
                    font-weight: bold;
                    display: inline-block;
                }
            }

            .address {
                display: inline-flex;
                flex-wrap: wrap;
                align-items: center;
                line-height: 50rpx;
                font-size: 34rpx;
                color: #f04a82;
            }
        }

        .user-bottom {
            display: flex;
            justify-content: space-around;
            padding: 10rpx 30rpx 30rpx;

            .item {
                text-align: center;

                .value {
                    font-size: 24rpx;
                    color: #000;
                }

                .label {
                    font-size: 24rpx;
                    color: #666;
                }
            }
        }
    }
}
</style>
