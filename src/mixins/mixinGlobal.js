import { getStore } from '@/util/service'
import { useUserStore } from "@/stores/userStore";
import momentCN from '@/util/momentCN'
import { useI18n } from "vue-i18n";
const userStore = useUserStore();

export const mixinGlobal = {
  onLoad() {
    if (userStore.language == 'zh-cn') {
      this.$moment.locale('zh-cn', momentCN);
      useI18n.locale.value = 'zh-cn';
    }
    this.getSystemStatusBarHeight() //状态栏高度
  },
  methods: {
    //获取状态栏高度
    getSystemStatusBarHeight() {
      let _that = this
      uni.getSystemInfo({
        success(e) {
          _that.statusBarHeight = e.statusBarHeight
        },
      })
    },
    //验证第三方来源
    validThirdPartySource() {
      const thirdPartySource = getStore('thirdPartySource')
      if (thirdPartySource === 'box') {
        return true
      } else {
        return false
      }
    },
    uShowToast(title, icon, time) {
      uni.showToast({
        icon: icon == null ? 'none' : icon,
        title: title,
        duration: time || 2000,
      })
    },
    uHideToast() {
      uni.hideToast()
    },
    uShowLoading(title) {
      uni.showLoading({
        title: title,
      })
    },
    uHideLoading() {
      uni.hideLoading()
    },
    uShowModel(title, content, callback) {
      uni.showModal({
        title: title,
        content: content,
        success: function (res) {
          if (res.confirm) {
            callback()
            // console.log('用户点击确定');
          } else if (res.cancel) {
            // console.log('用户点击取消');
          }
        },
      })
    },
    //uni自带
    uSetBarTitle(title) {
      uni.setNavigationBarTitle({
        title: title,
      })
    },
    goUrl(url) {
      uni.navigateTo({
        url: url,
      })
    },
    redirectUrl(url) {
      uni.redirectTo({
        url: url,
      })
    },
    reLaunchUrl(url) {
      uni.reLaunch({
        url: url,
      })
    },
    switchTabUrl(url) {
      uni.switchTab({
        url: url,
      })
    },
    goBackUrl(url) {
      uni.navigateBack({
        delta: url,
      })
    },
    //uni自带结束
  }
}