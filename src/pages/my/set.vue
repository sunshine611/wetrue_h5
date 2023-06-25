<script setup>
import { getCurrentInstance } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { baseUrl, setConfigUrl } from "@/config/config.js";
import { useI18n } from "vue-i18n";
import { Icon } from '@iconify/vue';
import { useUserStore } from "@/stores/userStore";
const userStore = useUserStore();
const { proxy } = getCurrentInstance();
const { locale } = useI18n();

onLoad ( () => {
    proxy.uSetBarTitle(proxy.$t('titleBar.set'));
})

//切换网络
const selectNetwork = () => {
    if (userStore.networkSetting == "io") {
        userStore.setNetwork('cc')
    } else if (userStore.networkSetting == "cc") {
        userStore.setNetwork('io')
    }
    setConfigUrl();            
    proxy.$http.config.baseURL = baseUrl
}
//选择语言
const changeLang = () => {
    let lang
    if (userStore.language == 'zh-cn') {
        lang = 'en'
    } else if (userStore.language == 'en') {
        lang = 'zh-cn'
    }
    userStore.setLanguage(lang)
    locale.value = lang;
    proxy.$moment.locale(lang);
};
</script>

<template>
    <view class="setting">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-navbar
            :is-fixed="false"
            :title="$t('my.setting.setting')"
            v-show="!validThirdPartySource()"
        >
            <template v-slot:right>
                <u-icon
                    name="home"
                    class="mr-30"
                    size="34"
                    color="#f04a82"
                    @click="reLaunchUrl('../index/index')"
                ></u-icon>
            </template>
        </u-navbar>
        <u-cell-group :border="false">
            <u-cell-item
                :title="$t('my.switchNetwork',[userStore.networkSetting])"
                @click="selectNetwork"
                :arrow="false"
            >
                <template v-slot:icon>
                    <Icon 
                        icon="fa:skyatlas"
                        class="mr-20"
                        width="32"
                        height="32"
                        :color="userStore.networkSetting == 'io' ? '#f04a82' : '#03a9f4'"
                    />
                </template>
            </u-cell-item>

            <u-cell-item
                :title="$t('my.switchLanguage')"
                @click="changeLang"
                :arrow="false"
            >   <template v-slot:icon>
                    <Icon 
                        icon="cil:language"
                        class="mr-20"
                        width="32"
                        height="32"
                        :color="userStore.language == 'zh-cn' ? '#f04a82' : '#03a9f4'"
                    />
                </template>
            </u-cell-item>
        </u-cell-group>
    </view>
</template>

<style lang="scss" scoped>
.setting {
}
</style>
