<template>
    <div class="forum">
        <div class="forum-item">
            <div class="focus" v-show="postInfo.isFocus">
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
                        :userInfo="postInfo.users"
                        :isLink="true"
                        width="70rpx"
                        height="70rpx"
                    ></HeadImg>
                </div>
                <div class="user-info">
                    <div class="user">
                        <Name :userInfo="postInfo.users"></Name>
                        <TopicMore
                            :topicInfo="postInfo"
                            class="mr-10"
                        ></TopicMore>
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
                    <mp-html
                        :content="postInfo.payload"
                        :selectable="true"
                        ref="mpHtml"
                    />
                </div>
                <div class="img-list">
                    <u-image
                        width="150rpx"
                        height="150rpx"
                        :src="postInfo.imgTx"
                        v-if="postInfo.imgTx"
                    ></u-image>
                </div>
                <div class="reward" v-if="postInfo.rewardList.length > 0">
                    <div
                        class="reward-list"
                        v-for="(item, index) in postInfo.rewardList.slice(0, 6)"
                        :key="index"
                    >
                        <u-icon
                            name="thumb-up-fill"
                            color="#f04a82"
                            class="mr-6"
                        ></u-icon
                        >{{ item.nickname }}
                        [ {{ item.sender_id.slice(-4) }} ]
                        {{ i18n.components.reward }}
                        <text class="name">
                            {{ balanceFormat(item.amount, 1) }}
                        </text> WTT
                    </div>
                    <u-gap
                        height="5"
                        v-if="postInfo.rewardList.length > 6"
                    ></u-gap>
                    <div
                        class="more"
                        v-if="postInfo.rewardList.length > 6"
                        @click="rewardRecordShow = true"
                    >
                        {{ i18n.components.viewMore }}
                    </div>
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
                        class="mr-24"
                        color="#ffc107"
                        v-show="postInfo.isStar"
                        @tap="star"
                    >
                    </fa-FontAwesome>
                    <fa-FontAwesome
                        type="far fa-star"
                        size="28"
                        class="mr-24"
                        color="#666"
                        v-show="!postInfo.isStar"
                        @tap="star"
                    ></fa-FontAwesome>
                    <fa-FontAwesome
                        type="far fa-copy"
                        size="28"
                        class="mr-24"
                        color="#666"
                        id="copy"
                        @click="copy"
                    ></fa-FontAwesome>
                    <fa-FontAwesome
                        type="fas fa-share-alt"
                        size="28"
                        class="mr-10"
                        color="#666"
                        id="share"
                        @click="share"
                    ></fa-FontAwesome>
                </div>
            </div>
        </div>
        <RewardRecord
            v-model="rewardRecordShow"
            :record="postInfo.rewardList"
        ></RewardRecord>
    </div>
</template>
<script>
import HeadImg from "@/components/HeadImg";
import mpHtml from "mp-html/dist/uni-app/components/mp-html/mp-html";
import UGap from "../uview-ui/components/u-gap/u-gap.vue";
import RewardRecord from "@/components/RewardRecord";
import Name from "@/components/Name";
import TopicMore from "@/components/TopicMore";
import Clipboard from "clipboard";
import { mapGetters } from "vuex";
export default {
    components: {
        HeadImg,
        mpHtml,
        RewardRecord,
        Name,
        TopicMore,
        UGap,
    },
    props: {
        postInfo: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            rewardRecordShow: false, //控制打赏记录弹层
        };
    },
    computed: {
        ...mapGetters(["configInfo"]),
        //国际化
        i18n: {
            get() {
                return this.$_i18n.messages[this.$_i18n.locale];
            },
        },
    },
    watch: {
        postInfo: {
            handler() {
                this.$nextTick(() => {
                    var topicArr = uni.createSelectorQuery().select(
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
        copy() {
            let text = this.$refs.mpHtml.getText();
            // #ifdef H5
            let clipboard = new Clipboard("#copy", {
                text: (trigger) => {
                    uni.showToast({
                        title: this.i18n.components.copySuccess,
                        icon: "none",
                        duration: 600,
                    });
                    return text;
                },
            });
            // #endif
            // #ifndef H5
            uni.setClipboardData({
                data: text,
                success: function() {
                    uni.showToast({
                        title: this.i18n.components.copySuccess,
                        icon: "none",
                        duration: 600,
                    });
                },
            });
            // #endif
        },
        //分享
        share() {
            let url = this.configInfo.frontEndUrl + "" + this.__page__.fullPath;
            let text = this.$refs.mpHtml.getText();
            let shareText = "";
            if (text.length > 100) {
                shareText =
                    "WeTrue:\n" + url + "\n" + text.slice(0, 100) + "...";
            } else {
                shareText = "WeTrue:\n" + url + "\n" + text.slice(0, 100);
            }
            // #ifdef H5
            let clipboard = new Clipboard("#share", {
                text: (trigger) => {
                    uni.showToast({
                        title: this.i18n.components.copySuccess,
                        icon: "none",
                        duration: 600,
                    });
                    return shareText;
                },
            });
            // #endif
            // #ifndef H5
            uni.setClipboardData({
                data: shareText,
                success: function() {
                    uni.showToast({
                        title: this.i18n.components.copySuccess,
                        icon: "none",
                        duration: 600,
                    });
                },
            });
            // #endif
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
                font-size: 32rpx;
                margin-bottom: 20rpx;
                word-wrap: break-word;
                word-break: normal;
                overflow: hidden;
                /deep/ .topic-text {
                    color: #f04a82;
                }
            }
            .reward {
                background: #f1f1f1;
                padding: 14rpx 30rpx;
                .reward-list {
                    margin: 10rpx 0;
                    .name {
                        color: #f04a82;
                    }
                }
            }
            .more {
                padding: 20rpx 0 0 0;
                border-top: 2rpx solid #e5e5e5;
                color: #666;
                text-align: right;
            }
        }
    }
}
</style>
