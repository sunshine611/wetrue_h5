<script setup>
import TopicList from "@/components/TopicList.vue";
import { ref, getCurrentInstance, nextTick } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from "@/stores/userStore";
const userStore = useUserStore();
const { proxy } = getCurrentInstance();

const type = ref("") //类型
const title = ref("") //标题
const more = ref("loadmore") //加载更多
const postList = ref([]) //帖子列表
const pageInfo = ref({ //页码信息
    page: 1,
    pageSize: 10,
    totalPage: 1,
})

onLoad ( (option) => {
    if (option.type === "myTopic") {
        type.value  = "myTopic";
        title.value = proxy.$t('my.myTopic');
    } else if (option.type === "myStar") {
        type.value  = "myStar";
        title.value = proxy.$t('my.myStar');
    }
    proxy.uSetBarTitle(title.value);
    getPostList();
    proxy.getUserInfo();
});
//下拉刷新
onPullDownRefresh ( () => {
    pageInfo.value.page = 1;
    getPostList();
    setTimeout(function() {
        uni.stopPullDownRefresh();
    }, 500);
});
//上拉加载
onReachBottom ( () => {
    pageInfo.value.page++;
    getPostList();
});

//获取帖子列表
const getPostList = () => {
    var params, url;
    if (type.value === "myTopic") {
        params = {
            page: pageInfo.value.page,
            size: pageInfo.value.pageSize,
            userAddress: userStore.token,
        };
        url = "/User/contentList";
    } else if (type.value === "myStar") {
        params = {
            page: pageInfo.value.page,
            size: pageInfo.value.pageSize,
            userAddress: userStore.token,
        };
        url = "/Content/starList";
    }
    proxy.$http.post(url, params,{ custom: { isToast: true } }).then((res) => {
        if (res.code === 200) {
            pageInfo.value.totalPage = parseInt(res.data.totalPage);
            more.value = "loadmore";
            if (pageInfo.value.page === 1) {
                nextTick(() => {
                    postList.value = res.data.data.map((item) => {
                        item.payload = proxy.topicHighlight(
                            item.payload
                        );
                        return item;
                    });
                });
            } else {
                if (pageInfo.value.page > pageInfo.value.totalPage) {
                    pageInfo.value.page = pageInfo.value.totalPage;
                    more.value = "nomore";
                } else {
                    postList.value  = postList.value.concat(
                        res.data.data.map((item) => {
                            item.payload = proxy.topicHighlight(
                                item.payload
                            );
                            return item;
                        })
                    );
                }
            }
        } else {
            more.value = "nomore";
        }
    });
}

</script>

<template>
    <view class="myTopic" :title="title">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-navbar :is-fixed="false" :title="title" v-show="!validThirdPartySource()">
            <template v-slot:right>
                <u-icon
                    name="home"
                    class="mr-30"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('../index/index')"
                ></u-icon>
            </template>
        </u-navbar>
        <TopicList :postList="postList"></TopicList>
        <view class="empty" v-show="postList.length === 0">
            <u-empty :text="$t('index.noData')" mode="list"></u-empty>
        </view>
        <u-loadmore
            bg-color="rgba(0,0,0,0)"
            class="mb-20"
            :status="more"
            v-show="postList.length > 0"
        />
    </view>
</template>

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
