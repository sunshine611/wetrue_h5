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
        <TopicContent :postInfo="postInfo"></TopicContent>
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
                            <HeadImg
                                :userInfo="item.users"
                                :isLink="true"
                                width="70rpx"
                                height="70rpx"
                            ></HeadImg>
                        </div>
                    </view>
                    <view class="right">
                        <view class="top">
                            <Name :userInfo="item.users"></Name>
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
                            <mp-html :content="item.payload" :selectable="true"
                        /></view>
                        <view
                            class="reply-box"
                            v-show="item.commentList.length > 0"
                        >
                            <view
                                class="item"
                                v-for="(item, index) in item.commentList"
                                :key="index"
                            >
                                <view class="text" @click="reply(item)"
                                    ><text
                                        :class="[
                                            'name',
                                            item.users.isAuth ? 'auth' : '',
                                        ]"
                                        @click.stop="
                                            goUrl(
                                                '/pages/my/userInfo?userAddress=' +
                                                    item.users.userAddress
                                            )
                                        "
                                        ><fa-FontAwesome
                                            v-if="item.users.isAuth"
                                            class="mr-4"
                                            type="fas fa-user-secret"
                                            size="24"
                                            color="#2979FF"
                                        >
                                        </fa-FontAwesome
                                        >{{
                                            item.users.nickname ||
                                            item.users.userAddress.slice(-4)
                                        }}</text
                                    ><text v-if="item.replyHash">{{
                                        i18n.index.reply
                                    }}</text
                                    ><text
                                        :class="[
                                            'name',
                                            item.receiverIsAuth ? 'auth' : '',
                                        ]"
                                        @click.stop="
                                            goUrl(
                                                '/pages/my/userInfo?userAddress=' +
                                                    item.toAddress
                                            )
                                        "
                                        v-if="item.replyHash"
                                        >{{
                                            "@" +
                                            (item.receiverName ||
                                                item.toAddress.slice(-4))
                                        }}</text
                                    >：<mp-html
                                        class="compiler"
                                        :content="item.payload"
                                        :selectable="true"
                                /></view>
                            </view>
                            <view
                                v-if="item.replyNumber > 3"
                                class="all-reply"
                                @tap="goUrl('reply?hash=' + item.hash)"
                            >
                                {{
                                    i18n.index.more +
                                    " " +
                                    item.replyNumber +
                                    " " +
                                    i18n.index.theReply
                                }}
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
        <div class="bar-opera safe-area-inset-bottom" v-show="!isShowComment">
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
                @tap="praise(praiseType)"
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
            class="safe-area-inset-bottom"
            ref="inputComment"
            :isShow="isShowComment"
            :placeholder="placeholder"
            @clickOther="isShowComment = false"
            @submitComment="submitComment"
        ></inputComment>
        <Reward v-model="rewardShow" :postInfo="postInfo"></Reward>
    </view>
</template>

<script>
import inputComment from "@/components/input-comment/input-comment.vue";
import TopicContent from "@/components/TopicContent";
import HeadImg from "@/components/HeadImg";
import mpHtml from "mp-html/dist/uni-app/components/mp-html/mp-html";
import Reward from "@/components/Reward";
import Name from "@/components/Name";
import { getThirdPartySource } from "@/util/thirdPartySource/source";
import { boxPost } from "@/util/thirdPartySource/boxPost";

export default {
    components: {
        inputComment,
        TopicContent,
        HeadImg,
        mpHtml,
        Reward,
        Name,
    },
    data() {
        return {
            hash: "", //哈希值
            postInfo: {
                rewardList: [],
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
            rewardShow: false, //控制打赏弹层
        };
    },
    //上拉刷新
    onPullDownRefresh() {
        this.getPostInfo();
        this.pageInfo.page = 1;
        this.getCommentList();
        setTimeout(function () {
            uni.stopPullDownRefresh();
        }, 500);
    },
    //下拉加载
    onReachBottom() {
        this.pageInfo.page++;
        this.getCommentList();
    },
    onLoad(option) {
        this.hash = option.hash ?? option.shTipid;
        this.getPostInfo();
        this.getCommentList();
        uni.setNavigationBarTitle({
            title: this.i18n.titleBar.contentDetails,
        });
    },
    watch: {
        commentList: {
            handler() {
                this.$nextTick(() => {
                    const topicArr = document.getElementsByClassName("topic-text");
                    if (topicArr.length > 0) {
                        for (let i = 0; i < topicArr.length; i++) {
                            topicArr[i].addEventListener(
                                "click",
                                (e) => {
                                    let text = topicArr[i].innerText;
                                    this.goUrl(
                                        "/pages/index/topic?keyword=" + text
                                    );
                                    e.stopPropagation();
                                },
                                true
                            );
                        }
                    }
                });
            },
            deep: true,
        },
    },
    computed: {
        //国际化
        i18n: {
            get() {
                return this.$_i18n.messages[this.$_i18n.locale];
            },
        },
    },
    methods: {
        //获取主贴详情
        getPostInfo() {
            let url = "";
            let params = {};
            if (this.hash.slice(0, 2) === "th") {
                url = "/Content/tx";
                params = {
                    hash: this.hash,
                };
                this.praiseType = "topic";
            } else {
                url = "/Content/shTipid";
                params = {
                    shTipid: this.hash,
                };
                this.praiseType = "shTipid";
            }
            this.$http.post(url, params).then((res) => {
                if (res.code === 200) {
                    this.postInfo = res.data;
                    this.postInfo.payload = this.topicHighlight(
                        this.postInfo.payload
                    );
                    if (this.praiseType === "shTipid") {
                        this.postInfo.hash = res.data.shTipid;
                    }
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
            this.$http
                .post("/Comment/list", params, { custom: { isToast: true } })
                .then((res) => {
                    if (res.code === 200) {
                        this.pageInfo.totalPage = parseInt(res.data.totalPage);
                        this.more = "loadmore";
                        if (this.pageInfo.page === 1) {
                            this.commentList = res.data.data.map((item) => {
                                item.payload = this.topicHighlight(
                                    item.payload
                                );
                                return item;
                            });
                        } else {
                            if (this.pageInfo.page > this.pageInfo.totalPage) {
                                this.pageInfo.page = this.pageInfo.totalPage;
                                this.more = "nomore";
                            } else {
                                this.commentList = this.commentList.concat(
                                    res.data.data.map((item) => {
                                        item.payload = this.topicHighlight(
                                            item.payload
                                        );
                                        return item;
                                    })
                                );
                            }
                        }
                    } else {
                        this.more = "nomore";
                    }
                });
        },
        //评论
        comment(item) {
            if (!this.validLogin()) {
                //第三方来源box发布主贴
                if (getThirdPartySource() === "box") {
                    let boxPostPayload;
                    if (item) {
                        boxPostPayload = {
                            boxPostType: "reply",
                            replyType: "comment",
                            toHash: item.hash
                        };
                    } else {
                        boxPostPayload = {
                            boxPostType: "comment",
                            toHash: this.hash,
                        };
                    }
                    boxPost(boxPostPayload);
                    return false;
                }

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
        //回复
        reply(item) {
            if (!this.validLogin()) {
                //第三方来源box发布主贴
                if (getThirdPartySource() === "box") {
                    let boxPostPayload = {
                        boxPostType: "reply",
                        replyType: "reply",
                        toHash: item.toHash,
                        toAddress: item.users.userAddress,
                        replyHash: item.hash,
                    };
                    boxPost(boxPostPayload);
                    return false;
                }

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
            let name = !!item.users.nickname
                ? item.users.nickname
                : item.users.userAddress.slice(-4);
            this.placeholder = this.i18n.index.reply + " @" + name;
            this.commentType = "replyPerson";
            this.currentComment = item;
        },
        //发表评论
        async submitComment(content) {
            let res;
            if (this.commentType === "comment") {
                let payload = {
                    hash: this.hash,
                    content: content,
                };
                res = await this.wetrueSend("comment", payload);
            } else if (this.commentType === "reply") {
                let payload = {
                    type: "comment",
                    toHash: this.currentComment.hash,
                    content: content,
                };
                res = await this.wetrueSend("reply", payload);
            } else if (this.commentType === "replyPerson") {
                let payload = {
                    type: "reply",
                    toHash: this.currentComment.toHash,
                    replyHash: this.currentComment.hash,
                    address: this.currentComment.users.userAddress,
                    content: content,
                };
                res = await this.wetrueSend("reply", payload);
            }
            if (JSON.stringify(res) !== "{}" && !!res) {
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
            } else {
                uni.hideLoading();
                this.$refs.inputComment.btnLoading = false;
            }
        },
        //打赏
        reward() {
            if (!this.validLogin()) {
                //第三方来源box发布主贴
                if (getThirdPartySource() === "box") {
                    let boxPostPayload = { boxPostType: "reward" };
                    boxPost(boxPostPayload);
                    return false;
                }

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
            this.rewardShow = true;
        },
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
            } else if (type === "shTipid") {
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
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.detail {
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
                        display: inline-block;
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
                        font-size: 32rpx;
                        margin-bottom: 16rpx;
                        word-wrap: break-word;
                        word-break: break-all;
                        overflow: hidden;
                        /deep/ .topic-text {
                            color: #f04a82;
                        }
                    }

                    .reply-box {
                        background-color: rgb(242, 242, 242);
                        font-size: 24rpx;

                        .item {
                            padding: 15rpx 20rpx;
                            border-bottom: solid 2rpx $u-border-color;
                            &:last-child {
                                border: none;
                            }
                            .text {
                                width: 100%;
                                &:active {
                                    background: #f1f1f1;
                                }
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
                            color: #f04a82;
                            text-align: center;
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
