<template>
    <view class="index">
        <u-navbar :is-back="false" class="nav">
            <u-tabs
                :list="categoryList"
                :is-scroll="true"
                @change="selectCategory"
                :current="current"
                active-color="#f04a82"
                bg-color="#fafafa"
                class="nav-tab"
                :show-bar="false"
                 :style="{'paddingTop':iphoneTop()?'14px':'0'}"
            ></u-tabs>
        </u-navbar>
        <TopicList :postList="postList" :style="{'marginTop':iphoneTop()?'14px':'0'}"></TopicList>
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
            }, //页码信息
            more: "loadmore", //加载更多
            currentForum: {}, //当前选择的帖子
            versionInfo: {}, //版本信息
            versionCode: parseInt(version.replace(/\./g, "")), //版本号
            versionShow: false, //版本提示弹层
            tabClick: false, //点击tab事件
            postTopicButtonShow: true, //控制发帖按钮显隐
        };
    },
    //上拉刷新
    onPullDownRefresh() {
        this.pageInfo.page = 1;
        this.getPostList();
        this.getUnreadMsg();
        setTimeout(function () {
            uni.stopPullDownRefresh();
        }, 500);
    },
    //下拉加载
    onReachBottom() {
        this.pageInfo.page++;
        this.getPostList();
        this.getUnreadMsg();
    },
    onLoad(option) {
        this.uSetBarTitle(this.i18n.titleBar.index);
        setThirdPartySource(option);
        this.cateInfo.label = this.i18n.home.newRelease;
        this.getPostList();
        this.getVersionInfo();
        this.getUnreadMsg();
        
    },
    activated() {
        this.getUnreadMsg();
        this.iphoneTop()
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
        //选择类别
        selectCategory(index) {
            this.current = index;
            this.postList = [];
            this.pageInfo = {
                page: 1,
                pageSize: 10,
            }; //页码信息
            this.getPostList();
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
