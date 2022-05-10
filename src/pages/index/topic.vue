<template>
    <view class="topic">
        <view :style="`padding-top:${statusBarHeight}px`"></view>
        <u-navbar :is-fixed="false" :title="keyword" v-show="!validThirdPartySource()">
            <div slot="right">
                <u-icon
                    class="mr-30"
                    name="home"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('../index/index')"
                ></u-icon>
            </div>
        </u-navbar>
        <div class="tipic-info">
            <div class="topic-box">
                <u-image v-if="postInfo.imgIcon" class="topic-img" width="100rpx" height="100rpx" :src="postInfo.imgIcon" border-radius="10" bg-color="#f04a82"></u-image>
                <u-image v-else class="topic-img" width="100rpx" height="100rpx" src="../../static/logo_1.png" border-radius="10" bg-color="#f04a82"></u-image>
                <div class="topic-title">
                    <u-gap height="10"></u-gap>
                    <b>{{postInfo.keyword}}</b>
                    <u-gap height="10"></u-gap>
                    <div class="font-26">{{postInfo.describe}}</div>
                </div>
            </div>
            <div class="topic-data">
                <div>{{ $t('index.views') + '：' + postInfo.read_sum }}</div>
                <div>{{ $t('index.discuss') + '：' + postInfo.total }}</div>
                <div 
                    @click="goUrl('/pages/my/userInfo?userAddress=' + postInfo.sender_id)"
                >{{ $t('index.founder') + '：' + postInfo.nickname }}</div>
            </div>
        </div>
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
        <PostTopicButton :postButtonInfo="postButtonInfo"></PostTopicButton>
    </view>
</template>

<script>
import { mapGetters } from "vuex";
import TopicList from "@/components/TopicList.vue";
import PostTopicButton from "@/components/Button/PostTopicButton.vue";

export default {
    components: {
        TopicList,
        PostTopicButton,
    },
    data() {
        return {
            keyword: "", //话题关键字
            postList: [], //帖子列表
            postInfo: [], //帖子信息
            pageInfo: {
                page: 1,
                pageSize: 10,
                totalPage: 1,
            }, //页码信息
            more: "loadmore", //加载更多
            postButtonInfo: {}, //发布按钮增加信息
        };
    },
    //下拉刷新
    onPullDownRefresh() {
        this.pageInfo.page = 1;
        this.getPostList();
        this.getTopicInfo();
        setTimeout(function () {
            uni.stopPullDownRefresh();
        }, 500);
    },
    //上拉加载
    onReachBottom() {
        this.pageInfo.page++;
        this.getPostList();
    },
    onLoad(option) {
        this.uSetBarTitle(`${
            option.keyword 
            + " "
            + this.$t('titleBar.topic')
        }`);
        this.keyword = option.keyword;
        this.getTopicInfo();
        this.getPostList();
        this.postButtonInfo = {
            type: "topic",
            keyword: option.keyword
        };
    },
    computed: {
        ...mapGetters(["token"]),
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
        //获取帖子信息
        getTopicInfo() {
            let params = {
                keyword: this.keyword,
            };
            this.$http.post("/Topic/info", params).then((res) => {
                if (res.code === 200) {
                    this.postInfo = res.data;
                }
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.topic {
    .tipic-info {
        background: #fff;
        min-height: 100upx;
        position: relative;
        margin-bottom:20rpx;
        padding:40rpx 40rpx 30rpx 40rpx;
        box-shadow: 0px 2px 6px 0px rgba(153,153,153,0.3);
        .topic-box{
            overflow: hidden;
            margin-bottom:40rpx;
            .topic-img{
                float: left;
                margin-right:24rpx;
            }
        }
        .topic-data{
            display: flex;
            justify-content: space-between;
            font-size: 24rpx;
            color:#666;
            border-top:1px solid #eee;
            padding-top:20rpx;
        }
    }
}
</style>
