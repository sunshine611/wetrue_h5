<template>
    <view class="index">
        <view :style="`height:${statusBarHeight}px`"></view>
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
            <u-empty :text="$t('index.noData')" mode="list"></u-empty>
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
        <PostTopicButton v-show="postTopicButtonShow" :postButtonInfo="postButtonInfo"></PostTopicButton>
    </view>
</template>

<script>
import { version } from "@/config/config.js";
import TopicList from "@/components/TopicList.vue";
import PostTopicButton from "@/components/Button/PostTopicButton.vue";
import VersionTip from "@/components/VersionTip.vue";
import { setThirdPartySource } from "@/util/thirdPartySource/source";
import socket from '@/util/socketio.js';
import { getStore, setStore } from "@/util/service";

export default {
    components: {
        TopicList,
        VersionTip,
        PostTopicButton
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
            postButtonInfo: {}, //发布按钮增加信息
            blacklist: getStore("blacklist"), //黑名单列表
            blacklistState: getStore("blacklistState"), //黑名单列表状态
        };
    },
    //下拉刷新
    onPullDownRefresh() {
        this.pageInfo.page = 1;
        this.getPostList();
        this.getUnreadMsg();
        setTimeout(function () {
            uni.stopPullDownRefresh();
            this.newContentCount();
        }, 500);
        this.getSystemStatusBarHeight(); //状态栏高度
    },
    //上拉加载
    onReachBottom() {
        this.pageInfo.page++;
        this.getPostList();
        this.getUnreadMsg();
    },
    onShow() {
        setTimeout(() => {
            if (this.current === 0) this.getNewCount();
        }, 1000);
    },
    onLoad(option) {
        this.uSetBarTitle(this.$t('titleBar.index'));
        setThirdPartySource(option);
        this.cateInfo.label = this.$t('home.newRelease');
        this.getPostList();
        this.appVersion();
        this.getUnreadMsg();
        //监听最新总贴数
		socket.on('contentListCount', (res) => {
            this.newCount = res.countSize;
            this.newContentCount();
        })
        //监听最新未读消息
		socket.on('msgStateSize', (res) => {
            if(res.msgStateSize == 'new') {
                this.getUnreadMsg();
            }
        })
        //监听错误
		socket.on('error', (msg) => this.uShowToast(msg))
    },
    mounted() {
        setTimeout(() => {
            this.getSystemStatusBarHeight(); //状态栏高度
        }, 1000);
    },
    onTabItemTap() {
        if (this.tabClick) {
            this.postList = [];
            this.pageInfo.page = 1;
            this.getPostList();
        }
        this.tabClick = true;
        setTimeout(() => {
            this.tabClick = false;
            this.newContentCount();
        }, 500);
    },
    computed: {
        //类别列表
        categoryList() {
            return [
                {
                    name: this.$t('home.newRelease'),
                },
                {
                    name: this.$t('home.hotRecommend'),
                },
                {
                    name: this.$t('home.newPic'),
                },
                {
                    name: this.$t('home.myFocus'),
                },
                {
                    name: this.$t('home.superHero'),
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
            this.postButtonInfo = {};
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
                this.postButtonInfo = { type: "shtip" };
                if (this.validThirdPartySource()) this.postTopicButtonShow = false;
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
                                let itemList = res.data.data.map((item) => {
                                    return this.itemListMap(item); //数据处理
                                });
                                this.postList = itemList.filter((s)=> {return s;});
                            });
                        } else {
                            if (this.pageInfo.page > this.pageInfo.totalPage) {
                                this.pageInfo.page = this.pageInfo.totalPage;
                                this.more = "nomore";
                            } else {
                                let itemList = res.data.data.map((item) => {
                                        return this.itemListMap(item); //数据处理
                                    });
                                this.postList = this.postList.concat(itemList.filter((s)=> {return s;}));
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
        //未读新帖标记
        newContentCount() {
            const oldCount = this.pageInfo.totalSize
            if (this.current === 0) {
                if (this.newCount > oldCount) {
                    let size = this.newCount - oldCount;
                    uni.setTabBarBadge({
                        index: 0,
                        text: `${size}`,
                    });
                    const url = "/Content/list";
                    let params = {page: 1, size: size};
                    this.getNewPost(url, params);
                } else {
                    uni.hideTabBarRedDot({
                        index: 0,
                    });
                }
            }
        },
        getNewCount() {
            const url = "/Content/list";
            const params = {page: 1, size: 1};
            this.$http
                .post(url, params)
                .then((res) => {
                    if (res.code === 200) {
                        this.newCount = parseInt(res.data.totalPage);
                        this.newContentCount();
                    }
                });
        },
        getNewPost(url, params) {
            this.$http
                .post(url, params)
                .then((res) => {
                    if (res.code === 200) {
                        this.pageInfo.totalPage = parseInt(res.data.totalPage);
                        res.data.data.map((item) => {
                            if (this.postList[0].hash !== item.hash ) {
                                this.postList.unshift(this.itemListMap(item));
                                this.postList.pop();
                            }
                        });
                        uni.hideTabBarRedDot({
                            index: 0,
                        });
                    }
                });
        },
        //获取服务端版本信息
        appVersion() {
            this.getVersionInfo().then((res) => {
                this.versionInfo = res;
                if (this.versionInfo.mustUpdate) {
                    this.versionShow = true;
                }
            });
        },
        //帖子列表-数据前期处理
        itemListMap(item){
            this.blacklistState = getStore("blacklistState"); //获取黑名单状态
            if (this.blacklistState === 1) {
                this.blacklist = getStore("blacklist");
                setStore("blacklistState", 0);
            }

            item.payload = this.topicHighlight(
                item.payload
            );
            if (this.current === 4) { //超级英雄
                item.hash = item.shTipid;
            }
            const block = this.blacklist.includes(item.users.userAddress);
            if(!block) {
                return item;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.index {
    .nav {
        ::v-deep .u-navbar-inner {
            display: inline !important;
        }
        .nav-tab {
            width: 100%;
        }
    }
}
</style>
