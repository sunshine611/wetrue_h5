<template>
    <view class="wrap">
        <u-navbar :title="i18n.index.replyDetails">
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
        <view class="comment">
            <view class="top">
                <view class="left">
                    <div class="head-box">
                        <HeadImg
                            :userInfo="commentInfo.users"
                            :isLink="true"
                            width="70rpx"
                            height="70rpx"
                        ></HeadImg>
                    </div>
                    <view class="user-info">
                        <Name :userInfo="commentInfo.users"></Name>
                        <view class="date"
                            >{{
                                $moment(commentInfo.utcTime).format(
                                    "yyyy-MM-DD HH:mm:ss"
                                )
                            }}
                        </view>
                    </view>
                </view>
                <view
                    class="right"
                    :class="{ highlight: commentInfo.isPraise }"
                >
                    {{ commentInfo.praise }}
                    <u-icon
                        v-if="!commentInfo.isPraise"
                        name="thumb-up"
                        class="like"
                        color="#9a9a9a"
                        :size="30"
                        @click="praise('comment')"
                    ></u-icon>
                    <u-icon
                        v-if="commentInfo.isPraise"
                        name="thumb-up-fill"
                        class="like"
                        :size="30"
                        @click="praise('comment')"
                    ></u-icon>
                </view>
            </view>
            <view class="content">
                <mp-html :content="commentInfo.payload" :selectable="true" />
            </view>
        </view>
        <view class="all-reply">
            <view class="all-reply-top"
                ><text class="mr-6">{{ i18n.index.allReply }}</text
                >{{ pageInfo.totalSize }}</view
            >
            <view class="item" v-for="(item, index) in replyList" :key="index">
                <view class="comment">
                    <view class="top">
                        <view class="left">
                            <div class="head-box">
                                <HeadImg
                                    :userInfo="item.users"
                                    :isLink="true"
                                    width="70rpx"
                                    height="70rpx"
                                ></HeadImg>
                            </div>
                            <view class="user-info">
                                <Name :userInfo="item.users"></Name>
                                <view class="date"
                                    >{{
                                        $moment(item.utcTime).format(
                                            "yyyy-MM-DD HH:mm:ss"
                                        )
                                    }}
                                </view>
                            </view>
                        </view>
                        <view
                            class="right"
                            :class="{ highlight: item.isPraise }"
                        >
                            <view class="num">{{ item.praise }}</view>
                            <u-icon
                                v-if="!item.isPraise"
                                name="thumb-up"
                                class="like"
                                :size="30"
                                color="#9a9a9a"
                                @click="praise('reply', item)"
                            ></u-icon>
                            <u-icon
                                v-if="item.isPraise"
                                name="thumb-up-fill"
                                class="like"
                                :size="30"
                                @click="praise('reply', item)"
                            ></u-icon>
                        </view>
                    </view>
                    <view class="content">
                        <text v-if="item.replyHash"
                            >回复<text
                                :class="['name', item.receiverIsAuth ? 'auth' : '']"
                                @click.stop="
                                    goUrl(
                                        '/pages/my/userInfo?userAddress=' +
                                            item.toAddress
                                    )
                                "
                                >{{
                                    "@" +
                                        (item.receiverName ||
                                            item.toAddress.slice(-4))
                                }}</text
                            >：</text
                        ><mp-html
                            :content="item.payload"
                            :selectable="true"
                            class="compiler"
                    /></view>
                </view>
            </view>
        </view>
        <u-gap height="20"></u-gap>
        <u-loadmore
            bg-color="rgba(0,0,0,0)"
            margin-bottom="20"
            :status="more"
            v-show="replyList.length > 0"
        />
        <u-gap height="20"></u-gap>
    </view>
</template>

<script>
import mpHtml from "mp-html/dist/uni-app/components/mp-html/mp-html";
import HeadImg from "@/components/HeadImg";
import Name from "@/components/Name";
export default {
    components: {
        mpHtml,
        HeadImg,
        Name,
    },
    data() {
        return {
            replyList: [], //回复评论列表
            commentInfo: {
                users: {
                    portrait: "",
                    userAddress: "",
                },
            }, //评论信息
            pageInfo: {
                page: 1,
                pageSize: 10,
                totalPage: 1,
                totalSize: 0,
            }, //页码信息
            more: "loadmore", //加载更多
        };
    },
    //上拉刷新
    onPullDownRefresh() {
        this.getCommentInfo();
        this.pageInfo.page = 1;
        this.getReply();
        setTimeout(function() {
            uni.stopPullDownRefresh();
        }, 500);
    },
    //下拉加载
    onReachBottom() {
        this.pageInfo.page++;
        this.getReply();
    },
    onLoad(option) {
        this.hash = option.hash;
        this.getCommentInfo();
        this.getReply();
    },
    computed: {
        //国际化
        i18n() {
            return this.$_i18n.messages[this.$_i18n.locale];
        },
    },
    methods: {
        //获取评论详情
        getCommentInfo() {
            let params = {
                hash: this.hash,
            };
            this.$http.post("/Comment/tx", params).then((res) => {
                if (res.code === 200) {
                    this.commentInfo = res.data;
                }
            });
        },
        // 回复列表
        getReply() {
            let params = {
                hash: this.hash,
                page: this.pageInfo.page,
                size: this.pageInfo.pageSize,
            };
            this.$http
                .post("/Reply/list", params, { custom: { isToast: true } })
                .then((res) => {
                    if (res.code === 200) {
                        this.pageInfo.totalPage = parseInt(res.data.totalPage);
                        this.pageInfo.totalSize = parseInt(res.data.totalSize);
                        this.more = "loadmore";
                        if (this.pageInfo.page === 1) {
                            this.replyList = res.data.data;
                        } else {
                            if (this.pageInfo.page > this.pageInfo.totalPage) {
                                this.pageInfo.page = this.pageInfo.totalPage;
                                this.more = "nomore";
                            } else {
                                this.replyList = this.replyList.concat(
                                    res.data.data
                                );
                            }
                        }
                        if (status == "pullDown") {
                            uni.stopPullDownRefresh();
                            this.replyList = res.data.data;
                        }
                    } else {
                        this.more = "nomore";
                    }
                });
        },
        //是否点赞
        praise(type, item) {
            if (type === "comment") {
                let params = {
                    hash: this.hash,
                    type: type,
                };
                this.$http.post("/Submit/praise", params).then((res) => {
                    if (res.code === 200) {
                        this.commentInfo.isPraise = res.data.isPraise;
                        this.commentInfo.praise = res.data.praise;
                    }
                });
            } else if (type === "reply") {
                let params = {
                    hash: item.hash,
                    type: type,
                };
                this.$http.post("/Submit/praise", params).then((res) => {
                    if (res.code === 200) {
                        item.isPraise = res.data.isPraise;
                        item.praise = res.data.praise;
                    }
                });
            }
        },
    },
};
</script>

<style lang="scss" scoped>
page {
    background-color: #f2f2f2;
}

.comment {
    padding: 30rpx;
    font-size: 32rpx;
    background-color: #ffffff;

    .top {
        display: flex;
        justify-content: space-between;
    }

    .content {
        font-size: 32rpx;
        padding: 20rpx 0 0 0;
        word-wrap: break-word;
        word-break: break-all;
        overflow: hidden;
        .name {
            color: #f04a82;
            &.auth {
                color: #2979ff;
                font-weight: bold;
            }
        }
        .compiler {
            display: inline !important;
            /deep/ * {
                display: inline !important;
                word-wrap: break-word;
                word-break: break-all;
                overflow: hidden;
            }
        }
    }

    .left {
        display: flex;

        .head-box {
            margin-right: 20rpx;
        }

        .user-info {
            margin-left: 10rpx;
            .date {
                font-size: 24rpx;
                color: $u-light-color;
            }
        }
    }

    .right {
        display: flex;
        font-size: 24rpx;
        align-items: center;
        color: #9a9a9a;

        .like {
            margin-left: 6rpx;
        }

        .num {
            font-size: 26rpx;
            color: #9a9a9a;
        }
    }

    .highlight {
        color: #f04a82;

        .num {
            color: #f04a82;
        }
    }
}

.all-reply {
    margin-top: 20rpx;
    padding-top: 20rpx;
    background-color: #ffffff;

    .all-reply-top {
        margin-left: 20rpx;
        padding-left: 20rpx;
        border-left: solid 4rpx #f04a82;
        font-size: 30rpx;
        font-weight: bold;
    }

    .item {
        border-bottom: solid 2rpx $u-border-color;
    }

    .reply {
        padding: 20rpx;
        background-color: rgb(242, 242, 242);
        border-radius: 12rpx;
        margin: 10rpx 0;

        .username {
            font-size: 24rpx;
            color: #7a7a7a;
        }
    }
}
</style>
