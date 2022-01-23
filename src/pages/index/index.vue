<template>
    <view class="index">
        <view :style="`padding-top:${statusBarHeight}px`"></view>
            <u-navbar class="nav" :is-fixed="false" :is-back="false">
                <u-tabs
                    class="nav-tab"
                    :list="categoryList"
                    :is-scroll="true"
                    @change="tabChange"
                    :current="current"
                    active-color="#f04a82"
                    bg-color="#fafafa"
                    :show-bar="false"
                ></u-tabs>
            </u-navbar>
        <TopicList :postList="postList"></TopicList>
        <div class="empty" v-show="postList.length === 0">
            <u-empty :text="i18n.index.noData" mode="list"></u-empty>
        </div>
        <u-loadmore
            bg-color="rgba(0,0,0,0)"
            margin-bottom="20"
            :status="more"
            v-show="postList.length > 0"
        />
        <VersionTip
            v-model="versionShow"
            :versionInfo="versionInfo"
        ></VersionTip>
        <PostTopicButton v-show="postTopicButtonShow"></PostTopicButton>
    </view>
</template>

<script>
import { version } from "@/config/config.js";
import TopicList from "@/components/TopicList.vue";
import PostTopicButton from "@/components/Button/PostTopicButton.vue";
import VersionTip from "@/components/VersionTip.vue";
import { setThirdPartySource } from "@/util/thirdPartySource/source";
import socket from '@/util/socketio.js';

export default {
    components: {
        TopicList,
        VersionTip,
        PostTopicButton,
    },
    data() {
        return {
            current: 0, //tab当前选项
            cateInfo: {
                value: 1,
                label: "",
            }, //当前类别
            postList: [], //帖子列表
            pageInfo: {
                page: 1,
                pageSize: 10,
                totalPage: 1,
                totalSize: 0,
            }, //页码信息
            more: "loadmore", //加载更多
            currentForum: {}, //当前选择的帖子
            versionInfo: {}, //版本信息
            versionCode: parseInt(version.replace(/\./g, "")), //版本号
            versionShow: false, //版本提示弹层
            tabClick: false, //点击tab事件
            postTopicButtonShow: true, //控制发帖按钮显隐
            newCount: 0, //最新总贴数
        };
    },
    //下拉刷新
    onPullDownRefresh() {
        this.pageInfo.page = 1;
        this.getPostList();
        this.getUnreadMsg();
        setTimeout(function () {
            uni.stopPullDownRefresh();
        }, 500);
    },
    //上拉加载
    onReachBottom() {
        this.pageInfo.page++;
        this.getPostList();
        this.getUnreadMsg();
    },
    onLoad(option) {
        this.getSystemStatusBarHeight(); //状态栏高度
        this.uSetBarTitle(this.i18n.titleBar.index);
        setThirdPartySource(option);
        this.cateInfo.label = this.i18n.home.newRelease;
        this.getPostList();
        this.getVersionInfo();
        this.getUnreadMsg();
        //监听最新总贴数
		socket.on('contentListCount', (res) => {
            this.newCount = res.countSize;
            this.newContentCount();
        })
        //监听错误
		socket.on('error', (msg) => this.uShowToast(msg))
    },
    activated() {
        this.getUnreadMsg();
    },
    onTabItemTap() {
        if (this.tabClick) {
            this.postList = [];
            this.pageInfo.page = 1;
            this.getPostList();
            this.newContentCount();
        }
        this.tabClick = true;
        setTimeout(() => {
            this.tabClick = false;
        }, 500);
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
                    name: this.i18n.home.newRelease,
                },
                {
                    name: this.i18n.home.hotRecommend,
                },
                {
                    name: this.i18n.home.newPic,
                },
                {
                    name: this.i18n.home.myFocus,
                },
                {
                    name: this.i18n.home.superHero,
                },
            ];
        },
    },
    methods: {
        //获取帖子列表
        getPostList() {
            let url = "";
            let params = {
                page: this.pageInfo.page,
                size: this.pageInfo.pageSize,
            };
            this.postTopicButtonShow = true;
            if (this.current === 0) {
                url = "/Content/list";
            } else if (this.current === 1) {
                url = "/Content/hotRec";
            } else if (this.current === 2) {
                url = "/Image/list";
            } else if (this.current === 3) {
                url = "/Content/focusList";
            } else if (this.current === 4) {
                url = "/Content/shTipidList";
                this.postTopicButtonShow = false;
            }
            this.$http
                .post(url, params, { custom: { isToast: true } })
                .then((res) => {
                    if (res.code === 200) {
                        this.pageInfo.totalPage = parseInt(res.data.totalPage);
                        this.more = "loadmore";
                        if (this.pageInfo.page === 1) {
                            this.pageInfo.totalSize = parseInt(res.data.totalSize);
                            this.$nextTick(() => {
                                this.postList = res.data.data.map((item) => {
                                    item.payload = this.topicHighlight(
                                        item.payload
                                    );
                                    if (this.current === 4) {
                                        item.hash = item.shTipid;
                                    }
                                    return item;
                                });
                            });
                        } else {
                            if (this.pageInfo.page > this.pageInfo.totalPage) {
                                this.pageInfo.page = this.pageInfo.totalPage;
                                this.more = "nomore";
                            } else {
                                this.postList = this.postList.concat(
                                    res.data.data.map((item) => {
                                        item.payload = this.topicHighlight(
                                            item.payload
                                        );
                                        if (this.current === 4) {
                                            item.hash = item.shTipid;
                                        }
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
        //切换顶部tab事件
        tabChange(index) {
            this.current = index;
            this.postList = [];
            this.pageInfo = {
                page: 1,
                pageSize: 10,
            }; //页码信息
            this.getPostList();
        },
        //新未读帖
        newContentCount() {
            let oldCount = this.pageInfo.totalSize
            if (this.current === 0) {
                if (this.newCount > oldCount) {
                    uni.setTabBarBadge({
                        index: 0,
                        text: `${this.newCount - oldCount}`,
                    });
                } else {
                    uni.hideTabBarRedDot({
                        index: 0,
                    });
                }
            }
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
    .nav {
        /deep/ .u-navbar-inner {
            display: inline !important;
        }
        .nav-tab {
            width: 100%;
        }
    }
}
</style>
