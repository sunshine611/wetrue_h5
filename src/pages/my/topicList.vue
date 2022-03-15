<template>
    <view class="myTopic" :title="title">
        <u-status-bar></u-status-bar>
        <u-navbar 
            :title="i18n.my.myWallet" 
            :placeholder="true"
            :autoBack="true"
            v-show="!validThirdPartySource()"
        >
            <view slot="right">
                <u-icon
                    name="home"
                    color="#f04a82"
                    class="mr-30"
                    size="34"
                    @click="reLaunchUrl('../index/index')"
                ></u-icon>
            </view>
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
import TopicList from "@/components/TopicList.vue";
import HeadImg from "@/components/HeadImg.vue";

export default {
    components: {
        TopicList,
        HeadImg
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
    //下拉刷新
    onPullDownRefresh() {
        this.pageInfo.page = 1;
        this.getPostList();
        setTimeout(function() {
            uni.stopPullDownRefresh();
        }, 500);
    },
    //上拉加载
    onReachBottom() {
        this.pageInfo.page++;
        this.getPostList();
    },
    onLoad(option) {
        if (option.type === "myTopic") {
            this.type = "myTopic";
            this.title = this.i18n.my.myTopic;
        } else if (option.type === "myStar") {
            this.type = "myStar";
            this.title = this.i18n.my.myStar;
        }
        this.uSetBarTitle(this.title);
        this.getPostList();
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
                    userAddress: this.token,
                };
                url = "/Content/starList";
            }
            this.$http.post(url, params,{ custom: { isToast: true } }).then((res) => {
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
    .user-box {
        background-color: rgba($color: #f04a82, $alpha: 0.9);
        font-size: 26upx;
        box-sizing: border-box;
        margin-bottom:20rpx;
        box-shadow: 0px 0px 6px 0px
                        rgba($color: #f04a82, $alpha: 0.9);
        .user-top {
            padding: 30rpx 30rpx 0 30rpx;
            display: flex;

            .head {
                text-align: center;
                font-size: 24upx;
                padding: 20rpx 30rpx;
                color:#fff;
            }

            .address {
                display: inline-flex;
                flex-wrap: wrap;
                align-items: center;
                line-height: 50rpx;
                color: #fff;
                font-size: 34rpx;
            }
        }

        .user-bottom {
            display: flex;
            justify-content: space-around;
            padding: 10rpx 30rpx 30rpx;

            .item {
                text-align: center;

                .value {
                    font-size: 24rpx;
                    color: #fff;
                }

                .label {
                    font-size: 24rpx;
                    color: #fff;
                }
            }
        }
    }
}
</style>
