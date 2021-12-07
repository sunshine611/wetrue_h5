<template>
    <view class="myTopic">
        <u-navbar :title="keyword">
            <div slot="right">
                <u-icon
                    name="home"
                    class="mr-30"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('../index/index')"
                ></u-icon>
            </div>
        </u-navbar>
    <div class="myTopicBar">
        <br>
        <div class="topic-info">
            这里原本有美美的Topic信息，ui设计师跑路，以后再做：<br>
            Views:{{this.load_read_sum}}  
            Discuss:{{this.load_total}}  
            nickname:{{this.load_nickname}}
            </div>
        </div>
        <br>
    </div>
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
import { mapGetters } from "vuex";
import TopicList from "../../components/TopicList.vue";
export default {
    components: {
        TopicList,
    },
    data() {
        return {
            keyword: "", //话题关键字
            postList: [], //帖子列表
            pageInfo: {
                page: 1,
                pageSize: 10,
                totalPage: 1,
            }, //页码信息
            more: "loadmore", //加载更多
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
    onLoad(option) {
        this.load_total = "";
        this.load_read_sum = "";
        this.load_nickname = "";
        this.keyword = option.keyword;
        this.getTopicInfo();
        this.getPostList();
        uni.setNavigationBarTitle({
        　　title:`${this.i18n.titleBar.topic}-${this.keyword}`
        });
    },
    computed: {
        ...mapGetters(["token"]),
        //国际化
        i18n: {
            get() {
                return this.$_i18n.messages[this.$_i18n.locale];
            },
        },
    },
    methods: {
        //获取话题帖子列表
        getPostList() {
            let params = {
                page: this.pageInfo.page,
                size: this.pageInfo.pageSize,
                keyword: this.keyword,
            };
            this.$http.post("/Topic/contentList", params).then((res) => {
                if (res.code === 200) {
                    this.pageInfo.totalPage = parseInt(res.data.totalPage);
                    this.more = "loadmore";
                    if (this.pageInfo.page === 1) {
                        this.$nextTick(() => {
                            this.postList = res.data.data.map((item) => {
                                item.payload = this.topicHighlight(
                                    item.payload
                                );
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
         getTopicInfo() {
            let loadKeyword = {
                keyword: this.keyword,
            };
            this.$http.post("/Topic/info", loadKeyword).then((res) => {
                if (res.code === 200) {
                    this.load_total = res.data.total;
                    this.load_read_sum = res.data.read_sum;
                    this.load_nickname = res.data.nickname;
                }
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.myTopic {
};
.myTopicBar {
    .topic-info {
        background: #f04a82;
        width: 100%;
        height: 100upx;
        position: relative;
    }
}
</style>
