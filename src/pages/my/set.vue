<template>
    <view class="seting">
        <view :style="`padding-top:${statusBarHeight}px`"></view>
        <u-navbar
            :is-fixed="false"
            :title="i18n.my.set"
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
                :title="i18n.my.userInfo"
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
                :title="i18n.my.languageSwitch"
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
import { getStore, setStore } from "@/util/service";
import moment from "moment";
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
    onLoad(option) {
        this.getSystemStatusBarHeight(); //状态栏高度
        this.uSetBarTitle(this.i18n.titleBar.set);
    },
    computed: {
        ...mapGetters(["token"]),
        //国际化
        i18n: {
            get() {
                return this.$_i18n.messages[this.$_i18n.locale];
            },
        },
    },
    methods: {
        //切换语言
        selectLanguage() {
            if (getStore("language") === "zh-cn") {
                setStore("language", "en");
            } else if (getStore("language") === "en") {
                setStore("language", "zh-cn");
            }
            //控制语言显示
            this.language = getStore("language");
            moment.locale(this.language);
            this.$_i18n.locale = this.language;
        },
    },
};
</script>

<style lang="scss" scoped>
.seting {
}
</style>
