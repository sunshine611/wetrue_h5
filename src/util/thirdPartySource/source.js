import store from "@/store";
import Backend from "@/util/backend";

export const setThirdPartySource = (option) =>{
    //设置第三方来源
	if (option.source === "box" && !!option.userAddress) {
        store.commit("user/SET_TOKEN", option.userAddress); //设置token
        store.commit("user/SET_TPSOURCE", option.source); //标记第三方来源
        store.commit("user/SET_PASSWORD", option.source); //伪装存在密码
        Backend.setConfigInfo(option.userAddress); //设置 configInfo
        if (option.language === "en") { //设置语言
             store.commit("user/SET_LANGUAGE", "en");
        } else {
            store.commit("user/SET_LANGUAGE", "zh-cn");
        }
    }
}