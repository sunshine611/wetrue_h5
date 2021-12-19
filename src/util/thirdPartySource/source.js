import store from "@/store";
import { setConfigInfo } from "@/util/thirdPartySource/backend";

export const setThirdPartySource = function(option){
    //设置第三方来源
	if (option.source === "box" && !!option.userAddress) {
        uni.hideTabBar(); //隐藏底部bar
        store.commit("user/SET_TOKEN", option.userAddress); //设置token
        store.commit("user/SET_TPSOURCE", option.source); //标记第三方来源
        store.commit("user/SET_PASSWORD", option.source); //伪装存在密码
        setConfigInfo(option.userAddress); //设置 configInfo
    }
}