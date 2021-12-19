import store from "@/store";
import { setConfigInfo } from "@/util/thirdPartySource/backend";

export const setThirdPartySource = function(option){
    //设置第三方来源
	if (option.source === "box" && !!option.userAddress) {
        //隐藏底部bar
        uni.hideTabBar();
        //设置token
        store.commit("user/SET_TOKEN", option.userAddress);
        //标记第三方来源
        store.commit("user/SET_TPSOURCE", option.source);
        //设置 configInfo
        setConfigInfo(option.userAddress);
    }
}