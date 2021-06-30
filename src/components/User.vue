<template>
    <div class="user">
        <u-cell-group class="cell-box">
            <div v-for="item in userList" :key="item.userAddress">
                <u-cell-item
                    class="cell-out"
                    @click="
                        goUrl(
                            '/pages/my/topicList?type=user&userAddress=' +
                                item.userAddress
                        )
                    "
                >
                    <div slot="icon" class="mr-20">
                        <HeadImg
                            :src="item.portrait"
                            :userActive="item.userActive"
                            width="100rpx"
                            height="100rpx"
                        ></HeadImg>
                    </div>
                    <div slot="label">
                        <text class="mr-20">关注:{{ item.focus }}</text
                        ><text class="mr-20">粉丝:{{ item.fans }}</text>
                        <text>活跃:{{ item.active }}</text>
                    </div>
                    <div slot="title">
                        <text class="mr-20">{{ item.nickname || "匿名" }}</text>
                        <text class="user-id"
                            >ID:{{ item.userAddress.slice(-4) }}</text
                        >
                    </div>
                    <div slot="right-icon" class="amount"></div>
                </u-cell-item>
            </div>
        </u-cell-group>
    </div>
</template>
<script>
import HeadImg from "@/components/HeadImg.vue";
export default {
    components: {
        HeadImg,
    },
    props: {
        userList: {
            type: Array,
            default: [],
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
    watch: {},
    methods: {},
};
</script>
<style lang="scss" scoped>
.user {
    .user-id {
        font-size: 24rpx;
        color: #91908e;
    }
}
</style>
