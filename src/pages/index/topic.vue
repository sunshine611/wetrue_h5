<script setup>
import TopicList from "@/components/TopicList.vue";
import PostTopicButton from "@/components/Button/PostTopicButton.vue";
import { ref, getCurrentInstance, nextTick } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
const { proxy } = getCurrentInstance();

const keyword = ref("") //话题关键字
const more = ref("loadmore") //加载更多
const postList = ref([]) //帖子列表
const postInfo = ref([]) //帖子信息
const pageInfo = ref({ //页码信息
    page: 1,
    pageSize: 10,
    totalPage: 1,
})
const postButtonInfo = ref({}) //发布按钮增加信息

onLoad ( (option) => {
    proxy.uSetBarTitle(`${
        option.keyword 
        + " "
        + proxy.$t('titleBar.topic')
    }`);
    keyword.value = option.keyword;
    getTopicInfo();
    getPostList();
    postButtonInfo.value = {
        type: "topic",
        keyword: option.keyword
    };
});
//下拉刷新
onPullDownRefresh ( () => {
    pageInfo.page = 1;
    getPostList();
    getTopicInfo();
    setTimeout(function () {
        uni.stopPullDownRefresh();
    }, 500);
});
//上拉加载
onReachBottom ( () => {
    pageInfo.value.page++;
    getPostList();
});

//获取话题帖子列表
const getPostList = () => {
    let params = {
        page: pageInfo.value.page,
        size: pageInfo.value.pageSize,
        keyword: keyword.value,
    };
    proxy.$http.post("/Topic/contentList", params).then((res) => {
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
                    postList.value = postList.value.concat(
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
//获取帖子信息
const getTopicInfo = () => {
    let params = {
        keyword: keyword.value,
    };
    proxy.$http.post("/Topic/info", params).then((res) => {
        if (res.code === 200) {
            postInfo.value = res.data;
        }
    });
}
</script>

<template>
    <view class="topic">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-navbar :is-fixed="false" :title="keyword" v-show="!validThirdPartySource()">
            <template v-slot:right>
                <u-icon
                    class="mr-30"
                    name="home"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('index')"
                ></u-icon>
            </template>
        </u-navbar>
        <view class="tipic-info">
            <view class="topic-box">
                <u-image 
                    class="topic-img" 
                    width="100rpx" 
                    height="100rpx" 
                    border-radius="10" 
                    bg-color="#f04a82"
                    :src="postInfo.imgIcon || '../../static/logo_1.png'"
                ></u-image>
                <view class="topic-title">
                    <u-gap height="10"></u-gap>
                    <b>{{ postInfo.keyword || '#' }}</b>
                    <u-gap height="10"></u-gap>
                    <view class="font-26">{{ postInfo.describe }}</view>
                </view>
            </view>
            <view class="topic-data">
                <view>{{ $t('index.views') + '：' + (postInfo.readSum || 0) }}</view>
                <view>{{ $t('index.discuss') + '：' + (postInfo.total || 0) }}</view>
                <view 
                    @click="goUrl('/pages/my/userInfo?userAddress=' + postInfo.userAddress)"
                >{{ $t('index.founder') + '：' + ( 
                    postInfo.nickname ? postInfo.nickname : postInfo.userAddress?.slice(-4) || "..." 
                    )}}</view>
            </view>
        </view>
        <TopicList :postList="postList"></TopicList>
        <view class="empty" v-show="postList.length === 0">
            <u-empty :text="$t('index.noData')" mode="list"></u-empty>
        </view>
        <u-loadmore
            bg-color="rgba(0,0,0,0)"
            margin-bottom="20"
            :status="more"
            v-show="postList.length > 0"
        />
        <PostTopicButton :postButtonInfo="postButtonInfo"></PostTopicButton>
    </view>
</template>

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
