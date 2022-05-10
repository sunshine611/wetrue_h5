<template>
    <view class="seting">
        <view :style="`padding-top:${statusBarHeight}px`"></view>
        <u-navbar
            :is-fixed="false"
            :title="$t('my.set')"
        >
            <div slot="right">
                <u-icon
                    name="home"
                    class="mr-30"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('../index/index')"
                ></u-icon>
            </div>
        </u-navbar>
        <u-cell-group :border="false">
            <u-cell-item
                :title="$t('my.userInfo')"
                @click="goUrl('infoEdit')"
            >
            <fa-FontAwesome
                    slot="icon"
                    type="fas fa-user"
                    size="32"
                    class="mr-20"
                    color="#f04a82"
                >
                </fa-FontAwesome>
            </u-cell-item>
            <u-cell-item
                :title="$t('my.blacklistManage')"
                @click="goUrl('blacklistManage')"
            >
            <fa-FontAwesome
                    slot="icon"
                    type="fas fa-user"
                    size="32"
                    class="mr-20"
                >
                </fa-FontAwesome>
            </u-cell-item>
            <u-cell-item
                :title="$t('my.languageSwitch')"
                @click="selectLanguage"
                :arrow="false"
            >
                <fa-FontAwesome
                    slot="icon"
                    type="fas fa-language"
                    size="32"
                    class="mr-20"
                    color="#f04a82"
                    v-show="language === 'zh-cn'"
                >
                </fa-FontAwesome>
                <fa-FontAwesome
                    slot="icon"
                    type="fas fa-language"
                    size="32"
                    class="mr-20"
                    color="#03a9f4"
                    v-show="language === 'en'"
                >
                </fa-FontAwesome>
            </u-cell-item>
        </u-cell-group>
    </view>
</template>

<script>
import { mapGetters } from "vuex";
import { getStore } from "@/util/service";
export default {
    components: {},
    data() {
        return {
            language: getStore("language"),
        };
    },
    //下拉刷新
    onPullDownRefresh() {},
    //上拉加载
    onReachBottom() {},
    onLoad() {
        this.uSetBarTitle(this.$t('titleBar.set'));
    },
    computed: {
        ...mapGetters(["token"]),
    },
    methods: {

    },
};
</script>

<style lang="scss" scoped>
.seting {
}
</style>
