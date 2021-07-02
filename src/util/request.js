import Request from "@/js_sdk/luch-request/luch-request/index.js";
import { baseUrl } from "@/config/config.js";
import store from "../store/index.js";
import { getStore } from "@/util/service";
import queryParams from "@/uview-ui/libs/function/queryParams";
var http = new Request({
  baseURL: baseUrl,
  custom: {
    isToast: false,
  },
});
//请求前拦截器
http.interceptors.request.use((config) => {
  config.header = {
    "Content-type": "application/x-www-form-urlencoded",
    "ak-token": getStore("token"),
  };
  if (!!getStore("keystore")) {
    if (!store.state.user.password) {
      let pageObj = getCurrentPages(); //实例化页面栈
      let link = pageObj[0].route + queryParams(pageObj[0].options);
      uni.navigateTo({
        url: `/pages/login/password?link=${encodeURIComponent(link)}`,
      });
    }
  }
  return config;
});
//请求成功后拦截器
http.interceptors.response.use((res) => {
  if (res.data.code === 401) {
    uni.showToast({
      icon: "none",
      title: res.data.msg,
    });
    setTimeout(() => {
      uni.reLaunch({
        url: "/pages/my/index",
      });
    }, 1000);
  }
  return res.data;
});
export default http;
