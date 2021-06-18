<template>
    <div class="topic">
        <div class="forum">
            <div
                class="forum-item"
                v-for="(item, index) in postList"
                :key="index"
            >
                <div class="user-area">
                    <div class="head-box">
                        <image
                            class="user-head"
                            mode="aspectFill"
                            :src="item.users.portrait"
                            v-if="item.users.portrait"
                        ></image>
                        <image
                            class="user-head"
                            mode="aspectFill"
                            src="@/static/default_head.png"
                            v-else
                        ></image>
                        <div class="level">
                            <text class="text"
                                >V{{ item.users.userActive }}</text
                            >
                        </div>
                    </div>
                    <div class="user-info">
                        <div class="user">
                            <div class="name">
                                {{ item.users.nickname || i18n.my.cryptonym }}
                                <text class="userid"
                                    >ID:{{
                                        item.users.userAddress.slice(-4)
                                    }}</text
                                >
                                <text v-show="item.isFocus">{{
                                    i18n.my.focus
                                }}</text>
                            </div>
                            <div class="more">
                                <fa-FontAwesome
                                    type="fas fa-angle-down"
                                    size="36"
                                    class="mr-10"
                                    color="#cecece"
                                    @tap="moreOpera(item)"
                                >
                                </fa-FontAwesome>
                            </div>
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
                        <u-parse :html="item.payload" :show-with-animation="true"></u-parse>
                    </div>
                    <div class="img-list">
                        <u-image
                            width="150rpx"
                            height="150rpx"
                            :src="item.imgTx"
                            v-if="item.imgTx"
                        ></u-image>
                    </div>
                </div>
                <div class="operation">
                    <div class="item" @tap="goUrl('/pages/index/detail?hash=' + item.hash)">
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
        <u-action-sheet
            :list="moreList"
            v-model="moreShow"
            @click="handleOpera"
        ></u-action-sheet>
    </div>
</template>
<script>
export default {
    props: {
        postList: {
            type: Array,
            default: [],
        },
    },
    data() {
        return {
            moreShow: false, //下箭头控制显示更多操作
        };
    },
    computed: {
        //国际化
        i18n() {
            return this.$_i18n.messages[this.$_i18n.locale];
        },
        //显示更多操作
        moreList() {
            return [
                {
                    text: this.i18n.index.focus,
                    subText: this.i18n.index.focusText,
                },
                {
                    text: this.i18n.index.complain,
                    subText: this.i18n.index.complainText,
                },
                {
                    text: this.i18n.index.aeternal,
                    subText: this.i18n.index.aeternalText,
                },
                {
                    text: this.i18n.index.aeknow,
                    subText: this.i18n.index.aeknowText,
                },
            ];
        },
    },
    methods: {
        //更多操作
        moreOpera(item) {
            this.currentForum = item;
            this.moreShow = true;
            if (this.currentForum.isFocus) {
                this.moreList[0] = {
                    text: this.i18n.index.cancelFocus,
                    subText: this.i18n.index.cancelFocusText,
                };
            } else {
                this.moreList[0] = {
                    text: this.i18n.index.focus,
                    subText: this.i18n.index.focusText,
                };
            }
        },
        //更多操作选择事件
        handleOpera(index) {
            if (index === 0) {
                this.focus();
            } else if (index === 1) {
            } else if (index === 2) {
                window.open(
                    "https://mainnet.aeternal.io/transactions/" +
                        this.currentForum.hash
                );
            } else if (index === 3) {
                window.open(
                    "https://www.aeknow.org/block/transaction/" +
                        this.currentForum.hash
                );
            }
        },
        //是否点赞
        praise(item) {
            let params = {
                hash: item.hash,
                type: "topic",
            };
            this.$http.post("/Submit/praise", params).then((res) => {
                if (res.code === 200) {
                    item.isPraise = res.data.isPraise;
                    item.praise = res.data.praise;
                }
            });
        },
        //是否关注
        focus() {
            let params = {
                userAddress: this.currentForum.users.userAddress,
            };
            this.$http.post("/Submit/focus", params).then((res) => {
                if (res.code === 200) {
                    for (let i = 0; i < this.postList.length; i++) {
                        if (
                            this.postList[i].users.userAddress ===
                            this.currentForum.users.userAddress
                        ) {
                            this.postList[i].isFocus = res.data.isFocus;
                        }
                    }
                }
            });
        },
        //是否收藏
        star(item) {
            let params = {
                hash: item.hash,
            };
            this.$http.post("/Submit/contentStar", params).then((res) => {
                if (res.code === 200) {
                    item.isStar = res.data.isStar;
                    item.star = res.data.star;
                }
            });
        },
    },
    watch: {},
};
</script>
<style lang="scss" scoped>
.topic {
    .forum {
        &-item {
            background-color: #fff;
            border-bottom: 2rpx solid #ececec;
            margin-bottom: 20rpx;

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
                border-bottom: 2rpx solid #e9e9e9;

                .text-content {
                    margin-bottom: 20rpx;
                    word-wrap: break-word;
                    word-break: normal;
                    overflow: hidden;
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
