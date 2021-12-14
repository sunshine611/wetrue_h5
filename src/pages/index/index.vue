<template>
    <view class="index">
        <!-- <u-navbar :is-back="false">
            <view class="slot-wrap nav">
                <u-dropdown
                    ref="uDropdown"
                    class="u-dropdown"
                    active-color="#f04a82"
                >
                    <u-dropdown-item
                        v-model="cateInfo.value"
                        :title="cateInfo.label"
                        :options="categoryList"
                        @change="selectCategory"
                    ></u-dropdown-item>
                </u-dropdown>
                <div class="left">
                    <fa-FontAwesome
                        type="fas fa-language"
                        size="36"
                        class="mr-10"
                        color="#f04a82"
                        @tap="selectLanguage"
                        v-show="language === 'zh-cn'"
                    >
                    </fa-FontAwesome>
                    <fa-FontAwesome
                        type="fas fa-language"
                        size="36"
                        class="mr-10"
                        color="#03a9f4"
                        @tap="selectLanguage"
                        v-show="language === 'en'"
                    >
                    </fa-FontAwesome>
                </div>
                <div class="right" v-if="validLogin()">
                    <fa-FontAwesome
                        type="fas fa-plus"
                        size="36"
                        class="mr-10"
                        color="#f04a82"
                        @tap="goUrl('editor')"
                    >
                    </fa-FontAwesome>
                </div>
            </view>
        </u-navbar> -->
        <u-navbar :is-back="false" class="nav">
            <u-tabs
                :list="categoryList"
                :is-scroll="true"
                @change="selectCategory"
                :current="current"
                active-color="#f04a82"
                bg-color="#fafafa"
                class="nav-tab"
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
        <div class="post safe-area-inset-bottom" v-if="validLogin()">
            <fa-FontAwesome
                type="fas fa-plus"
                size="36"
                color="rgba(255,255,255,0.9)"
                @tap="goUrl('editor')"
            >
            </fa-FontAwesome>
        </div>
    </view>
</template>

<script>
import { getStore, setStore } from "@/util/service";
import { version } from "@/config/config.js";
import moment from "moment";
import TopicList from "../../components/TopicList.vue";
import VersionTip from "@/components/VersionTip.vue";
export default {
    components: {
        TopicList,
        VersionTip,
    },
    data() {
        return {
            language: getStore("language"),
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
    onLoad() {
        this.cateInfo.label = this.i18n.home.newRelease;
        this.getPostList();
        this.getVersionInfo();
        this.getUnreadMsg();
        if (!getStore("language")) {
            setStore("language", "zh-cn");
            this.language = getStore("language");
        }
        uni.setNavigationBarTitle({
            title: this.i18n.titleBar.index,
        });
    },
    activated() {
        this.getUnreadMsg();
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
                    name: "SuperHero",
                }
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
        //切换语言
        selectLanguage() {
            if (getStore("language") === "zh-cn") {
                setStore("language", "en");
            } else if (getStore("language") === "en") {
                setStore("language", "zh-cn");
            }
            //控制语言显示
            this.language = getStore("language");
            moment.locale(getStore("language"));
            this.$_i18n.locale = getStore("language");
            let index = parseInt(this.index) + 1;
            this.cateInfo.value = index;
            this.cateInfo.label = this.categoryList[this.index].label;
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
            display: inline!important;
        }
        .nav-tab {
            width: 100%;
        }
    }

    .post {
        position: fixed;
        z-index: 1000;
        right: 60rpx;
        bottom: 150rpx;
        background: rgba(#f04a82, 0.75);
        box-shadow: 0rpx 0rpx 20rpx 5rpx rgba(#f04a82, 0.3);
        width: 80rpx;
        height: 80rpx;
        border-radius: 40rpx;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>
