<template>
    <view class="myTopic">
        <u-navbar title="话题">
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
        this.keyword = option.keyword;
        this.getPostList();
    },
    computed: {
        ...mapGetters(["token"]),
        //国际化
        i18n() {
            return this.$_i18n.messages[this.$_i18n.locale];
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
        //话题高亮
        topicHighlight(value) {
            var exp;
            exp = /#[x80-xff\u4e00-\u9fa5\w ,，.。!！-]{1,25}#/u;
            value = value.replace(exp, (item) => {
                let newVal = `<text style="color:#f04a82" @click="goUrl('@/pages/index/topic')">${item}</text>`;
                return newVal;
            });
            return value;
        },
    },
};
</script>

<style lang="scss" scoped>
.myTopic {
}
</style>
