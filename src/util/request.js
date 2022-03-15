import Request from "luch-request";
import { baseUrl } from "@/config/config.js";
import store from "../store/index.js";
import { getStore } from "@/util/service";

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
    if (
        !!getStore("keystore") &&
        JSON.stringify(getStore("keystore")) !== "{}"
    ) {
        if (!store.state.user.password) {
            let pageObj = getCurrentPages(); //实例化页面栈
            if (pageObj[0]) {
                let link = pageObj[0].route + uni.$u.queryParams(pageObj[0].options);
                uni.navigateTo({
                    url: `/pages/login/password?link=${encodeURIComponent(
                        link
                    )}`,
                });
            }
        }
    }
    if (config.custom.isToast) {
        uni.showLoading({
            title: "Loading",
        });
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
    if (res.config.custom.isToast) {
        uni.hideLoading();
    }
    return res.data;
});
export default http;
