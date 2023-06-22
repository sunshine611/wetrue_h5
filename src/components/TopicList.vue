<script setup>
import HeadImg from "@/components/HeadImg";
import Name from "@/components/Name";
import TopicMore from "@/components/TopicMore";
import mpHtml from "mp-html/dist/uni-app/components/mp-html/mp-html";
import { mixinUtils } from'@/mixins/mixinUtils'
import { getCurrentInstance, watch } from 'vue';
const { proxy } = getCurrentInstance();

const props = defineProps({
    postList: {
        type: Array,
        default: [],
    }
})

//暴露方法名"receiveWeTrueMessage"
window["receiveWeTrueMessage"] = async (res) => {
    if (res.code == 200) {
        proxy.postHashToWeTrue(res,true).then((res) => {
            releaseCallback(res);
        });
    }
};

watch(
	() => props.postList,
	(val) => {
        proxy.$nextTick(() => {
            const topicArr = document.getElementsByClassName("topic-text");
            if (topicArr.length > 0) {
                for (let i = 0; i < topicArr.length; i++) {
                    topicArr[i].addEventListener(
                        "click",
                        (e) => {
                            let text = topicArr[i].innerText;
                            proxy.goUrl(
                                "/pages/index/topic?keyword=" + text
                            );
                            e.stopPropagation();
                        },
                        true
                    );
                }
            }
            const mentionsArr = document.getElementsByClassName("mentions-text");
            if (mentionsArr.length > 0) {
                for (let i = 0; i < mentionsArr.length; i++) {
                    mentionsArr[i].addEventListener(
                        "click",
                        (e) => {
                            let text = mentionsArr[i].innerText;
                            Backend.nodeApiGetAddressByNames(text.slice(1)).then((res) => {
                                proxy.goUrl(
                                    "/pages/my/userInfo?userAddress=" + res
                                );
                            });
                            e.stopPropagation();
                        },
                        true
                    );
                }
            }
        });
})

//是否点赞
const praise = (item) => {
    let params = {};
    if (item.hash.slice(0,3) === "th_") {
        params = {
            hash: item.hash,
            type: "topic",
        };
    } else {
        params = {
            hash: item.shTipid,
            type: "shTipid",
        };
    }
    proxy.$http.post("/Submit/praise", params).then((res) => {
        if (res.code === 200) {
            item.isPraise = res.data.isPraise;
            item.praise = res.data.praise;
        }
    });
}
//是否收藏
const star = (item) => {
    let payload = {
        action: item.isStar ? 'false' : 'true',
        content: item.hash,
    };
    proxy.wetrueSend("star", payload).then((res) => {
        releaseCallback(item);
    });
}

const releaseCallback = (item) => {
    item.isStar = !item.isStar;
    item.star = item.isStar ? item.star+1 : item.star-1;
    proxy.uHideLoading();
}
</script>

<template>
    <view class="topic">
        <view class="forum">
            <view
                class="forum-item"
                v-for="(item, index) in postList"
                :key="index"
            >
                <view class="focus" v-show="item.isFocus">
                    <fa-FontAwesome
                        type="fas fa-heart"
                        size="24"
                        class="star"
                        color="#fff"
                    >
                    </fa-FontAwesome>
                </view>
                <view class="user-area">
                    <view class="head-box">
                        <HeadImg
                            :userInfo="item.users"
                            :isLink="true"
                            width="70rpx"
                            height="70rpx"
                        ></HeadImg>
                    </view>
                    <view class="user-info">
                        <view class="user">
                            <Name :userInfo="item.users"></Name>
                            <TopicMore :topicInfo="item" :postList="postList" class="mr-10"></TopicMore>
                        </view>
                        <view class="time">
                            <text>{{ $moment(item.utcTime).fromNow() }}</text
                            >{{ $t('index.source') + item.source /*+ '-' + item.chainId*/ }}
                        </view>
                    </view>
                </view>
                <view
                    class="main-content"
                    @tap="goUrl('/pages/index/detail?hash=' + item.hash)"
                >
                    <view class="text-content">
                        <mp-html :content="item.payload"/>
                    </view>
                    <view
                        class="img-list"
                        v-for="(items, index) in item.mediaList"
                        :key="index"
                    >
                        <u-image
                            height="320rpx"
                            mode = "heightFix"
                            :lazy-load="true"
                            :src="mixinUtils.ipfsUrltoCid(items.image.ipfs)"
                            v-if="items.image.ipfs"
                        >
                            <template v-slot:loading><u-loading ></u-loading></template>
                            <template v-slot:error><view style="font-size: 28rpx;">加载失败</view></template>
                        </u-image>
                    </view>
                        <u-image
                            width="200rpx"
                            height="200rpx"
                            :src="item.image"
                            v-if="item.image"
                        ></u-image>
                        <u-link 
                            v-if="item.url"
                            :href="item.url" 
                            color="#f04a82"
                            >
                        {{ item.simpleUrl }}
                        </u-link>
                </view>
                <view class="operation">
                    <view
                        class="item"
                        @click="goUrl('/pages/index/detail?hash=' + item.hash)"
                    >
                        <fa-FontAwesome
                            type="far fa-comment-alt"
                            size="28"
                            class="mr-10"
                            color="#666"
                        ></fa-FontAwesome>
                        {{ item.commentNumber }}
                    </view>
                    <view class="item" @tap="star(item)">
                        <fa-FontAwesome
                            type="fas fa-star"
                            size="28"
                            class="mr-10"
                            color="#ffc107"
                            v-show="item.isStar"
                        >
                        </fa-FontAwesome>
                        <fa-FontAwesome
                            type="far fa-star"
                            size="28"
                            class="mr-10"
                            color="#666"
                            v-show="!item.isStar"
                        >
                        </fa-FontAwesome>
                        {{ item.star }}
                    </view>
                    <view class="item" @tap="praise(item)">
                        <u-icon
                            v-show="!item.isPraise"
                            class="mr-10"
                            name="thumb-up"
                            :size="30"
                            color="#666"
                        ></u-icon>
                        <u-icon
                            v-show="item.isPraise"
                            class="mr-10"
                            name="thumb-up-fill"
                            color="#f04a82"
                            :size="30"
                        >
                        </u-icon>
                        {{ item.praise }}
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<style lang="scss" scoped>
.topic {
    .forum {
        &-item {
            background-color: #fff;
            border-bottom: 2rpx solid #ececec;
            margin-bottom: 20rpx;
            position: relative;
            .focus {
                position: absolute;
                right: 0;
                top: 0;
                width: 0;
                height: 0;
                border-top: 40rpx solid #f04a82;
                border-left: 40rpx solid transparent;
                .star {
                    position: absolute;
                    transform: scale(0.65);
                    right: 0rpx;
                    top: -38rpx;
                }
            }
            .user-area {
                padding: 20rpx;
                display: flex;

                .head-box {
                    margin-right: 20rpx;
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    width: 100%;

                    .user {
                        width: 100%;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .time {
                        font-size: 24rpx;
                        color: #91908e;
                        width: 100%;

                        text {
                            color: #999;
                            margin-right: 20rpx;
                        }
                    }
                }
            }

            .main-content {
                margin: 0 30rpx 0rpx 30rpx;
                padding: 0 0 25rpx 0;
                font-size: 26rpx;
                border-bottom: 2rpx dashed #e9e9e9;

                .text-content {
                    font-size: 32rpx;
                    margin-bottom: 20rpx;
                    word-wrap: break-word;
                    word-break: normal;
                    overflow: hidden;
                    ::v-deep ._root {
                        word-break: break-all;
                        text-overflow: ellipsis;
                        display: -webkit-box;
                        -webkit-box-orient: vertical;
                        -webkit-line-clamp: 8;
                        overflow: hidden;
                    }
                    ::v-deep .topic-text {
                        color: #f04a82;
                    }
                    ::v-deep .mentions-text {
                        color: #f04a82;
                    }
                }
            }

            .operation {
                height: 80rpx;
                display: flex;
                justify-content: space-around;
                align-items: center;
                color: #666;
            }
        }
    }
}
</style>
