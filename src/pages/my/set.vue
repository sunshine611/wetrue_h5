<script setup>
import { ref, getCurrentInstance } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { baseUrl, setConfigUrl } from "@/config/config.js";
import { mixinUtils } from'@/mixins/mixinUtils'
import { useUserStore } from "@/stores/userStore";
const userStore = useUserStore();
const { proxy } = getCurrentInstance();


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
                    <fa-FontAwesome
                        type="fab fa-skyatlas"
                        size="32"
                        class="mr-20"
                        color="#f04a82"
                        v-show="userStore.networkSetting == 'io'"
                    >
                    </fa-FontAwesome>
                    <fa-FontAwesome
                        type="fab fa-skyatlas"
                        size="32"
                        class="mr-20"
                        color="#03a9f4"
                        v-show="userStore.networkSetting == 'cc'"
                    >
                    </fa-FontAwesome>
                </template>
            </u-cell-item>

            <u-cell-item
                :title="$t('my.switchLanguage')"
                @click="mixinUtils.selectLanguage"
                :arrow="false"
            >   
                <template v-slot:icon>
                    <fa-FontAwesome
                        type="fas fa-language"
                        size="32"
                        class="mr-20"
                        color="#f04a82"
                        v-show="userStore.language == 'zh-cn'"
                    >
                    </fa-FontAwesome>
                    <fa-FontAwesome
                        type="fas fa-language"
                        size="32"
                        class="mr-20"
                        color="#03a9f4"
                        v-show="userStore.language == 'en'"
                    >
                    </fa-FontAwesome>
                </template>
            </u-cell-item>
        </u-cell-group>
    </view>
</template>

<style lang="scss" scoped>
.setting {
}
</style>
