<template>
    <view class="index">
        <view :style="`padding-top:${statusBarHeight}px`"></view>
        <u-tabs
            :list="categoryList"
            :is-scroll="false"
            :current="current"
            @change="tabChange"
            active-color="#f04a82"
            style="border-bottom:1px solid #e4e7ed"
        ></u-tabs>
        <div class="empty" v-show="msgList.length === 0">
            <u-empty :text="i18n.index.noData" mode="list"></u-empty>
        </div>
        <div class="dynamic">
            <div
                class="dynamic-box"
                v-for="(item, index) in msgList"
                :key="index"
            >
                <div class="comment" v-if="item.type === 'comment' || (item.type == 'mentions' && !item.comment.payload)">
                    <div class="user-area">
                        <div class="head-box">
                            <HeadImg
                                :userInfo="item.comment.users"
                                :isLink="true"
                                width="70rpx"
                                height="70rpx"
                            ></HeadImg>
                        </div>
                        <div class="user-info">
                            <div class="user">
                                <Name :userInfo="item.comment.users"></Name>
                            </div>
                            <div class="time">
                                <text>{{
                                    $moment(parseInt(item.utctime)).format(
                                        "yyyy-MM-DD HH:mm"
                                    )
                                }}</text>
                            </div>
                        </div>
                    </div>
                    <div class="comment-content">
                        <mp-html :content="item.comment.payload" />
                    </div>
                    <div
                        class="topic"
                        @click="
                            goUrl('/pages/index/detail?hash=' + item.topic.hash)
                        "
                    >
                        <Name :userInfo="item.topic.users"></Name>
                        <div class="content">
                            <mp-html :content="item.topic.payload" />
                        </div>
                    </div>
                </div>
                <div class="reply" v-if="item.type === 'reply'  || (item.type == 'mentions' && item.comment.payload)">
                    <div class="user-area">
                        <div class="head-box">
                            <HeadImg
                                :userInfo="item.reply.users"
                                :isLink="true"
                                width="70rpx"
                                height="70rpx"
                            ></HeadImg>
                        </div>
                        <div class="user-info">
                            <div class="user">
                                <Name :userInfo="item.reply.users"></Name>
                            </div>
                            <div class="time">
                                <text>{{
                                    $moment(item.utctime).format(
                                        "yyyy-MM-DD HH:mm"
                                    )
                                }}</text>
                            </div>
                        </div>
                    </div>
                    <div class="reply-content">
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
                    </div>
                    <div class="comment">
                        <div class="comment-content">
                            <Name :userInfo="item.comment.users"></Name>：
                            <mp-html
                                :content="item.comment.payload"
                                class="compiler"
                            />
                        </div>
                        <div
                            class="topic"
                            @click="
                                goUrl(
                                    '/pages/index/detail?hash=' +
                                        item.topic.hash
                                )
                            "
                        >
                            <Name :userInfo="item.topic.users"></Name>
                            <div class="content">
                                <mp-html :content="item.topic.payload" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <u-gap :height="10"></u-gap>
        <u-loadmore
            bg-color="rgba(0,0,0,0)"
            :status="more"
            v-show="msgList.length > 0"
        />
        <u-gap :height="20"></u-gap>
        <VersionTip
            v-model="versionShow"
            :versionInfo="versionInfo"
        ></VersionTip>
    </view>
</template>

<script>
import { version } from "@/config/config.js";
import VersionTip from "@/components/VersionTip.vue";
import Name from "@/components/Name.vue";
import UGap from "@/uview-ui/components/u-gap/u-gap.vue";
import mpHtml from "mp-html/dist/uni-app/components/mp-html/mp-html";
import HeadImg from "@/components/HeadImg";

export default {
    components: {
        VersionTip,
        Name,
        mpHtml,
        HeadImg,
        UGap,
    },
    data() {
        return {
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
        };
    },
    //下拉刷新
    onPullDownRefresh() {
        this.pageInfo.page = 1;
        this.getMsgList();
        setTimeout(function() {
            uni.stopPullDownRefresh();
        }, 500);
    },
    //上拉加载
    onReachBottom() {
        this.pageInfo.page++;
        this.getMsgList();
    },
    onLoad() {
        this.getSystemStatusBarHeight(); //状态栏高度
        this.uSetBarTitle(this.i18n.titleBar.message);
        this.getMsgList();
        this.getVersionInfo();
    },
    activated() {
        this.getMsgList();
        this.getVersionInfo();
        this.getUnreadMsg();
    },
    computed: {
        //国际化
        i18n: {
            get() {
                return this.$_i18n.messages[this.$_i18n.locale];
            },
        },
        //类别列表
        categoryList() {
            return [
                {
                    name: this.i18n.message.dynamic
                },
            ];
        },
    },
    methods: {
        //获取帖子列表
        getMsgList() {
            let url = "";
            let params = {
                page: this.pageInfo.page,
                size: this.pageInfo.pageSize,
            };
            if (this.current === 0) {
                url = "/Message/list";
            }
            this.$http
                .post(url, params, { custom: { isToast: true } })
                .then((res) => {
                    if (res.code === 200) {
                        this.pageInfo.totalPage = parseInt(res.data.totalPage);
                        this.more = "loadmore";
                        if (this.pageInfo.page === 1) {
                            this.msgList = res.data.data;
                        } else {
                            if (this.pageInfo.page > this.pageInfo.totalPage) {
                                this.pageInfo.page = this.pageInfo.totalPage;
                                this.more = "nomore";
                            } else {
                                this.msgList = this.msgList.concat(res.data.data);
                            }
                        }
                    } else {
                        this.more = "nomore";
                    }
                }).then(()=>{
                    this.getUnreadMsg();
                })
        },
        //切换顶部tab事件
        tabChange(index) {
            this.current = index;
        },
        //获取服务端版本信息
        getVersionInfo() {
            this.$http
                .post(
                    "/Config/version",
                    { version: version },
                    { custom: { isToast: true } }
                )
                .then((res) => {
                    if (res.code === 200) {
                        this.versionInfo = res.data;
                        if (this.versionInfo.mustUpdate) {
                            this.versionShow = true;
                        }
                    }
                });
        },
    },
};
</script>

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
