<script setup>
import { reactive, getCurrentInstance } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { version } from "@/config/config.js";
import VersionTip from "@/components/VersionTip.vue";
import Name from "@/components/Name.vue";
import mpHtml from "mp-html/dist/uni-app/components/mp-html/mp-html";
import HeadImg from "@/components/HeadImg";
const { proxy } = getCurrentInstance();

const msgIndex = reactive({
    current: 0, //当前tab索引
    msgList: [], //帖子列表
    pageInfo: {
        page: 1,
        pageSize: 10,
        totalPage: 1,
    }, //页码信息
    more: "loadmore", //加载更多
    versionInfo: {}, //版本信息
    versionCode: parseInt(version.replace(/./g, )), //版本号
    versionShow: false, //版本提示弹层
})

onLoad ( () => {
    proxy.uSetBarTitle(proxy.$t('titleBar.message'));
    getMsgList();
    getVersion();
    proxy.getUnreadMsg();
})

//上拉加载
onReachBottom ( () => {
    msgIndex.pageInfo.page++;
    getMsgList();
})
//下拉刷新
onPullDownRefresh ( () => {
    msgIndex.pageInfo.page = 1;
    getMsgList();
    setTimeout(function() {
        uni.stopPullDownRefresh();
    }, 500);
})

//类别列表
const categoryList = [{
    name: proxy.$t('message.dynamic')
},]
//获取列表
const getMsgList = () => {
    let url = "";
    let params = {
        page: msgIndex.pageInfo.page,
        size: msgIndex.pageInfo.pageSize,
    };
    if (msgIndex.current === 0) {
        url = "/Message/list";
    }
    proxy.$http.post(url, params, { custom: { isToast: true } }).then((res) => {
        if (res.code === 200) {
            msgIndex.pageInfo.totalPage = parseInt(res.data.totalPage);
            msgIndex.more = "loadmore";
            if (msgIndex.pageInfo.page === 1) {
                msgIndex.msgList = res.data.data;
            } else {
                if (msgIndex.pageInfo.page > msgIndex.pageInfo.totalPage) {
                    msgIndex.pageInfo.page = msgIndex.pageInfo.totalPage;
                    msgIndex.more = "nomore";
                } else {
                    msgIndex.msgList = msgIndex.msgList.concat(res.data.data);
                }
            }
        } else {
            msgIndex.more = "nomore";
        }
    }).then(()=>{
        proxy.getUnreadMsg();
    })
}
//切换顶部tab事件
const tabChange = (index) => {
    msgIndex.current = index;
}
//获取服务端版本信息
const getVersion = () => {
    proxy.getVersionInfo().then((res) => {
        msgIndex.versionInfo = res;
        if (msgIndex.versionInfo.mustUpdate) {
            msgIndex.versionShow = true;
        }
    });
}
</script>

<template>
    <view class="index">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-tabs
            :list="categoryList"
            :is-scroll="false"
            :current="msgIndex.current"
            @change="tabChange"
            active-color="#f04a82"
            style="border-bottom:1px solid #e4e7ed"
        ></u-tabs>
        <view class="empty" v-show="msgIndex.msgList.length === 0">
            <u-empty :text="$t('index.noData')" mode="list"></u-empty>
        </view>
        <view class="dynamic">
            <view
                class="dynamic-box"
                v-for="(item, index) in msgIndex.msgList"
                :key="index"
            >
                <view class="comment" v-if="item.type === 'comment' || (item.type == 'mentions' && !item.comment.payload)">
                    <view class="user-area">
                        <view class="head-box">
                            <HeadImg
                                :userInfo="item.comment.users"
                                :isLink="true"
                                width="70rpx"
                                height="70rpx"
                            ></HeadImg>
                        </view>
                        <view class="user-info">
                            <view class="user">
                                <Name :userInfo="item.comment.users"></Name>
                            </view>
                            <view class="time">
                                <text>{{
                                    $moment(parseInt(item.utctime)).format(
                                        "yyyy-MM-DD HH:mm"
                                    )
                                }}</text>
                            </view>
                        </view>
                    </view>
                    <view class="comment-content">
                        <mp-html :content="item.comment.payload" />
                    </view>
                    <view
                        class="topic"
                        @click="
                            goUrl('/pages/index/detail?hash=' + item.topic.hash)
                        "
                    >
                        <Name :userInfo="item.topic.users"></Name>
                        <view class="content">
                            <mp-html :content="item.topic.payload" />
                        </view>
                    </view>
                </view>
                <view class="reply" v-if="item.type === 'reply'  || (item.type == 'mentions' && item.comment.payload)">
                    <view class="user-area">
                        <view class="head-box">
                            <HeadImg
                                :userInfo="item.reply.users"
                                :isLink="true"
                                width="70rpx"
                                height="70rpx"
                            ></HeadImg>
                        </view>
                        <view class="user-info">
                            <view class="user">
                                <Name :userInfo="item.reply.users"></Name>
                            </view>
                            <view class="time">
                                <text>{{
                                    $moment(item.utctime).format(
                                        "yyyy-MM-DD HH:mm"
                                    )
                                }}</text>
                            </view>
                        </view>
                    </view>
                    <view class="reply-content">
                        回复<text
                :class="['name', item.reply.receiverIsAuth ? 'auth' : '']"
                @click.stop="
                    goUrl(
                        '/pages/my/userInfo?userAddress=' +
                            item.reply.toAddress
                    )
                "
                >{{
                    "@" +
                        (item.reply.receiverName ||
                            item.reply.toAddress.slice(-4))
                }}</text>：<mp-html
                            :content="item.reply.payload"
                            class="compiler"
                        />
                    </view>
                    <view class="comment">
                        <view class="comment-content">
                            <Name :userInfo="item.comment.users"></Name>：
                            <mp-html
                                :content="item.comment.payload"
                                class="compiler"
                            />
                        </view>
                        <view
                            class="topic"
                            @click="
                                goUrl(
                                    '/pages/index/detail?hash=' +
                                        item.topic.hash
                                )
                            "
                        >
                            <Name :userInfo="item.topic.users"></Name>
                            <view class="content">
                                <mp-html :content="item.topic.payload" />
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </view>
        <u-gap :height="10"></u-gap>
        <u-loadmore
            bg-color="rgba(0,0,0,0)"
            :status="msgIndex.more"
            v-show="msgIndex.msgList.length > 0"
        />
        <u-gap :height="20"></u-gap>
        <VersionTip
            v-model="msgIndex.versionShow"
            :versionInfo="msgIndex.versionInfo"
        ></VersionTip>
    </view>
</template>

<style lang="scss" scoped>
.index {
    .dynamic {
        .dynamic-box {
            background: #fff;
            margin-bottom: 20rpx;
            .comment {
                padding: 20rpx;
                .user-area {
                    display: flex;
                    margin-bottom: 10rpx;
                    .head-box {
                        display: inline-block;
                        margin-right: 20rpx;
                    }

                    .user-info {
                        display: inline-flex;
                        align-items: center;
                        flex-wrap: wrap;
                        width: 100%;

                        .user {
                            width: 100%;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
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
                .comment-content {
                    margin-bottom: 20rpx;
                }
                .topic {
                    background: #f7f7f7;
                    padding: 20rpx;

                    .content {
                        margin-top: 10rpx;
                        font-size: 24rpx;
                        ::v-deep ._root {
                            word-break: break-all;
                            text-overflow: ellipsis;
                            display: -webkit-box;
                            -webkit-box-orient: vertical;
                            -webkit-line-clamp: 2;
                            overflow: hidden;
                        }
                    }
                }
            }
            .reply {
                .user-area {
                    display: flex;
                    padding: 20rpx;
                    .head-box {
                        display: inline-block;
                        margin-right: 20rpx;
                    }

                    .user-info {
                        display: inline-flex;
                        align-items: center;
                        flex-wrap: wrap;
                        width: 100%;

                        .user {
                            width: 100%;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
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
                .reply-content {
                    padding: 0 20rpx;
                    margin-bottom: 20rpx;
                }
                .comment {
                    background: #f7f7f7;
                    padding: 20rpx;
                    .topic {
                        background: #fff;
                        padding: 20rpx;

                        .content {
                            margin-top: 10rpx;
                            font-size: 24rpx;
                            ::v-deep ._root {
                                word-break: break-all;
                                text-overflow: ellipsis;
                                display: -webkit-box;
                                -webkit-box-orient: vertical;
                                -webkit-line-clamp: 2;
                                overflow: hidden;
                            }
                        }
                    }
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
    }
}
</style>
