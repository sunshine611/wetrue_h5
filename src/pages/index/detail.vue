<template>
    <view class="detail">
        <u-navbar :title="i18n.index.contentDetails">
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
        <div class="forum">
            <div class="forum-item">
                <div class="user-area">
                    <div class="head-box">
                        <image
                            class="user-head"
                            mode="aspectFill"
                            :src="postInfo.users.portrait"
                            v-if="postInfo.users.portrait"
                        ></image>
                        <image
                            class="user-head"
                            mode="aspectFill"
                            src="../../static/default_head.png"
                            v-else
                        ></image>
                        <div class="level">
                            <text class="text"
                                >V{{ postInfo.users.userActive }}</text
                            >
                        </div>
                    </div>
                    <div class="user-info">
                        <div class="user">
                            <div class="name">
                                {{
                                    postInfo.users.nickname || i18n.my.cryptonym
                                }}
                                <text class="userid"
                                    >ID:{{
                                        postInfo.users.userAddress.slice(-4)
                                    }}</text
                                >
                                <text v-show="postInfo.isFocus">{{
                                    i18n.my.focus
                                }}</text>
                            </div>
                            <div class="more">
                                <text class="mr-24"
                                    >{{ postInfo.read
                                    }}<fa-FontAwesome
                                        type="fas fa-eye"
                                        size="28"
                                        class="ml-6"
                                        color="#666"
                                    >
                                    </fa-FontAwesome
                                ></text>
                                <fa-FontAwesome
                                    type="fas fa-star"
                                    size="28"
                                    class="mr-10"
                                    color="#ffc107"
                                    v-show="postInfo.isStar"
                                    @tap="star(postInfo)"
                                >
                                </fa-FontAwesome>
                                <fa-FontAwesome
                                    type="far fa-star"
                                    size="28"
                                    class="mr-10"
                                    color="#666"
                                    v-show="!postInfo.isStar"
                                    @tap="star(postInfo)"
                                ></fa-FontAwesome>
                            </div>
                        </div>
                        <div class="time">
                            <text>{{
                                $moment(postInfo.utcTime).fromNow()
                            }}</text
                            >{{ i18n.index.source + postInfo.source }}
                        </div>
                    </div>
                </div>
                <div class="main-content">
                    <div class="text-content">
                        <rich-text
                            :nodes="topicHighlight(postInfo.payload)"
                        ></rich-text>
                    </div>
                    <div class="img-list">
                        <u-image
                            width="150rpx"
                            height="150rpx"
                            :src="postInfo.imgTx"
                            v-if="postInfo.imgTx"
                        ></u-image>
                    </div>
                </div>
            </div>
        </div>
        <div class="comment">
            <div class="clearfix header">
                <div class="title">
                    <text class="mr-4">{{ i18n.index.comment }}</text
                    >{{ postInfo.commentNumber }}
                </div>
                <div class="praise">
                    <text class="mr-4">{{ i18n.index.praise }}</text
                    >{{ postInfo.praise }}
                </div>
            </div>
            <div class="comment-list">
                <view
                    class="comment-item"
                    v-for="item in commentList"
                    :key="item.hash"
                >
                    <view class="left">
                        <div class="head-box">
                            <image
                                class="user-head"
                                mode="aspectFill"
                                :src="item.users.portrait"
                                v-if="item.users.portrait"
                            ></image>
                            <image
                                class="user-head"
                                mode="aspectFill"
                                src="../../static/default_head.png"
                                v-else
                            >
                            </image>
                            <div class="level">
                                <text class="text"
                                    >V{{ item.users.userActive }}</text
                                >
                            </div>
                        </div>
                    </view>
                    <view class="right">
                        <view class="top">
                            <view class="name"
                                >{{ item.users.nickname || i18n.my.cryptonym
                                }}<text class="address"
                                    >ID:{{
                                        item.users.userAddress.slice(-4)
                                    }}</text
                                ></view
                            >
                            <view
                                class="like"
                                :class="{ highlight: item.isPraise }"
                            >
                                <view class="num">{{ item.praise }}</view>
                                <u-icon
                                    v-if="!item.isPraise"
                                    name="thumb-up"
                                    :size="30"
                                    color="#9a9a9a"
                                    @click="praise('comment', item)"
                                ></u-icon>
                                <u-icon
                                    v-if="item.isPraise"
                                    name="thumb-up-fill"
                                    :size="30"
                                    @click="praise('comment', item)"
                                ></u-icon>
                            </view>
                        </view>
                        <view class="content">
                            <rich-text :nodes="item.payload"></rich-text
                        ></view>
                        <view
                            class="reply-box"
                            v-show="item.commentList.length > 0"
                        >
                            <view
                                class="item"
                                v-for="(item, index) in item.commentList"
                                :key="index"
                            >
                                <view class="text"
                                    ><text class="name">{{
                                        item.users.nickname ||
                                            item.users.userAddress.slice(-4)
                                    }}</text
                                    >：<rich-text
                                        :nodes="item.payload"
                                    ></rich-text
                                ></view>
                            </view>
                            <view
                                class="all-reply"
                                @tap="goUrl('reply?hash=' + item.hash)"
                                v-if="!!item.commentList"
                            >
                                {{ item.replyNumber + i18n.index.theReply }}
                                <u-icon
                                    class="more"
                                    name="arrow-right"
                                    :size="26"
                                ></u-icon>
                            </view>
                        </view>
                        <view class="bottom">
                            {{
                                $moment(item.utcTime).format(
                                    "yyyy-MM-DD HH:mm:ss"
                                )
                            }}
                            <view class="reply" @tap="comment(item)">{{
                                i18n.index.reply
                            }}</view>
                        </view>
                    </view>
                </view>
            </div>
            <div class="pt-100 pb-100" v-show="commentList.length === 0">
                <u-empty :text="i18n.index.noData" mode="list"></u-empty>
            </div>
        </div>
        <u-loadmore
            bg-color="rgba(0,0,0,0)"
            margin-bottom="20"
            :status="more"
            v-show="commentList.length > 0"
        />
        <u-gap height="80"></u-gap>
        <div class="bar-opera" v-show="!isShowComment">
            <div class="item" @tap="reward">
                <fa-FontAwesome
                    type="fas fa-coins"
                    size="28"
                    class="mr-10"
                    color="#666"
                ></fa-FontAwesome>
                {{ i18n.index.reward }}
            </div>
            <div class="item" @tap="comment()">
                <fa-FontAwesome
                    type="far fa-comment-alt"
                    size="28"
                    class="mr-10"
                    color="#666"
                >
                </fa-FontAwesome
                >{{ i18n.index.comment }}
            </div>
            <div
                class="item"
                :class="{ highlight: postInfo.isPraise }"
                @tap="praise('topic')"
            >
                <u-icon
                    v-show="!postInfo.isPraise"
                    class="mr-10"
                    name="thumb-up"
                    :size="30"
                    color="#666"
                ></u-icon>
                <u-icon
                    v-show="postInfo.isPraise"
                    class="mr-10"
                    name="thumb-up-fill"
                    color="#f04a82"
                    :size="30"
                >
                </u-icon
                >{{ i18n.index.praise }}
            </div>
        </div>
        <inputComment
            ref="inputComment"
            :isShow="isShowComment"
            :placeholder="placeholder"
            @clickOther="isShowComment = false"
            @submitComment="submitComment"
        ></inputComment>
    </view>
</template>

<script>
import inputComment from "@/components/input-comment/input-comment.vue";
export default {
    components: {
        inputComment,
    },
    data() {
        return {
            hash: "", //哈希值
            postInfo: {
                users: {
                    portrait: "",
                    userAddress: "",
                },
            }, //主贴信息
            commentList: [], //帖子列表
            pageInfo: {
                page: 1,
                pageSize: 10,
                totalPage: 1,
            }, //页码信息
            more: "loadmore", //加载更多
            isShowComment: false, //控制评论组件显示隐藏
            placeholder: "写评论...", //评论文本框显示文字
            commentType: "", //回复类型
            currentComment: {}, //当前回复信息
        };
    },
    //上拉刷新
    onPullDownRefresh() {
        this.getPostInfo();
        this.pageInfo.page = 1;
        this.getCommentList();
        setTimeout(function() {
            uni.stopPullDownRefresh();
        }, 500);
    },
    //下拉加载
    onReachBottom() {
        this.pageInfo.page++;
        this.getCommentList();
    },
    onLoad(option) {
        this.hash = option.hash;
        this.getPostInfo();
        this.getCommentList();
    },
    computed: {
        //国际化
        i18n() {
            return this.$_i18n.messages[this.$_i18n.locale];
        },
    },
    methods: {
        //获取主贴详情
        getPostInfo() {
            let params = {
                hash: this.hash,
            };
            this.$http.post("/Content/tx", params).then((res) => {
                if (res.code === 200) {
                    this.postInfo = res.data;
                }
            });
        },
        //获取一级评论列表
        getCommentList() {
            let params = {
                hash: this.hash,
                page: this.pageInfo.page,
                size: this.pageInfo.pageSize,
                replyLimit: 3,
            };
            this.$http.post("/Comment/list", params).then((res) => {
                if (res.code === 200) {
                    this.pageInfo.totalPage = parseInt(res.data.totalPage);
                    this.more = "loadmore";
                    if (this.pageInfo.page === 1) {
                        this.commentList = res.data.data;
                    } else {
                        if (this.pageInfo.page > this.pageInfo.totalPage) {
                            this.pageInfo.page = this.pageInfo.totalPage;
                            this.more = "nomore";
                        } else {
                            this.commentList = this.commentList.concat(
                                res.data.data
                            );
                        }
                    }
                    if (status == "pullDown") {
                        uni.stopPullDownRefresh();
                        this.commentList = res.data.data;
                    }
                } else {
                    this.more = "nomore";
                }
            });
        },
        //评论
        comment(item) {
            if (!this.validLogin()) {
                uni.showToast({
                    title: this.i18n.index.pleaseLogin,
                    icon: "none",
                });
                setTimeout(() => {
                    uni.reLaunch({
                        url: "/pages/my/index",
                    });
                }, 1000);
                return false;
            }
            this.isShowComment = true;
            if (item) {
                let name = !!item.users.nickname
                    ? item.users.nickname
                    : item.users.userAddress.slice(-4);
                this.placeholder = this.i18n.index.reply + " @" + name;
                this.commentType = "reply";
                this.currentComment = item;
            } else {
                this.placeholder = this.i18n.index.comment + "...";
                this.commentType = "comment";
            }
        },
        //发表评论
        async submitComment(content) {
            let res;
            uni.showLoading({
                title: this.i18n.index.inChain,
            });
            if (this.commentType === "comment") {
                let payload = {
                    hash: this.hash,
                    content: content,
                };
                res = await this.sendComment(payload);
            } else if (this.commentType === "reply") {
                let payload = {
                    type: "comment",
                    hash: this.currentComment.hash,
                    toHash: this.currentComment.toHash,
                    content: content,
                };
                res = await this.sendReply(payload);
            }
            if (!!res.hash) {
                setTimeout(() => {
                    this.isShowComment = false;
                    this.getPostInfo();
                    this.commentList = [];
                    this.pageInfo.page = 1;
                    this.getCommentList();
                    uni.hideLoading();
                    this.$refs.inputComment.content = "";
                    this.$refs.inputComment.btnLoading = false;
                }, 2000);
            }
        },
        //打赏
        reward() {},
        //是否点赞
        praise(type, item) {
            if (type === "topic") {
                let params = {
                    hash: this.hash,
                    type: type,
                };
                this.$http.post("/Submit/praise", params).then((res) => {
                    if (res.code === 200) {
                        this.postInfo.isPraise = res.data.isPraise;
                        this.postInfo.praise = res.data.praise;
                    }
                });
            } else if (type === "comment") {
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
        //话题高亮
        topicHighlight(value) {
            var exp;
            exp = /#[x80-xff\u4e00-\u9fa5\w ,，.。!！-]{1,25}#/u;
            value = value.replace(exp, (item) => {
                let newVal = `<span style="color:#f04a82">${item}</span>`;
                return newVal;
            });
            return value;
        },
        //是否收藏
        star() {
            let params = {
                hash: this.hash,
            };
            this.$http.post("/Submit/contentStar", params).then((res) => {
                if (res.code === 200) {
                    this.postInfo.isStar = res.data.isStar;
                    this.postInfo.star = res.data.star;
                }
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.detail {
    .forum {
        &-item {
            background-color: #fff;
            margin-bottom: 20rpx;
            border-bottom: 2rpx solid #e9e9e9;

            .user-area {
                padding: 20rpx;
                display: flex;

                .head-box {
                    margin-right: 20rpx;
                    position: relative;

                    .user-head {
                        width: 70rpx;
                        height: 70rpx;
                        border-radius: 50%;
                        box-sizing: border-box;
                    }

                    .level {
                        position: absolute;
                        right: -8rpx;
                        bottom: 2rpx;
                        width: 34rpx;
                        height: 34rpx;
                        background-color: #d62900;
                        font-size: 24rpx;
                        border-radius: 50%;
                        color: #fff;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        border: 4rpx solid #ffd982;
                        box-sizing: border-box;

                        .text {
                            transform: scale(0.65);
                        }
                    }
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    width: 100%;

                    .user {
                        width: 100%;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;

                        .name {
                            font-size: 28rpx;

                            text {
                                color: #f04a82;
                                font-size: 20rpx;
                                margin-left: 20rpx;
                            }
                        }
                        text.userid {
                            font-size: 24rpx;
                            color: #91908e;
                            width: 100%;
                        }
                    }

                    .time {
                        font-size: 24rpx;
                        color: #91908e;
                        width: 100%;

                        text {
                            color: #999;
                            margin-right: 20rpx;
                        }
                    }
                }
            }

            .main-content {
                margin: 0 30rpx 0rpx 30rpx;
                padding: 0 0 25rpx 0;
                font-size: 26rpx;

                .text-content {
                    margin-bottom: 20rpx;
                    word-wrap: break-word;
                    word-break: normal;
                    overflow: hidden;
                }
            }
        }
    }

    .comment {
        background-color: #ffffff;
        margin-bottom: 30rpx;

        .header {
            border-bottom: 1px solid #e6e6e6;
            padding: 20rpx 30rpx;

            .title {
                font-weight: 600;
                float: left;
            }

            .praise {
                float: right;
                color: #939393;
            }
        }

        .comment-list {
            .comment-item {
                display: flex;
                padding: 30rpx;
                border-bottom: 1px solid #eee;

                .left {
                    .head-box {
                        position: relative;
                        display: inline-block;

                        .user-head {
                            width: 70rpx;
                            height: 70rpx;
                            border-radius: 50%;
                            box-sizing: border-box;
                        }

                        .level {
                            position: absolute;
                            right: -8rpx;
                            bottom: 2rpx;
                            width: 34rpx;
                            height: 34rpx;
                            background-color: #d62900;
                            font-size: 24rpx;
                            border-radius: 50%;
                            color: #fff;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            border: 4rpx solid #ffd982;
                            box-sizing: border-box;

                            .text {
                                transform: scale(0.65);
                            }
                        }
                    }
                }

                .right {
                    flex: 1;
                    padding-left: 20rpx;
                    font-size: 28rpx;

                    .top {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 10rpx;

                        .name {
                            color: #333;
                            .address {
                                color: #999;
                                font-size: 24rpx;
                                margin-left: 10rpx;
                            }
                        }

                        .like {
                            display: flex;
                            align-items: center;
                            color: #9a9a9a;
                            font-size: 26rpx;

                            .num {
                                margin-right: 4rpx;
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

                    .content {
                        font-size: 26rpx;
                        margin-bottom: 16rpx;
                        word-wrap: break-word;
                        word-break: break-all;
                        overflow: hidden;
                    }

                    .reply-box {
                        background-color: rgb(242, 242, 242);
                        font-size: 24rpx;

                        .item {
                            padding: 15rpx 20rpx;
                            border-bottom: solid 2rpx $u-border-color;
                            .text {
                                width: 100%;
                                display: flex;
                                .name {
                                    color: #f04a82;
                                    justify-content: start;
                                    max-width: 30%;
                                }
                                .parse {
                                    display: inline-block;
                                    word-wrap: break-word;
                                    word-break: break-all;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    height: 32rpx;
                                    max-width: 70%;
                                }
                            }
                        }

                        .all-reply {
                            padding: 20rpx;
                            display: flex;
                            color: #f04a82;
                            align-items: center;

                            .more {
                                margin-left: 6rpx;
                            }
                        }
                    }

                    .bottom {
                        margin-top: 20rpx;
                        display: flex;
                        font-size: 24rpx;
                        color: #9a9a9a;

                        .reply {
                            color: #f04a82;
                            margin-left: 10rpx;
                        }
                    }
                }
            }
        }
    }

    .bar-opera {
        position: fixed;
        height: 80rpx;
        left: 50%;
        transform: translateX(-50%);
        bottom: 0;
        width: 100%;
        background-color: #f9f9f9;
        display: flex;
        justify-content: space-around;
        border-top: 1rpx solid #d9d9d9;
        z-index: 50;
        max-width: 720px;

        .item {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 33.33%;
            position: relative;

            &:after {
                content: "";
                width: 1rpx;
                height: 50rpx;
                position: absolute;
                right: 0;
                top: 50%;
                transform: translateY(-50%);
                background: linear-gradient(#f8f8f8, #d3d3d3, #f8f8f8);
            }

            &:nth-last-child(1) {
                &::after {
                    width: 0;
                }
            }

            &.highlight {
                color: #f04a82;
            }
        }
    }
}
</style>
