<template>
    <div class="forum">
        <div class="forum-item">
            <div class="user-area">
                <div class="head-box">
                    <HeadImg
                        :userInfo="postInfo.users"
                        :isLink="true"
                        width="70rpx"
                        height="70rpx"
                    ></HeadImg>
                </div>
                <div class="user-info">
                    <div class="user">
                        <div
                            class="name"
                            @click="
                                goUrl(
                                    '/pages/my/userInfo?userAddress=' +
                                        postInfo.users.userAddress
                                )
                            "
                        >
                            {{ postInfo.users.nickname || i18n.my.cryptonym }}
                            <text class="userid"
                                >ID:{{
                                    postInfo.users.userAddress.slice(-4)
                                }}</text
                            >
                            <text v-show="postInfo.isFocus">{{
                                i18n.my.focus
                            }}</text>
                        </div>
                        <div class="more">
                            <text class="mr-24"
                                >{{ postInfo.read
                                }}<fa-FontAwesome
                                    type="fas fa-eye"
                                    size="28"
                                    class="ml-6"
                                    color="#666"
                                >
                                </fa-FontAwesome
                            ></text>
                            <fa-FontAwesome
                                type="fas fa-star"
                                size="28"
                                class="mr-10"
                                color="#ffc107"
                                v-show="postInfo.isStar"
                                @tap="star"
                            >
                            </fa-FontAwesome>
                            <fa-FontAwesome
                                type="far fa-star"
                                size="28"
                                class="mr-10"
                                color="#666"
                                v-show="!postInfo.isStar"
                                @tap="star"
                            ></fa-FontAwesome>
                        </div>
                    </div>
                    <div class="time">
                        <text class="mr-20">{{
                            $moment(postInfo.utcTime).format("yyyy-MM-DD HH:mm")
                        }}</text
                        >{{ i18n.index.source + postInfo.source }}
                    </div>
                </div>
            </div>
            <div class="main-content">
                <div class="text-content">
                    <mp-html :content="postInfo.payload" />
                </div>
                <div class="img-list">
                    <u-image
                        width="150rpx"
                        height="150rpx"
                        :src="postInfo.imgTx"
                        v-if="postInfo.imgTx"
                    ></u-image>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import HeadImg from "@/components/HeadImg";
import mpHtml from 'mp-html/dist/uni-app/components/mp-html/mp-html'
export default {
    components: {
        HeadImg,
        mpHtml
    },
    props: {
        postInfo: {
            type: Object,
            default: {},
        },
    },
    data() {
        return {};
    },
    computed: {
        //国际化
        i18n() {
            return this.$_i18n.messages[this.$_i18n.locale];
        },
    },
    watch: {
        postInfo: {
            handler() {
                this.$nextTick(() => {
                    var topicArr = document.getElementsByClassName(
                        "topic-text"
                    );
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
                });
            },
            deep: true,
        },
    },
    methods: {
        //是否收藏
        star() {
            let params = {
                hash: this.postInfo.hash,
            };
            this.$http.post("/Submit/contentStar", params).then((res) => {
                if (res.code === 200) {
                    this.postInfo.isStar = res.data.isStar;
                    this.postInfo.star = res.data.star;
                }
            });
        },
    },
};
</script>
<style lang="scss" scoped>
.forum {
    &-item {
        background-color: #fff;
        margin-bottom: 20rpx;
        border-bottom: 2rpx solid #e9e9e9;

        .user-area {
            padding: 20rpx;
            display: flex;

            .head-box {
                margin-right: 20rpx;
                position: relative;
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

                    .name {
                        font-size: 28rpx;

                        text {
                            color: #f04a82;
                            font-size: 20rpx;
                            margin-left: 20rpx;
                        }
                    }
                    text.userid {
                        font-size: 24rpx;
                        color: #91908e;
                        width: 100%;
                    }
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

            .text-content {
                font-size: 28rpx;
                margin-bottom: 20rpx;
                word-wrap: break-word;
                word-break: normal;
                overflow: hidden;
                /deep/ .topic-text {
                    color: #f04a82;
                }
            }
        }
    }
}
</style>
