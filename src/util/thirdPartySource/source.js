import { getStore, setStore } from "@/util/service";

export const getThirdPartySource = function(){
    let value = getStore("thirdPartySource");
    if (value === "box") {
		return value;
	} else {
		return "";
	}
}

export const setThirdPartySource = function(option){
	if (option.source === "box" && !!option.userAddress) {
        //隐藏底部bar
        uni.hideTabBar();
        //设置token请求头
        setStore (
            "token",
            option.userAddress
        );
        //标记第三方来源
        setStore (
            "thirdPartySource",
            option.source
        );
    }
}