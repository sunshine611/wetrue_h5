<template>
    <div class="forum">
            <div class="forum-item">
                <div class="user-area">
                    <div class="head-box">
                        <image
                            class="user-head"
                            mode="aspectFill"
                            :src="postInfo.users.portrait"
                            v-if="postInfo.users.portrait"
                        ></image>
                        <image
                            class="user-head"
                            mode="aspectFill"
                            src="@/static/default_head.png"
                            v-else
                        ></image>
                        <div class="level">
                            <text class="text"
                                >V{{ postInfo.users.userActive }}</text
                            >
                        </div>
                    </div>
                    <div class="user-info">
                        <div class="user">
                            <div class="name">
                                {{
                                    postInfo.users.nickname || i18n.my.cryptonym
                                }}
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
                            <text>{{
                                $moment(postInfo.utcTime).fromNow()
                            }}</text
                            >{{ i18n.index.source + postInfo.source }}
                        </div>
                    </div>
                </div>
                <div class="main-content">
                    <div class="text-content">
                        <u-parse
                            :html="postInfo.payload"
                            :show-with-animation="true"
                        ></u-parse>
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
export default {
    props: {
        postInfo: {
            type: Object,
            default: {},
        },
    },
    data() {
        return {
            
        };
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

                    .user-head {
                        width: 70rpx;
                        height: 70rpx;
                        border-radius: 50%;
                        box-sizing: border-box;
                    }

                    .level {
                        position: absolute;
                        right: -8rpx;
                        bottom: 2rpx;
                        width: 34rpx;
                        height: 34rpx;
                        background-color: #d62900;
                        font-size: 24rpx;
                        border-radius: 50%;
                        color: #fff;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        border: 4rpx solid #ffd982;
                        box-sizing: border-box;

                        .text {
                            transform: scale(0.65);
                        }
                    }
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