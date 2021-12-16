<template>
    <view class="post safe-area-inset-bottom" v-if="validToken()">
        <fa-FontAwesome
            type="fas fa-plus"
            size="36"
            color="rgba(255,255,255,0.9)"
            @tap="post()"
        >
        </fa-FontAwesome>
    </view>
</template>
<script>

import { getThirdPartySource } from "@/util/thirdPartySource/source";
import { boxPost } from "@/util/thirdPartySource/boxPost";

export default {
    components: {
    },
    props: {
        postTopicInfo: {
            type: Object,
            default: () => {
                return {}
            },
        },
    },
    data() {
        return {
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
    },
    methods: {
        //发帖
        post() {
            //第三方来源box发布主贴
            if (getThirdPartySource() === "box") {
                let boxPostPayload = {boxPostType: "topic"};
                boxPost(boxPostPayload);
                return false;
            }
            //WeTrue登陆发帖
            if (this.postTopicInfo.type === 'topic') {
                this.goUrl(
                    "editor?topic=" + this.postTopicInfo.keyword
                );
            } else {
                this.goUrl('editor');
            }
        },
    },
};
</script>
<style lang="scss" scoped>
.post {
        position: fixed;
        z-index: 1000;
        right: 60rpx;
        bottom: 150rpx;
        background: rgba(#f04a82, 0.75);
        box-shadow: 0rpx 0rpx 20rpx 5rpx rgba(#f04a82, 0.3);
        width: 80rpx;
        height: 80rpx;
        border-radius: 40rpx;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
