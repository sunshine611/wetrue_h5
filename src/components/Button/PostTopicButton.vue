<template>
    <view class="post safe-area-inset-bottom" v-if="validLogin()">
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
export default {
    components: {
    },
    props: {
        postTopicInfo: {
            type: Object,
            default: () => {},
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
            console.log(this.postTopicInfo);
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
