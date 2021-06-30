<template>
    <view class="myTopic">
        <u-navbar :title="title">
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
            class="mb-20"
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
            type: "", //类型
            title: "", //标题
            userAddress: "", //用户地址
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
        if (option.type === "myTopic") {
            this.type = "myTopic";
            this.title = "我的帖子";
        } else if (option.type === "myStar") {
            this.type = "myStar";
            this.title = "我的收藏";
        } else if (option.type === "user") {
            this.type = "user";
            this.userAddress = option.userAddress;
            this.title = "用户帖子";
        }
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
        //获取帖子列表
        getPostList() {
            var params, url;
            if (this.type === "myTopic") {
                params = {
                    page: this.pageInfo.page,
                    size: this.pageInfo.pageSize,
                    userAddress: this.token,
                };
                url = "/User/contentList";
            } else if (this.type === "myStar") {
                params = {
                    page: this.pageInfo.page,
                    size: this.pageInfo.pageSize,
                };
                url = "/Content/starList";
            }
            else if (this.type === "user") {
                params = {
                    page: this.pageInfo.page,
                    size: this.pageInfo.pageSize,
                    userAddress: this.userAddress,
                };
                url = "/User/contentList";
            }
            this.$http.post(url, params).then((res) => {
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
    },
};
</script>

<style lang="scss" scoped>
.myTopic {
}
</style>
