<template>
    <view class="setting">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-navbar
            :is-fixed="false"
            :title="$t('my.setting.setting')"
            v-show="!validThirdPartySource()"
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
                :title="$t('my.switchNetwork',[network])"
                @click="selectNetwork"
                :arrow="false"
            >
                <fa-FontAwesome
                    slot="icon"
                    type="fab fa-skyatlas"
                    size="32"
                    class="mr-20"
                    color="#f04a82"
                    v-show="network === 'io'"
                >
                </fa-FontAwesome>
                <fa-FontAwesome
                    slot="icon"
                    type="fab fa-skyatlas"
                    size="32"
                    class="mr-20"
                    color="#03a9f4"
                    v-show="network === 'cc'"
                >
                </fa-FontAwesome>
            </u-cell-item>

            <u-cell-item
                :title="$t('my.switchLanguage')"
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
import { baseUrl, setConfigUrl } from "@/config/config.js";

export default {
    components: {},
    data() {
        return {
            language: getStore("language"),
            network: getStore("networkSetting"),
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
        //切换网络
        selectNetwork() {
            if (getStore("networkSetting") === "io") {
                setStore("networkSetting", "cc");
            } else if (getStore("networkSetting") === "cc") {
                setStore("networkSetting", "io");
            }
            setConfigUrl();            
            this.$http.config.baseURL = baseUrl
            this.network = getStore("networkSetting");
        },
    },
};
</script>

<style lang="scss" scoped>
.setting {
}
</style>
