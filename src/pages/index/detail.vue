<script setup>
import inputComment from "@/components/input-comment/input-comment.vue";
import TopicContent from "@/components/TopicContent";
import TopicMore from "@/components/TopicMore";
import HeadImg from "@/components/HeadImg";
import mpHtml from "mp-html/dist/uni-app/components/mp-html/mp-html";
import Reward from "@/components/Reward";
import Name from "@/components/Name";
import { Icon } from '@iconify/vue';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { ref, getCurrentInstance, watch } from 'vue'
const { proxy } = getCurrentInstance();

const hash = ref(null) //哈希值
const praiseType = ref(null) //哈希值
const commentList = ref([]) //帖子列表
const more = ref('loadmore') //加载更多
const stopLoading = ref(false) //refs
const isShowComment = ref(false) //控制评论组件显示隐藏
const placeholder = ref('写评论...') //评论文本框显示文字
const commentType = ref('') //回复类型
const currentComment = ref({}) //当前回复信息
const rewardShow = ref(false) //控制打赏弹层
const commentHeight = ref(0) //评论空白高度

const postInfo = ref({ //主贴信息
    rewardList: [],
    users: {
        avatar: "",
        userAddress: "",
    },
})
const pageInfo = ref({ //页码信息
    page: 1,
    pageSize: 10,
    totalPage: 1,
})

onLoad ( (option) => {
    proxy.uSetBarTitle(proxy.$t('titleBar.contentDetails'));
    hash.value = option.hash ?? option.shTipid;
    getPostInfo();
    getCommentList();
});
//下拉刷新
onPullDownRefresh ( () => {
    getPostInfo();
    pageInfo.value.page = 1;
    getCommentList();
    setTimeout(function () {
        uni.stopPullDownRefresh();
    }, 500);
});
//上拉加载
onReachBottom ( () => {
    pageInfo.value.page++;
        getCommentList();
});


//暴露方法名"receiveWeTrueMessage"
window["receiveWeTrueMessage"] = async (res) => {
    if (res.code == 200) {
        proxy.postHashToWeTrue(res);
    } else {
        res = null;
    }
    releaseCallback(res);
};

watch(
    () => commentList.value,
    (val) => {
        proxy.$nextTick(() => {
            const topicArr = document.getElementsByClassName("topic-text");
            if (topicArr.length > 0) {
                for (let i = 0; i < topicArr.length; i++) {
                    topicArr[i].addEventListener(
                        "click",
                        (e) => {
                            let text = topicArr[i].innerText;
                            proxy.goUrl(
                                "/pages/index/topic?keyword=" + text
                            );
                            e.stopPropagation();
                        },
                        true
                    );
                }
            }
            const mentionsArr = document.getElementsByClassName("mentions-text");
            if (mentionsArr.length > 0) {
                for (let i = 0; i < mentionsArr.length; i++) {
                    mentionsArr[i].addEventListener(
                        "click",
                        (e) => {
                            let text = mentionsArr[i].innerText;
                            Backend.nodeApiGetAddressByNames(text.split("@").join("")).then((res) => {
                                proxy.goUrl(
                                    "/pages/my/userInfo?userAddress=" + res
                                );
                            });
                            e.stopPropagation();
                        },
                        true
                    );
                }
            }
            commentHeight.value = (commentList.value.length * 150)>650 ? 650 : (commentList.value.length * 150);
        });
    }
);


//获取主贴详情
const getPostInfo = () => {
    let url = "";
    let params = {};
    if (hash.value.slice(0, 2) === "th") {
        url = "/Content/tx";
        params = {
            hash:hash.value,
        };
        praiseType.value = "topic";
    } else {
        url = "/Content/shTipid";
        params = {
            shTipid:hash.value,
        };
        praiseType.value = "shTipid";
    }
    proxy.$http.post(url, params).then((res) => {
        if (res.code === 200) {
            postInfo.value = res.data;
            postInfo.value.payload = proxy.topicHighlight(
                postInfo.value.payload
            );
            if (praiseType.value === "shTipid") {
                postInfo.value.hash = res.data.shTipid;
            }
        }
    });
}
//获取一级评论列表
const getCommentList = () => {
    let params = {
        hash:hash.value,
        page: pageInfo.value.page,
        size: pageInfo.value.pageSize,
        replyLimit: 3,
    };
    proxy.$http.post("/Comment/list", params, { custom: { isToast: true } }).then((res) => {
        if (res.code === 200) {
            pageInfo.value.totalPage = parseInt(res.data.totalPage);
            more.value = "loadmore";
            if (pageInfo.value.page === 1) {
                commentList.value = res.data.data.map((item) => {
                    item.payload = proxy.topicHighlight(
                        item.payload
                    );
                    return item;
                });
            } else {
                if (pageInfo.value.page > pageInfo.value.totalPage) {
                    pageInfo.value.page = pageInfo.value.totalPage;
                    more.value = "nomore";
                } else {
                    commentList.value = commentList.value.concat(
                        res.data.data.map((item) => {
                            item.payload = proxy.topicHighlight(
                                item.payload
                            );
                            return item;
                        })
                    );
                }
            }
        } else {
            more.value = "nomore";
        }
    });
}
//评论
const comment = (item) => {
    if (!proxy.validToken()) {
        uni.showToast({
            title: proxy.$t('index.pleaseLogin'),
            icon: "none",
        });
        setTimeout(() => {
            uni.reLaunch({
                url: "/pages/my/index",
            });
        }, 1000);
        return false;
    }
    isShowComment.value = true;
    if (item) {
        let name = !!item.users.nickname
            ? item.users.nickname
            : item.users.userAddress.slice(-4);
        placeholder.value = proxy.$t('index.reply') + " @" + name;
        commentType.value = "reply";
        currentComment.value = item;
    } else {
        placeholder.value = proxy.$t('index.comment') + "...";
        commentType.value = "comment";
    }
}
//回复
const reply = (item) => {
    if (!proxy.validToken()) {
        uni.showToast({
            title: proxy.$t('index.pleaseLogin'),
            icon: "none",
        });
        setTimeout(() => {
            uni.reLaunch({
                url: "/pages/my/index",
            });
        }, 1000);
        return false;
    }
    isShowComment.value = true;
    let name = !!item.users.nickname
        ? item.users.nickname
        : item.users.userAddress.slice(-4);
    placeholder.value = proxy.$t('index.reply') + " @" + name;
    commentType.value = "replyPerson";
    currentComment.value = item;
}
//发表评论
const submitComment = async (content) => {
    stopLoading.value = false;
    let res;
    if (commentType.value === "comment") {
        let payload = {
            hash:hash.value,
            content: content,
        };
        res = await proxy.wetrueSend("comment", payload);
    } else if (commentType.value === "reply") {
        let payload = {
            type: "comment",
            toHash: currentComment.value.hash,
            content: content,
        };
        res = await proxy.wetrueSend("reply", payload);
    } else if (commentType.value === "replyPerson") {
        let payload = {
            type: "reply",
            toHash: currentComment.value.toHash,
            replyHash: currentComment.value.hash,
            address: currentComment.value.users.userAddress,
            content: content,
        };
        res = await proxy.wetrueSend("reply", payload);
    }
    releaseCallback(res);
}
//发表评论回调
const releaseCallback = (res) => {
    if (res !== {} && !!res) {
        setTimeout(() => {
            isShowComment.value = false;
            getPostInfo();
            commentList.value = [];
            pageInfo.value.page = 1;
            getCommentList();
            stopLoading.value = true;
        }, 2000);
    } else {
        stopLoading.value = true;
    }
}
//打赏
const reward = () => {
    if (!proxy.validLogin()) {
        if (proxy.validThirdPartySource()) {
            proxy.uShowToast(
                proxy.$t('index.thirdPartyNotOpen'),
            );
            return false;
        };
        proxy.uShowToast(
            proxy.$t('index.pleaseLogin'),
        );
        setTimeout(() => {
            uni.reLaunch({
                url: "/pages/my/index",
            });
        }, 1000);
        return false;
    }
    rewardShow.value = true;
}
//是否点赞
const praise = (type, item) => {
    if (type === "topic") {
        let params = {
            hash:hash.value,
            type: type,
        };
        proxy.$http.post("/Submit/praise", params).then((res) => {
            if (res.code === 200) {
                postInfo.value.isPraise = res.data.isPraise;
                postInfo.value.praise = res.data.praise;
            }
        });
    } else if (type === "comment") {
        let params = {
            hash: item.hash,
            type: type,
        };
        proxy.$http.post("/Submit/praise", params).then((res) => {
            if (res.code === 200) {
                item.isPraise = res.data.isPraise;
                item.praise = res.data.praise;
            }
        });
    } else if (type === "shTipid") {
        let params = {
            hash:hash.value,
            type: type,
        };
        proxy.$http.post("/Submit/praise", params).then((res) => {
            if (res.code === 200) {
                postInfo.value.isPraise = res.data.isPraise;
                postInfo.value.praise = res.data.praise;
            }
        });
    }
}
</script>

<template>
    <view class="detail">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-navbar :is-fixed="false" :title="$t('index.contentDetails')" v-show="!validThirdPartySource()">
            <template v-slot:right>
                <u-icon
                    name="home"
                    class="mr-30"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('index')"
                ></u-icon>
            </template>
        </u-navbar>
        <TopicContent :postInfo="postInfo"></TopicContent>
        <view class="comment">
            <view class="clearfix header">
                <view class="title">
                    <text class="mr-4">{{ $t('index.comment') }}</text
                    >{{ postInfo.commentNumber }}
                </view>
                <view class="praise">
                    <text class="mr-4">{{ $t('index.praise') }}</text
                    >{{ postInfo.praise }}
                </view>
            </view>
            <view class="comment-list">
                <view
                    class="comment-item"
                    v-for="item in commentList"
                    :key="item.hash"
                >
                    <view class="left">
                        <view class="head-box">
                            <HeadImg
                                :userInfo="item.users"
                                :isLink="true"
                                width="70rpx"
                                height="70rpx"
                            ></HeadImg>
                        </view>
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
                                <TopicMore
                                    :topicInfo="item"
                                    class="ml-20"
                                ></TopicMore>
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
                                            )">
                                        
                                        <Icon
                                            v-if="item.users.isAuth"
                                            icon="arcticons:2fas-auth"
                                            width="10"
                                            color="#2979FF"
                                            class="mr-4"
                                        />
                                        {{
                                            item.users.nickname ||
                                            item.users.userAddress.slice(-4)
                                        }}</text>
                                        <text v-if="item.replyHash">
                                            {{ $t('index.reply') }}
                                        </text>
                                        <text
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
                                    >: <mp-html
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
                                    $t('index.more') +
                                    " " +
                                    item.replyNumber +
                                    " " +
                                    $t('index.theReply')
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
                                $t('index.reply')
                            }}</view>
                        </view>
                    </view>
                </view>
            </view>
            <view class="pt-100 pb-100" v-show="commentList.length === 0">
                <u-empty :text="$t('index.noData')" mode="list"></u-empty>
            </view>
        </view>
        <u-loadmore
            bg-color="rgba(0,0,0,0)"
            margin-bottom="20"
            :status="more"
            v-show="commentList.length > 0"
        />
        <u-gap :height="720-commentHeight"></u-gap>
        <view class="bar-opera safe-area-inset-bottom" v-show="!isShowComment">
            <view class="item" @tap="reward">
                <Icon
                    icon="streamline:interface-favorite-give-heart-reward-social-rating-media-heart-hand"
                    width="15"
                    class="mr-10"
                    color="#666"
                />
                {{ $t('index.reward') }}
            </view>
            <view class="item" @tap="comment()">
                <Icon
                    icon="fa-regular:comment-alt"
                    width="15"
                    class="mr-10"
                    color="#666"
                />
                {{ $t('index.comment') }}
            </view>
            <view
                class="item"
                :class="{ highlight: postInfo.isPraise }"
                @tap="praise(praiseType)"
            >
                <Icon
                    :icon="postInfo.isPraise ? 'ri:thumb-up-fill' : 'ri:thumb-up-line'"
                    :color="postInfo.isPraise ? '#f04a82' : '#666'"
                    class="mr-10"
                    size="15"
                />
                {{ $t('index.praise') }}
            </view>
        </view>
        <inputComment
            class="safe-area-inset-bottom"
            :isShow="isShowComment"
            :stopLoading="stopLoading"
            :placeholder="placeholder"
            @clickOther="isShowComment = false"
            @submitComment="submitComment"
        ></inputComment>
        <Reward v-model="rewardShow" :postInfo="postInfo"></Reward>
    </view>
</template>

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
                        ::v-deep .topic-text {
                            color: #f04a82;
                        }
                        ::v-deep .mentions-text {
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
                                    ::v-deep * {
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
