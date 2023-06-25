import Request from 'luch-request'
import { baseUrl } from '@/config/config.js'
import pinia from "@/stores/store";
import { useUserStore } from "@/stores/userStore";
import queryParams from "@/components/vk-uview-ui/libs/function/queryParams";
const userStore = useUserStore(pinia);

var http = new Request({
  baseURL: baseUrl,
  custom: {
    isToast: false,
  },
})
//请求前拦截器
http.interceptors.request.use((config) => {
  config.header = {
    'Content-type': 'application/x-www-form-urlencoded',
    key: userStore.token,
    'chain-id': 457,
  }
  if (!!userStore.keystore && JSON.stringify(userStore.keystore) !== '{}') {
    if (!userStore.password) {
      let pageObj = getCurrentPages() //实例化页面栈
      if (pageObj[0]) {
        let link = pageObj[0].route + queryParams(pageObj[0].$page.options)
        uni.navigateTo({
          url: `/pages/login/password?link=${encodeURIComponent(link)}`,
          success: res => {console.log(res)},
          fail: (res) => {console.log(res)},
          complete: () => {}
        })
      }
    }
  }
  if (config.custom.isToast) {
    uni.showLoading({
      title: 'Loading',
    })
  }
  return config
})
//请求成功后拦截器
http.interceptors.response.use((res) => {
  if (res.data.code === 401) {
    uni.showToast({
      icon: 'none',
      title: res.data.msg,
    })
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/my/index',
      })
    }, 1000)
  }
  if (res.config.custom.isToast) {
    uni.hideLoading()
  }
  return res.data
})
export default http
