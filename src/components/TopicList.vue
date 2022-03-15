<template>
    <div class="topic">
        <div class="forum">
            <div
                class="forum-item"
                v-for="(item, index) in postList"
                :key="index"
            >
                <div class="focus" v-show="item.isFocus">
                    <fa-FontAwesome
                        type="fas fa-heart"
                        size="24"
                        class="star"
                        color="#fff"
                    >
                    </fa-FontAwesome>
                </div>
                <div class="user-area">
                    <div class="head-box">
                        <HeadImg
                            :userInfo="item.users"
                            :isLink="true"
                            width="70rpx"
                            height="70rpx"
                        ></HeadImg>
                    </div>
                    <div class="user-info">
                        <div class="user">
                            <Name :userInfo="item.users"></Name>
                            <TopicMore :topicInfo="item" :postList="postList" class="mr-10"></TopicMore>
                        </div>
                        <div class="time">
                            <text>{{ $moment(item.utcTime).fromNow() }}</text
                            >{{ i18n.index.source + item.source }}
                        </div>
                    </div>
                </div>
                <div
                    class="main-content"
                    @tap="goUrl('/pages/index/detail?hash=' + item.hash)"
                >
                    <div class="text-content">
                        <mp-html :content="item.payload"/>
                    </div>
                    <div
                        class="img-list"
                        v-for="(items, index) in item.mediaList"
                        :key="index"
                    >
                        <u-image
                            width="200rpx"
                            height="200rpx"
                            :src="ipfsUrl + items.image"
                            v-if="items.image"
                        ></u-image>
                    </div>
                        <u-image
                            width="200rpx"
                            height="200rpx"
                            :src="item.image"
                            v-if="item.image"
                        ></u-image>
                        <a
                            class="topic-url"
                            target="_blank"
                            rel="noopener noreferrer"
                            :href="item.url"
                            v-if="item.url"
                        ><text>
                                {{ item.simpleUrl }}
                            </text>
                        </a>
                </div>
                <div class="operation">
                    <div
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
                    </div>
                    <div class="item" @tap="star(item)">
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
                    </div>
                    <div class="item" @tap="praise(item)">
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
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import HeadImg from "@/components/HeadImg";
import Name from "@/components/Name";
import TopicMore from "@/components/TopicMore";
import mpHtml from "mp-html/dist/uni-app/components/mp-html/mp-html";

export default {
    components: {
        HeadImg,
        mpHtml,
        Name,
        TopicMore,
    },
    props: {
        postList: {
            type: Array,
            default: [],
        },
        ipfsUrl: {
            default: "https://dweb.link/ipfs/",
        },
    },
    data() {
        return {};
    },
    mounted() {
        //暴露方法名"receiveWeTrueMessage"
        window["receiveWeTrueMessage"] = async (res) => {
            if (res.code == 200) {
                this.postHashToWeTrue(res,true).then((res) => {
                    this.releaseCallback(res);
                });
            }
        };
    },
    computed: {
        //国际化
        i18n: {
            get() {
                return this.$_i18n.messages[this.$_i18n.locale];
            },
        },
    },
    watch: {
        postList: {
            handler() {
                this.$nextTick(() => {
                    const topicArr = document.getElementsByClassName("topic-text");
                    if (topicArr.length > 0) {
                        for (let i = 0; i < topicArr.length; i++) {
                            topicArr[i].addEventListener(
                                "click",
                                (e) => {
                                    let text = topicArr[i].innerText;
                                    this.goUrl(
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
                                        this.goUrl(
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
            },
            deep: true,
        },
    },
    methods: {
        //是否点赞
        praise(item) {
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
            this.$http.post("/Submit/praise", params).then((res) => {
                if (res.code === 200) {
                    item.isPraise = res.data.isPraise;
                    item.praise = res.data.praise;
                }
            });
        },
        //是否收藏
        star(item) {
            let payload = {
                action: item.isStar,
                content: item.hash,
            };
            this.wetrueSend("star", payload).then((res) => {
                this.releaseCallback(res);
            });
        },
        releaseCallback(res){
            if (res.code == 200) {
                item.isStar = res.data.isStar;
                item.star = res.data.star;
            }
            this.uHideLoading();
        },
    },
};
</script>
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
                border-bottom: 2rpx solid #e9e9e9;

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
                .topic-url {
                    color: #f04a82;
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
