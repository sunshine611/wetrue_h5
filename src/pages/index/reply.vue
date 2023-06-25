<script setup>
import mpHtml from "mp-html/dist/uni-app/components/mp-html/mp-html";
import HeadImg from "@/components/HeadImg";
import Name from "@/components/Name";
import TopicMore from "@/components/TopicMore";

import { ref, getCurrentInstance } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
const { proxy } = getCurrentInstance();

const hash = ref(null) //回复hash
const replyList = ref([]) //回复评论列表
const more = ref('loadmore') //加载更多
const commentInfo = ref({ //评论信息
    users: {
        avatar: "",
        userAddress: "",
    },
})
const pageInfo = ref({ //页码信息
    page: 1,
    pageSize: 10,
    totalPage: 1,
    totalSize: 0,
})

onLoad ( (option) => {
    proxy.uSetBarTitle(proxy.$t('index.replyDetails'));
    hash.value = option.hash;
    getCommentInfo();
    getReply();
});
//下拉刷新
onPullDownRefresh ( () => {
    getCommentInfo();
    pageInfo.value.page = 1;
    getReply();
    setTimeout(function() {
        uni.stopPullDownRefresh();
    }, 500);
});
//上拉加载
onReachBottom ( () => {
    pageInfo.value.page++;
    getReply();
});

//获取评论详情
const getCommentInfo = () => {
    let params = {
        hash: hash.value,
    };
    proxy.$http.post("/Comment/tx", params).then((res) => {
        if (res.code === 200) {
            commentInfo.value = res.data;
        }
    });
}
// 回复列表
const getReply = () => {
    let params = {
        hash: hash.value,
        page: pageInfo.value.page,
        size: pageInfo.value.pageSize,
    };
    proxy.$http
        .post("/Reply/list", params, { custom: { isToast: true } })
        .then((res) => {
            if (res.code === 200) {
                pageInfo.value.totalPage = parseInt(res.data.totalPage);
                pageInfo.value.totalSize = parseInt(res.data.totalSize);
                more.value = "loadmore";
                if (pageInfo.value.page === 1) {
                    replyList.value = res.data.data;
                } else {
                    if (pageInfo.value.page > pageInfo.value.totalPage) {
                        pageInfo.value.page = pageInfo.value.totalPage;
                        more.value = "nomore";
                    } else {
                        replyList.value = replyList.value.concat(
                            res.data.data
                        );
                    }
                }
                if (status == "pullDown") {
                    uni.stopPullDownRefresh();
                    replyList.value = res.data.data;
                }
            } else {
                more.value = "nomore";
            }
        });
}
//是否点赞
const praise = (type, item) => {
    if (type === "comment") {
        let params = {
            hash: hash.value,
            type: type,
        };
        proxy.$http.post("/Submit/praise", params).then((res) => {
            if (res.code === 200) {
                commentInfo.value.isPraise = res.data.isPraise;
                commentInfo.value.praise = res.data.praise;
            }
        });
    } else if (type === "reply") {
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
    }
}
</script>

<template>
    <view class="wrap">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-navbar :is-fixed="false" :title="$t('index.replyDetails')" v-show="!validThirdPartySource()">
            <template v-slot:right>
                <u-icon
                    class="mr-30"
                    name="home"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('index')"
                ></u-icon>
            </template>
        </u-navbar>
        <view class="comment">
            <view class="top">
                <view class="left">
                    <view class="head-box">
                        <HeadImg
                            :userInfo="commentInfo.users"
                            :isLink="true"
                            width="70rpx"
                            height="70rpx"
                        ></HeadImg>
                    </view>
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
                    <TopicMore
                        :topicInfo="commentInfo"
                        class="ml-20"
                    ></TopicMore>
                </view>
            </view>
            <view class="content">
                <mp-html :content="commentInfo.payload" :selectable="true" />
            </view>
        </view>
        <view class="all-reply">
            <view class="all-reply-top"
                ><text class="mr-6">{{ $t('index.allReply') }}</text
                >{{ pageInfo.totalSize }}</view
            >
            <view class="item" v-for="(item, index) in replyList" :key="index">
                <view class="comment">
                    <view class="top">
                        <view class="left">
                            <view class="head-box">
                                <HeadImg
                                    :userInfo="item.users"
                                    :isLink="true"
                                    width="70rpx"
                                    height="70rpx"
                                ></HeadImg>
                            </view>
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
                            <TopicMore
                                :topicInfo="item"
                                class="ml-20"
                            ></TopicMore>
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
            ::v-deep * {
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
