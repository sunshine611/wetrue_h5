<template>
    <div class="user">
        <u-cell-group :border="false">
            <div v-for="item in userList" :key="item.userAddress">
                <u-cell-item
                    @click="
                        goUrl(
                            '/pages/my/userInfo?userAddress=' +
                                item.userAddress
                        )
                    "
                >
                    <div slot="icon" class="mr-20">
                        <HeadImg
                            :userInfo="item"
                            width="100rpx"
                            height="100rpx"
                        ></HeadImg>
                    </div>
                    <div slot="label">
                        <text class="mr-16">{{ i18n.components.focus + ": " + item.focus }}</text
                        ><text class="mr-16">{{ i18n.components.fans + ": " + item.fans }}</text>
                        <text class="mr-16">{{ i18n.components.topic + ": " + item.topic }}</text>
                        <text>{{ i18n.components.active + ": " + item.active }}</text>
                    </div>
                    <div slot="title">
                        <Name :userInfo="item"></Name>
                    </div>
                    <div slot="right-icon" class="amount"></div>
                </u-cell-item>
            </div>
        </u-cell-group>
    </div>
</template>
<script>
import HeadImg from "@/components/HeadImg.vue";
import Name from "@/components/Name";
export default {
    components: {
        HeadImg,
        Name
    },
    props: {
        userList: {
            type: Array,
            default: ()=>[],
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
