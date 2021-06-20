<template>
    <view class="topic">
        <u-navbar :is-back="false">
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
                <div class="right">
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
    </view>
</template>

<script>
import { getStore, setStore } from "@/util/service";
import moment from "moment";
import TopicList from "../../components/TopicList.vue";
export default {
    components: {
        TopicList,
    },
    data() {
        return {
            language: getStore("language"),
            index: 0, //类别ID
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
        };
    },
    //上拉刷新
    onPullDownRefresh() {
        this.pageInfo.page = 1;
        this.getPostList();
        setTimeout(function() {
            uni.stopPullDownRefresh();
        }, 500);
    },
    //下拉加载
    onReachBottom() {
        this.pageInfo.page++;
        this.getPostList();
    },
    onLoad() {
        this.cateInfo.label = this.i18n.home.newRelease;
        this.getPostList();
        if (!getStore("language")) {
            setStore("language", "zh-cn");
            this.language = getStore("language");
        }
    },
    computed: {
        //国际化
        i18n() {
            return this.$_i18n.messages[this.$_i18n.locale];
        },
        //类别列表
        categoryList() {
            return [
                {
                    label: this.i18n.home.newRelease,
                    value: 1,
                },
                {
                    label: this.i18n.home.hotRecommend,
                    value: 2,
                },
                {
                    label: this.i18n.home.newPic,
                    value: 3,
                },
                {
                    label: this.i18n.home.myFocus,
                    value: 4,
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
            if (this.cateInfo.value === 1) {
                url = "/Content/list";
            } else if (this.cateInfo.value === 2) {
                url = "/Content/hotRec";
            } else if (this.cateInfo.value === 3) {
                url = "/Image/list";
            } else if (this.cateInfo.value === 4) {
                url = "/Content/focusList";
            }
            this.$http.post(url, params).then((res) => {
                if (res.code === 200) {
                    this.pageInfo.totalPage = parseInt(res.data.totalPage);
                    this.more = "loadmore";
                    if (this.pageInfo.page === 1) {
                        this.postList = res.data.data.map((item) => {
                            console.log(item);
                            item.payload = this.topicHighlight(item.payload);
                            return item;
                        });
                    } else {
                        if (this.pageInfo.page > this.pageInfo.totalPage) {
                            this.pageInfo.page = this.pageInfo.totalPage;
                            this.more = "nomore";
                        } else {
                            this.postList = this.postList.concat(res.data.data);
                        }
                    }
                } else {
                    this.more = "nomore";
                }
            });
        },
        //选择类别
        selectCategory(val) {
            for (let i in this.categoryList) {
                if (this.categoryList[i].value === val) {
                    this.index = i;
                    this.cateInfo.value = val;
                    this.cateInfo.label = this.categoryList[i].label;
                    break;
                }
            }
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
        
    },
};
</script>

<style lang="scss" scoped>
.topic {
    .nav {
        width: 100%;
        position: relative;

        .u-dropdown {
            background-color: #fafafa;
            border-bottom: 1rpx solid #ddd;
            height: 44px;
        }

        .left {
            position: absolute;
            height: 44px;
            left: 25rpx;
            top: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
        }

        .right {
            position: absolute;
            height: 44px;
            right: 20rpx;
            top: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
        }
    }
}
</style>